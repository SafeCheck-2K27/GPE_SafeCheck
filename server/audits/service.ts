import {
  CURRENT_QUESTIONNAIRE_VERSION,
  CURRENT_SCORING_VERSION,
  getAuditQuestions,
  isSupportedAuditVersion,
} from "../../src/features/audit/versions"
import { prisma } from "../../src/lib/prisma"

const auditFields = {
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  questionnaireVersion: true,
  scoringVersion: true,
} as const
const auditWithAnswersFields = {
  ...auditFields,
  answers: {
    select: { questionId: true, value: true },
    orderBy: { questionId: "asc" },
  },
} as const

export type AuditOwner =
  | { userId: string; guestSubject: null }
  | { userId: null; guestSubject: string }

export function createAudit(owner: AuditOwner) {
  return prisma.audit.create({
    data: {
      ...owner,
      questionnaireVersion: CURRENT_QUESTIONNAIRE_VERSION,
      scoringVersion: CURRENT_SCORING_VERSION,
    },
    select: auditFields,
  })
}

export function getAudit(id: string, owner: AuditOwner) {
  return prisma.audit.findFirst({
    where: { id, ...owner },
    select: auditWithAnswersFields,
  })
}

export function listUserAudits(userId: string) {
  return prisma.audit.findMany({
    where: { userId },
    select: {
      ...auditFields,
      _count: { select: { answers: true } },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  })
}

export async function claimGuestAudits(guestSubject: string, userId: string) {
  const result = await prisma.audit.updateMany({
    where: { guestSubject, userId: null },
    data: { userId, guestSubject: null, updatedAt: new Date() },
  })
  return result.count
}

export async function saveAuditAnswer(
  auditId: string,
  owner: AuditOwner,
  questionId: number,
  value: string,
) {
  return prisma.$transaction(async (tx) => {
    // Serialize writes and submission for this audit so an answer cannot be
    // saved after a concurrent request marks it completed.
    const audit = await tx.$queryRaw<Array<{
      status: "IN_PROGRESS" | "COMPLETED"
      questionnaireVersion: number
      scoringVersion: number
    }>>`
      SELECT "status", "questionnaireVersion", "scoringVersion" FROM "audits"
      WHERE "id" = ${auditId}
        AND "userId" IS NOT DISTINCT FROM ${owner.userId}
        AND "guestSubject" IS NOT DISTINCT FROM ${owner.guestSubject}
      FOR UPDATE
    `

    if (audit.length === 0) return { kind: "not_found" } as const
    if (!isSupportedAuditVersion(audit[0])) return { kind: "unsupported_version" } as const
    if (audit[0].status === "COMPLETED") {
      return { kind: "completed" } as const
    }

    const question = getAuditQuestions(audit[0]).find((candidate) => candidate.id === questionId)
    if (!question) return { kind: "invalid_question" } as const
    if (!question.options.some((option) => option.value === value)) {
      return { kind: "invalid_answer" } as const
    }

    const answer = await tx.auditAnswer.upsert({
      where: { auditId_questionId: { auditId, questionId } },
      create: { auditId, questionId, value },
      update: { value },
      select: { questionId: true, value: true },
    })
    const answeredCount = await tx.auditAnswer.count({ where: { auditId } })
    await tx.audit.update({ where: { id: auditId }, data: { updatedAt: new Date() } })

    return { kind: "saved", ...answer, answeredCount } as const
  })
}

export async function submitAudit(id: string, owner: AuditOwner) {
  return prisma.$transaction(async (tx) => {
    const locked = await tx.$queryRaw<Array<{ status: "IN_PROGRESS" | "COMPLETED" }>>`
      SELECT "status" FROM "audits"
      WHERE "id" = ${id}
        AND "userId" IS NOT DISTINCT FROM ${owner.userId}
        AND "guestSubject" IS NOT DISTINCT FROM ${owner.guestSubject}
      FOR UPDATE
    `
    if (locked.length === 0) return { kind: "not_found" } as const

    const audit = await tx.audit.findFirst({
      where: { id, ...owner },
      select: auditWithAnswersFields,
    })
    if (!audit) return { kind: "not_found" } as const
    if (!isSupportedAuditVersion(audit)) return { kind: "unsupported_version" } as const
    if (audit.status === "COMPLETED") {
      return { kind: "submitted", audit } as const
    }

    const answerByQuestion = new Map(
      audit.answers.map((answer) => [answer.questionId, answer.value]),
    )
    const missingQuestionIds = getAuditQuestions(audit)
      .filter(
        (question) =>
          !question.options.some(
            (option) => option.value === answerByQuestion.get(question.id),
          ),
      )
      .map((question) => question.id)

    if (missingQuestionIds.length > 0) {
      return { kind: "incomplete", missingQuestionIds } as const
    }

    const submitted = await tx.audit.update({
      where: { id },
      data: { status: "COMPLETED" },
      select: auditWithAnswersFields,
    })
    return { kind: "submitted", audit: submitted } as const
  })
}
