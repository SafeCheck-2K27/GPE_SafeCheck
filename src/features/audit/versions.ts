import { questionnaireV1 } from "./versions/questionnaire-v1"

export const CURRENT_QUESTIONNAIRE_VERSION = 1
export const CURRENT_SCORING_VERSION = 1

export type AuditVersions = { questionnaireVersion: number; scoringVersion: number }

export class UnsupportedAuditVersionError extends Error {
  constructor(readonly versions: AuditVersions) {
    super("AUDIT_VERSION_UNSUPPORTED")
    this.name = "UnsupportedAuditVersionError"
  }
}

export function isSupportedAuditVersion(versions: AuditVersions): boolean {
  return versions.questionnaireVersion === 1 && versions.scoringVersion === 1
}

export function assertSupportedAuditVersion(versions: AuditVersions): void {
  if (!isSupportedAuditVersion(versions)) throw new UnsupportedAuditVersionError(versions)
}

export function getAuditQuestions(versions: AuditVersions) {
  assertSupportedAuditVersion(versions)
  return questionnaireV1
}
