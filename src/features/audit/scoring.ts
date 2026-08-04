import type { AuditAnswers, AuditQuestion } from "./types"

export function calculateAuditScore(
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
