import assert from "node:assert/strict"
import { test } from "node:test"
import { auditQuestions } from "../../src/features/audit/data"
import { questionnaireV1 } from "../../src/features/audit/versions/questionnaire-v1"
import { calculateVersionedAuditScore } from "../../src/features/audit/scoring"
import {
  CURRENT_QUESTIONNAIRE_VERSION, CURRENT_SCORING_VERSION,
  getAuditQuestions, UnsupportedAuditVersionError,
} from "../../src/features/audit/versions"

test("current audits use version 1 and the historical catalog has one source", () => {
  assert.equal(CURRENT_QUESTIONNAIRE_VERSION, 1)
  assert.equal(CURRENT_SCORING_VERSION, 1)
  assert.equal(auditQuestions, questionnaireV1)
  assert.equal(getAuditQuestions({ questionnaireVersion: 1, scoringVersion: 1 }), questionnaireV1)
})

test("historical v1 scores retain known weights, denominator and rounding", () => {
  const versions = { questionnaireVersion: 1, scoringVersion: 1 }
  assert.equal(questionnaireV1.length, 10)
  assert.equal(calculateVersionedAuditScore(versions, { 1: "b", 2: "c", 3: "a" }), 19)
  const best = Object.fromEntries(questionnaireV1.map((question) => [question.id, "a" as const]))
  assert.equal(calculateVersionedAuditScore(versions, best), 100)
})

test("unknown questionnaire or scorer cannot silently use current scoring", () => {
  for (const versions of [
    { questionnaireVersion: 2, scoringVersion: 1 },
    { questionnaireVersion: 1, scoringVersion: 2 },
    { questionnaireVersion: 0, scoringVersion: 1 },
    { questionnaireVersion: 99, scoringVersion: 99 },
  ]) {
    assert.throws(() => getAuditQuestions(versions), UnsupportedAuditVersionError)
    assert.throws(() => calculateVersionedAuditScore(versions, { 1: "a" }), UnsupportedAuditVersionError)
  }
})
