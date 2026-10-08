import type { AuditAnswers, AuditQuestion } from "../types"

// Historical formula: ten points per question, rounded to an integer percentage.
// Keep this implementation when adding a future scorer version.
export function calculateAuditScoreV1(
  questions: AuditQuestion[],
  answers: AuditAnswers,
): number {
  let totalScore = 0

  questions.forEach((question) => {
    const answerValue = answers[question.id]
    const option = question.options.find((candidate) => candidate.value === answerValue)
    if (option) totalScore += option.score
  })

  const maxScore = questions.length * 10
  return Math.round((totalScore / maxScore) * 100)
}
