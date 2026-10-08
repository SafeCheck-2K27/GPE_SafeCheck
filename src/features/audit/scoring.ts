import type { AuditAnswers } from "./types"
import { getAuditQuestions, UnsupportedAuditVersionError, type AuditVersions } from "./versions"
import { calculateAuditScoreV1 } from "./versions/scoring-v1"

export { calculateAuditScoreV1 as calculateAuditScore } from "./versions/scoring-v1"

export function calculateVersionedAuditScore(versions: AuditVersions, answers: AuditAnswers): number {
  // This dispatch is pinned to v1, independently of future current-version constants.
  const questions = getAuditQuestions(versions)
  switch (versions.scoringVersion) {
    case 1:
      return calculateAuditScoreV1(questions, answers)
    default:
      throw new UnsupportedAuditVersionError(versions)
  }
}
