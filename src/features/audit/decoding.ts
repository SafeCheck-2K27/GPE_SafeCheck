import { decodeAuditSummary, type AuditDto } from "@/lib/contracts/audit"
import { ApiPayloadError } from "@/lib/contracts/payload"
import type { AuditAnswerValue } from "./types"

export type SavedAuditAnswerDto = {
  questionId: number
  value: AuditAnswerValue
  answeredCount: number
}

function object(payload: unknown, label: string): Record<string, unknown> {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    throw new ApiPayloadError(`${label} must be an object`)
  }
  return payload as Record<string, unknown>
}

function questionId(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value <= 0) {
    throw new ApiPayloadError("questionId must be a positive integer")
  }
  return value
}

export function decodeAudit(payload: unknown): AuditDto {
  const input = object(payload, "Audit")
  const summary = decodeAuditSummary(input)
  if (!Array.isArray(input.answers)) throw new ApiPayloadError("answers must be an array")
  if (summary.answeredCount !== input.answers.length) {
    throw new ApiPayloadError("answeredCount must match answers length")
  }
  const questionIds = new Set<number>()
  const answers = input.answers.map((entry) => {
    const answer = object(entry, "Audit answer")
    if (typeof answer.value !== "string") {
      throw new ApiPayloadError("Audit answer value must be a string")
    }
    const id = questionId(answer.questionId)
    if (questionIds.has(id)) throw new ApiPayloadError("Audit answers contain duplicate question ids")
    questionIds.add(id)
    return { questionId: id, value: answer.value }
  })
  return { ...summary, answers }
}

export function decodeSavedAuditAnswer(payload: unknown): SavedAuditAnswerDto {
  const input = object(payload, "Saved audit answer")
  if (input.value !== "a" && input.value !== "b" && input.value !== "c" && input.value !== "d") {
    throw new ApiPayloadError("Saved audit answer value is invalid")
  }
  if (typeof input.answeredCount !== "number" || !Number.isSafeInteger(input.answeredCount) || input.answeredCount < 0) {
    throw new ApiPayloadError("answeredCount must be a non-negative integer")
  }
  return {
    questionId: questionId(input.questionId),
    value: input.value,
    answeredCount: input.answeredCount,
  }
}
