import { randomUUID } from "node:crypto"
import { isIP } from "node:net"
import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify"
import type { AuditAnswerValue } from "../../src/features/audit/types"
import type { AuditDto, AuditSummaryDto, CreatedAuditDto } from "../../src/lib/contracts/audit"
import { auditRateLimitKey, AuditRateLimiter } from "./rate-limit"
import { authenticatedUserId } from "../auth/session"
import { allowsBrowserMutation } from "../browser-mutation"
import {
  claimGuestAudits,
  createAudit,
  getAudit,
  listUserAudits,
  saveAuditAnswer,
  submitAudit,
  type AuditOwner,
} from "./service"

const GUEST_COOKIE = "safecheck_guest"
const GUEST_COOKIE_MAX_AGE = 60 * 60 * 24 * 30
const GUEST_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
} as const
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const auditNotFound = { code: "AUDIT_NOT_FOUND", message: "Audit not found" }
const invalidAuditId = { code: "INVALID_AUDIT_ID", message: "Invalid audit id" }
const unsupportedVersion = {
  code: "AUDIT_VERSION_UNSUPPORTED",
  message: "This audit questionnaire or scoring version is not supported",
}
const auditPageSize = 20
const maxAuditPageSize = 50

function decodeAuditCursor(cursor: string): { createdAt: Date; id: string } | null {
  if (!/^[A-Za-z0-9_-]{1,256}$/.test(cursor)) return null
  try {
    const decoded = Buffer.from(cursor, "base64url").toString("utf8")
    if (Buffer.from(decoded, "utf8").toString("base64url") !== cursor) return null
    const value: unknown = JSON.parse(decoded)
    if (!Array.isArray(value) || value.length !== 2 || typeof value[0] !== "string" || typeof value[1] !== "string") return null
    const createdAt = new Date(value[0])
    if (!Number.isFinite(createdAt.getTime()) || createdAt.toISOString() !== value[0] || !UUID_V4.test(value[1])) return null
    return { createdAt, id: value[1] }
  } catch {
    return null
  }
}

function encodeAuditCursor(createdAt: Date, id: string): string {
  return Buffer.from(JSON.stringify([createdAt.toISOString(), id]), "utf8").toString("base64url")
}

function guestSubjectFromCookie(request: FastifyRequest): string | null {
  const cookie = request.cookies[GUEST_COOKIE]
  if (!cookie) return null

  const unsigned = request.unsignCookie(cookie)
  return unsigned.valid && unsigned.value && UUID_V4.test(unsigned.value)
    ? unsigned.value
    : null
}

async function auditOwnerFromRequest(request: FastifyRequest, reply: FastifyReply): Promise<AuditOwner | null> {
  const userId = await authenticatedUserId(request, reply)
  if (userId) return { userId, guestSubject: null }

  const guestSubject = guestSubjectFromCookie(request)
  return guestSubject ? { userId: null, guestSubject } : null
}

function apiStatus(status: "IN_PROGRESS" | "COMPLETED"): CreatedAuditDto["status"] {
  switch (status) {
    case "IN_PROGRESS":
      return "in_progress"
    case "COMPLETED":
      return "completed"
  }
}

function auditDto(audit: NonNullable<Awaited<ReturnType<typeof getAudit>>>): AuditDto {
  return {
    id: audit.id,
    status: apiStatus(audit.status),
    createdAt: audit.createdAt.toISOString(),
    updatedAt: audit.updatedAt.toISOString(),
    questionnaireVersion: audit.questionnaireVersion,
    scoringVersion: audit.scoringVersion,
    answers: audit.answers,
    answeredCount: audit.answers.length,
  }
}

export const auditRoutes: FastifyPluginAsync = async (app) => {
  // 10 new audits and 180 answer/submit/claim writes per 10 minutes per client subnet.
  const createLimiter = new AuditRateLimiter(10, 10 * 60 * 1000)
  const mutationLimiter = new AuditRateLimiter(180, 10 * 60 * 1000)
  app.addHook("onRequest", async (request, reply) => {
    if (["POST", "PUT"].includes(request.method) && !allowsBrowserMutation(request)) {
      return reply.code(403).send({ code: "INVALID_REQUEST", message: "Invalid request" })
    }
    if (["POST", "PUT"].includes(request.method)) {
      const isCreation = request.method === "POST" && request.routeOptions.url === "/audits"
      const limiter = isCreation ? createLimiter : mutationLimiter
      const clientIp = isIP(request.ip) ? request.ip : request.raw.socket.remoteAddress
      const decision = limiter.consume(auditRateLimitKey(clientIp && isIP(clientIp) ? clientIp : "unknown"))
      if (!decision.allowed) {
        reply.header("Retry-After", String(decision.retryAfterSeconds))
        return reply.code(429).send({ code: "RATE_LIMITED", message: "Too many audit requests. Try again later." })
      }
    }
  })

  app.get<{ Querystring: { cursor?: string; limit?: string } }>("/audits", async (request, reply) => {
    const userId = await authenticatedUserId(request, reply)
    if (!userId) {
      return reply.code(401).send({
        code: "UNAUTHENTICATED",
        message: "Authentication required",
      })
    }

    const rawLimit = request.query.limit
    const limit = rawLimit === undefined ? auditPageSize : Number(rawLimit)
    if (rawLimit !== undefined && (typeof rawLimit !== "string" || !/^\d{1,2}$/.test(rawLimit) || String(limit) !== rawLimit || !Number.isSafeInteger(limit) || limit < 1 || limit > maxAuditPageSize)) {
      return reply.code(400).send({ code: "INVALID_AUDIT_LIMIT", message: "Audit page limit must be between 1 and 50" })
    }
    const rawCursor = request.query.cursor
    const after = rawCursor === undefined ? undefined : decodeAuditCursor(rawCursor)
    if (rawCursor !== undefined && (typeof rawCursor !== "string" || !after)) {
      return reply.code(400).send({ code: "INVALID_AUDIT_CURSOR", message: "Invalid audit cursor" })
    }

    const result = await listUserAudits(userId, { take: limit, ...(after ? { after } : {}) })
    const hasMore = result.rows.length > limit
    const audits = result.rows.slice(0, limit)
    return {
      items: audits.map((audit) => ({
        id: audit.id,
        status: apiStatus(audit.status),
        createdAt: audit.createdAt.toISOString(),
        updatedAt: audit.updatedAt.toISOString(),
        questionnaireVersion: audit.questionnaireVersion,
        scoringVersion: audit.scoringVersion,
        answeredCount: audit._count.answers,
      } satisfies AuditSummaryDto)),
      nextCursor: hasMore && audits.length > 0 ? encodeAuditCursor(audits[audits.length - 1].createdAt, audits[audits.length - 1].id) : null,
      counts: result.counts,
    }
  })

  app.post("/audits", async (request, reply) => {
    const existingOwner = await auditOwnerFromRequest(request, reply)
    const owner: AuditOwner = existingOwner ?? {
      userId: null,
      guestSubject: randomUUID(),
    }
    const audit = await createAudit(owner)

    if (!existingOwner && owner.guestSubject) {
      reply.setCookie(GUEST_COOKIE, owner.guestSubject, {
        ...GUEST_COOKIE_OPTIONS,
        signed: true,
        maxAge: GUEST_COOKIE_MAX_AGE,
      })
    }

    return reply.code(201).send({
      id: audit.id,
      status: apiStatus(audit.status),
      createdAt: audit.createdAt.toISOString(),
      updatedAt: audit.updatedAt.toISOString(),
      questionnaireVersion: audit.questionnaireVersion,
      scoringVersion: audit.scoringVersion,
    } satisfies CreatedAuditDto)
  })

  app.post("/audits/claim-guest", async (request, reply) => {
    const userId = await authenticatedUserId(request, reply)
    if (!userId) {
      return reply.code(401).send({
        code: "UNAUTHENTICATED",
        message: "Authentication required",
      })
    }
    const guestSubject = guestSubjectFromCookie(request)
    if (!guestSubject) return { claimedCount: 0 }

    const claimedCount = await claimGuestAudits(guestSubject, userId)
    reply.clearCookie(GUEST_COOKIE, GUEST_COOKIE_OPTIONS)
    return { claimedCount }
  })

  app.get<{ Params: { id: string } }>("/audits/:id", async (request, reply) => {
    const { id } = request.params
    if (!UUID_V4.test(id)) {
      return reply.code(400).send(invalidAuditId)
    }

    const owner = await auditOwnerFromRequest(request, reply)
    if (!owner) {
      return reply.code(404).send(auditNotFound)
    }

    const audit = await getAudit(id, owner)
    if (!audit) {
      return reply.code(404).send(auditNotFound)
    }

    return auditDto(audit)
  })

  app.put<{
    Params: { id: string; questionId: string }
    Body: { value: AuditAnswerValue }
  }>(
    "/audits/:id/answers/:questionId",
    {
      schema: {
        body: {
          type: "object",
          required: ["value"],
          additionalProperties: false,
          properties: {
            value: { type: "string", enum: ["a", "b", "c", "d"] },
          },
        },
      },
    },
    async (request, reply) => {
      const { id, questionId: questionIdParam } = request.params
      if (!UUID_V4.test(id)) {
        return reply.code(400).send(invalidAuditId)
      }

      const questionId = Number(questionIdParam)
      if (
        !Number.isSafeInteger(questionId) ||
        String(questionId) !== questionIdParam ||
        questionId <= 0
      ) {
        return reply.code(400).send({
          code: "INVALID_QUESTION_ID",
          message: "Invalid question id",
        })
      }

      const owner = await auditOwnerFromRequest(request, reply)
      if (!owner) return reply.code(404).send(auditNotFound)

      const result = await saveAuditAnswer(
        id,
        owner,
        questionId,
        request.body.value,
      )
      if (result.kind === "not_found") {
        return reply.code(404).send(auditNotFound)
      }
      if (result.kind === "unsupported_version") return reply.code(409).send(unsupportedVersion)
      if (result.kind === "invalid_question") {
        return reply.code(400).send({ code: "INVALID_QUESTION_ID", message: "Invalid question id" })
      }
      if (result.kind === "invalid_answer") {
        return reply.code(400).send({ code: "INVALID_ANSWER", message: "Invalid answer value" })
      }
      if (result.kind === "completed") {
        return reply.code(409).send({
          code: "AUDIT_COMPLETED",
          message: "Completed audits cannot be changed",
        })
      }

      return {
        questionId: result.questionId,
        value: result.value,
        answeredCount: result.answeredCount,
      }
    },
  )

  app.post<{ Params: { id: string } }>(
    "/audits/:id/submit",
    async (request, reply) => {
      const { id } = request.params
      if (!UUID_V4.test(id)) {
        return reply.code(400).send(invalidAuditId)
      }

      const owner = await auditOwnerFromRequest(request, reply)
      if (!owner) return reply.code(404).send(auditNotFound)

      const result = await submitAudit(id, owner)
      if (result.kind === "not_found") {
        return reply.code(404).send(auditNotFound)
      }
      if (result.kind === "incomplete") {
        return reply.code(400).send({
          code: "AUDIT_INCOMPLETE",
          message: "All required questions must be answered before submission.",
          details: { missingQuestionIds: result.missingQuestionIds },
        })
      }

      if (result.kind === "unsupported_version") return reply.code(409).send(unsupportedVersion)

      return auditDto(result.audit)
    },
  )
}
