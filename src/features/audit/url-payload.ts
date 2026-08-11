import { auditQuestions } from "./data"
import type { AuditAnswers } from "./types"

const questionById = new Map(
  auditQuestions.map((question) => [String(question.id), question]),
)

export function parseAuditAnswersParam(value: string | null): AuditAnswers | null {
  if (!value) return null

  try {
    const parsed: unknown = JSON.parse(value)
    if (!isRecord(parsed)) return null

    const answers: AuditAnswers = {}

    for (const [questionId, answerValue] of Object.entries(parsed)) {
      const question = questionById.get(questionId)
      if (!question || typeof answerValue !== "string") return null

      const option = question.options.find(
        (candidate) => candidate.value === answerValue,
      )
      if (!option) return null

      answers[question.id] = option.value
    }

    return answers
  } catch {
    return null
  }
}

export function serializeAuditAnswers(answers: AuditAnswers): string {
  return JSON.stringify(answers)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
