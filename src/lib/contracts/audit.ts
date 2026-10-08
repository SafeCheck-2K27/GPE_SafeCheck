import { ApiPayloadError } from "./payload"

export type CreatedAuditDto = {
  id: string
  status: "in_progress" | "completed"
  createdAt: string
  updatedAt: string
  questionnaireVersion: number
  scoringVersion: number
}

export type AuditSummaryDto = CreatedAuditDto & {
  answeredCount: number
}

export type AuditDto = AuditSummaryDto & {
  answers: { questionId: number; value: string }[]
}

function object(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ApiPayloadError(`${label} must be an object`)
  }
  return value as Record<string, unknown>
}

function canonicalTimestamp(value: unknown, field: string): string {
  if (typeof value !== "string") throw new ApiPayloadError(`${field} must be a timestamp`)
  const parsed = new Date(value)
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString() !== value) {
    throw new ApiPayloadError(`${field} must be a canonical ISO timestamp`)
  }
  return value
}

export function decodeCreatedAudit(value: unknown): CreatedAuditDto {
  const input = object(value, "Audit")
  if (typeof input.id !== "string" || input.id.trim().length === 0) {
    throw new ApiPayloadError("Audit id must be a non-empty string")
  }
  if (input.status !== "in_progress" && input.status !== "completed") {
    throw new ApiPayloadError("Audit status is invalid")
  }
  return {
    id: input.id,
    status: input.status,
    createdAt: canonicalTimestamp(input.createdAt, "createdAt"),
    updatedAt: canonicalTimestamp(input.updatedAt, "updatedAt"),
    questionnaireVersion: positiveVersion(input.questionnaireVersion, "questionnaireVersion"),
    scoringVersion: positiveVersion(input.scoringVersion, "scoringVersion"),
  }
}

function positiveVersion(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value <= 0) {
    throw new ApiPayloadError(`${field} must be a positive integer`)
  }
  return value
}

export function decodeAuditSummary(value: unknown): AuditSummaryDto {
  const input = object(value, "Audit summary")
  const created = decodeCreatedAudit(input)
  if (typeof input.answeredCount !== "number" || !Number.isSafeInteger(input.answeredCount) || input.answeredCount < 0) {
    throw new ApiPayloadError("answeredCount must be a non-negative integer")
  }
  return { ...created, answeredCount: input.answeredCount }
}

export function decodeAccountAuditList(value: unknown): AuditSummaryDto[] {
  const input = object(value, "Audit list")
  if (!Array.isArray(input.items)) throw new ApiPayloadError("Audit list items must be an array")
  return input.items.map(decodeAuditSummary)
}
