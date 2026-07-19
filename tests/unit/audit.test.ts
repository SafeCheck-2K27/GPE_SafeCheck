import assert from "node:assert/strict"
import { test } from "node:test"
import { calculateAuditScore } from "../../src/features/audit/scoring"
import {
  parseAuditAnswersParam,
  serializeAuditAnswers,
} from "../../src/features/audit/url-payload"
import type {
  AuditAnswers,
  AuditQuestion,
} from "../../src/features/audit/types"

const questions: AuditQuestion[] = [
  {
    id: 1,
    category: "Compte",
    text: "Question 1",
    options: [
      { label: "Fort", value: "a", score: 10 },
      { label: "Moyen", value: "b", score: 5 },
    ],
  },
  {
    id: 2,
    category: "Appareil",
    text: "Question 2",
    options: [
      { label: "Fort", value: "a", score: 10 },
      { label: "Faible", value: "d", score: 0 },
    ],
  },
]

test("calculateAuditScore converts selected option scores to a percentage", () => {
  assert.equal(calculateAuditScore(questions, { 1: "a", 2: "d" }), 50)
  assert.equal(calculateAuditScore(questions, { 1: "b", 2: "a" }), 75)
})

test("calculateAuditScore ignores missing and unknown answers", () => {
  assert.equal(calculateAuditScore(questions, { 1: "a" }), 50)
  assert.equal(calculateAuditScore(questions, { 1: "c", 2: "d" }), 0)
})

test("audit answer payloads serialize and parse without changing values", () => {
  const answers: AuditAnswers = { 1: "a", 2: "d" }
  const serialized = serializeAuditAnswers(answers)

  assert.deepEqual(parseAuditAnswersParam(serialized), answers)
})

test("audit answer parsing rejects malformed or unsupported payloads", () => {
  const invalidPayloads = [
    null,
    "",
    "not-json",
    "[]",
    JSON.stringify({ unknown: "a" }),
    JSON.stringify({ 1: "unknown" }),
    JSON.stringify({ 1: 1 }),
  ]

  invalidPayloads.forEach((payload) => {
    assert.equal(parseAuditAnswersParam(payload), null)
  })
})
