import { randomUUID } from "node:crypto"
import type { FastifyPluginAsync, FastifyRequest } from "fastify"
import type { AuditAnswerValue } from "../../src/features/audit/types"
import type { AuditDto, AuditSummaryDto, CreatedAuditDto } from "../../src/lib/contracts/audit"
import { auth } from "../auth/auth"
import { authRequestHeaders } from "../auth/request-headers"
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

function guestSubjectFromCookie(request: FastifyRequest): string | null {
  const cookie = request.cookies[GUEST_COOKIE]
  if (!cookie) return null

  const unsigned = request.unsignCookie(cookie)
  return unsigned.valid && unsigned.value && UUID_V4.test(unsigned.value)
    ? unsigned.value
    : null
}

async function authenticatedUserId(request: FastifyRequest): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: authRequestHeaders(request),
  })
  return session?.user.id ?? null
}

async function auditOwnerFromRequest(request: FastifyRequest): Promise<AuditOwner | null> {
  const userId = await authenticatedUserId(request)
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
  app.addHook("onRequest", async (request, reply) => {
    if (["POST", "PUT"].includes(request.method) && !allowsBrowserMutation(request)) {
      return reply.code(403).send({ code: "INVALID_REQUEST", message: "Invalid request" })
    }
  })

  app.get("/audits", async (request, reply) => {
    const userId = await authenticatedUserId(request)
    if (!userId) {
      return reply.code(401).send({
        code: "UNAUTHENTICATED",
        message: "Authentication required",
      })
    }

    const audits = await listUserAudits(userId)
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
    }
  })

  app.post("/audits", async (request, reply) => {
    const existingOwner = await auditOwnerFromRequest(request)
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
    const userId = await authenticatedUserId(request)
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

    const owner = await auditOwnerFromRequest(request)
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

      const owner = await auditOwnerFromRequest(request)
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

      const owner = await auditOwnerFromRequest(request)
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
