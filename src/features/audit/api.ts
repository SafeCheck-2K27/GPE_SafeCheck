import { getAuditQuestions } from "./versions"
import type { AuditAnswers, AuditAnswerValue } from "./types"
import { decodeCreatedAudit, type AuditDto, type CreatedAuditDto } from "@/lib/contracts/audit"
import { decodeAudit, decodeSavedAuditAnswer, type SavedAuditAnswerDto } from "./decoding"
import { apiFetchJson } from "@/lib/api-fetch"

export type { AuditDto } from "@/lib/contracts/audit"

export class AuditApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly missingQuestionIds: number[] = [],
  ) {
    super(code)
  }
}

async function request<T>(path: string, decode: (payload: unknown) => T, init: RequestInit = {}): Promise<T> {
  const response = await apiFetchJson(path, init)
  const payload = response.payload

  if (!response.ok) {
    const error =
      typeof payload === "object" && payload !== null
        ? (payload as {
            code?: unknown
            details?: { missingQuestionIds?: unknown }
          })
        : null
    const code = typeof error?.code === "string" ? error.code : "API_ERROR"
    const missingQuestionIds = Array.isArray(error?.details?.missingQuestionIds)
      ? error.details.missingQuestionIds.filter(
          (id): id is number => Number.isSafeInteger(id),
        )
      : []
    throw new AuditApiError(response.status, code, missingQuestionIds)
  }

  return decode(payload)
}

export function createAudit(signal?: AbortSignal): Promise<CreatedAuditDto> {
  return request("/audits", decodeCreatedAudit, { method: "POST", signal })
}

export function getAudit(id: string, signal?: AbortSignal): Promise<AuditDto> {
  return request(`/audits/${encodeURIComponent(id)}`, decodeAudit, { signal })
}

export function saveAnswer(
  id: string,
  questionId: number,
  value: AuditAnswerValue,
  signal?: AbortSignal,
): Promise<SavedAuditAnswerDto> {
  return request(`/audits/${encodeURIComponent(id)}/answers/${questionId}`, decodeSavedAuditAnswer, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
    signal,
  })
}

export function submitAudit(id: string, signal?: AbortSignal): Promise<AuditDto> {
  return request(`/audits/${encodeURIComponent(id)}/submit`, decodeAudit, {
    method: "POST",
    signal,
  })
}

export function answersFromAudit(audit: AuditDto): AuditAnswers {
  const answers: AuditAnswers = {}
  const questionById = new Map(getAuditQuestions(audit).map((question) => [question.id, question]))

  for (const answer of audit.answers) {
    const option = questionById
      .get(answer.questionId)
      ?.options.find((candidate) => candidate.value === answer.value)
    if (option) answers[answer.questionId] = option.value
  }

  return answers
}
