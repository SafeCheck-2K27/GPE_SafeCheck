import assert from "node:assert/strict"
import { test } from "node:test"
import { decodeCreatedAudit, decodeAuditSummary } from "../../src/lib/contracts/audit"
import { ApiPayloadError } from "../../src/lib/contracts/payload"
import { decodeAudit, decodeSavedAuditAnswer } from "../../src/features/audit/decoding"
import { answersFromAudit } from "../../src/features/audit/api"

const created = {
  id: "audit-id", status: "in_progress", createdAt: "2026-10-05T12:00:00.000Z",
  updatedAt: "2026-10-05T12:00:00.000Z",
  questionnaireVersion: 1, scoringVersion: 1,
}
const summary = { ...created, answeredCount: 1 }
const audit = { ...summary, answers: [{ questionId: 1, value: "a" }] }
const saved = { questionId: 1, value: "a", answeredCount: 1 }

test("audit decoders return only their endpoint fields without mutating payloads", () => {
  const payload = { ...audit, extra: true, answers: [{ ...audit.answers[0], extra: true }] }
  assert.deepEqual(decodeCreatedAudit(payload), created)
  assert.deepEqual(decodeAuditSummary(payload), summary)
  const decoded = decodeAudit(payload)
  assert.deepEqual(decoded, audit)
  assert.notEqual(decoded.answers, payload.answers)
  assert.notEqual(decoded.answers[0], payload.answers[0])
  assert.equal(payload.answers[0].extra, true)
  assert.deepEqual(decodeSavedAuditAnswer({ ...saved, extra: true }), saved)
  assert.deepEqual(decodeAudit({ ...created, status: "completed", answeredCount: 0, answers: [] }), {
    ...created, status: "completed", answeredCount: 0, answers: [],
  })
})

test("all audit decoders reject malformed roots and missing fields", () => {
  for (const decode of [decodeCreatedAudit, decodeAuditSummary, decodeAudit, decodeSavedAuditAnswer]) {
    for (const payload of [undefined, null, false, 1, "audit", [], {}]) {
      assert.throws(() => decode(payload), ApiPayloadError)
    }
  }
  for (const [decode, valid] of [
    [decodeCreatedAudit, created], [decodeAuditSummary, summary],
    [decodeAudit, audit], [decodeSavedAuditAnswer, saved],
  ] as const) {
    for (const key of Object.keys(valid)) {
      const incomplete: Record<string, unknown> = { ...valid }
      delete incomplete[key]
      assert.throws(() => decode(incomplete), ApiPayloadError)
    }
  }
})

test("audit metadata rejects invalid identifiers, statuses, timestamps and counts", () => {
  for (const id of [null, 1, "", "   "]) {
    assert.throws(() => decodeCreatedAudit({ ...created, id }), ApiPayloadError)
  }
  for (const status of [null, false, "IN_PROGRESS", "unknown"]) {
    assert.throws(() => decodeCreatedAudit({ ...created, status }), ApiPayloadError)
  }
  for (const field of ["createdAt", "updatedAt"]) {
    for (const value of [null, 0, "", "invalid", "2026-02-30T12:00:00.000Z"]) {
      assert.throws(() => decodeCreatedAudit({ ...created, [field]: value }), ApiPayloadError)
    }
  }
  for (const answeredCount of [null, "1", -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => decodeAuditSummary({ ...summary, answeredCount }), ApiPayloadError)
    assert.throws(() => decodeSavedAuditAnswer({ ...saved, answeredCount }), ApiPayloadError)
  }
})

test("full audit rejects malformed nested answers", () => {
  for (const answers of [null, {}, "answers", [null], [[]], [{}], [{ questionId: 1 }], [{ value: "a" }]]) {
    assert.throws(() => decodeAudit({ ...audit, answers }), ApiPayloadError)
  }
  for (const questionId of [null, "1", 0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => decodeAudit({ ...audit, answers: [{ questionId, value: "a" }] }), ApiPayloadError)
    assert.throws(() => decodeSavedAuditAnswer({ ...saved, questionId }), ApiPayloadError)
  }
  for (const value of [null, false, 1, {}, []]) {
    assert.throws(() => decodeAudit({ ...audit, answers: [{ questionId: 1, value }] }), ApiPayloadError)
  }
})

test("version metadata is mandatory and positive but summaries preserve unknown versions", () => {
  for (const field of ["questionnaireVersion", "scoringVersion"]) {
    for (const value of [null, "1", 0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
      assert.throws(() => decodeCreatedAudit({ ...created, [field]: value }), ApiPayloadError)
    }
  }
  const future = { ...audit, questionnaireVersion: 2, scoringVersion: 3 }
  assert.equal(decodeAuditSummary(future).questionnaireVersion, 2)
  assert.throws(() => answersFromAudit(decodeAudit(future)), { name: "UnsupportedAuditVersionError" })
})

test("saved answers accept the endpoint enum and reject invalid values", () => {
  for (const value of ["a", "b", "c", "d"]) {
    assert.deepEqual(decodeSavedAuditAnswer({ ...saved, value }), { ...saved, value })
  }
  for (const value of [null, false, 1, "", "unknown", "A"]) {
    assert.throws(() => decodeSavedAuditAnswer({ ...saved, value }), ApiPayloadError)
  }
})

test("full audit rejects inconsistent counts and duplicate question ids", () => {
  assert.throws(() => decodeAudit({ ...audit, answeredCount: 0 }), ApiPayloadError)
  assert.throws(() => decodeAudit({ ...audit, answeredCount: 2 }), ApiPayloadError)
  assert.throws(() => decodeAudit({
    ...audit, answeredCount: 2, answers: [{ questionId: 1, value: "a" }, { questionId: 1, value: "b" }],
  }), ApiPayloadError)
})

test("stored string answers retain the existing catalog filtering behavior", () => {
  const decoded = decodeAudit({
    ...audit,
    answeredCount: 3,
    answers: [{ questionId: 1, value: "a" }, { questionId: 2, value: "legacy" }, { questionId: 9999, value: "b" }],
  })
  assert.equal(decoded.answers[1].value, "legacy")
  assert.deepEqual(answersFromAudit(decoded), { 1: "a" })
})
