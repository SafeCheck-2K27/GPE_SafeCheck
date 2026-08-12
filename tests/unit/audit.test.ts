import { describe, expect, it } from "vitest"
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

describe("audit scoring and payloads", () => {
  it("calculateAuditScore converts selected option scores to a percentage", () => {
    expect(calculateAuditScore(questions, { 1: "a", 2: "d" })).toBe(50)
    expect(calculateAuditScore(questions, { 1: "b", 2: "a" })).toBe(75)
  })

  it("calculateAuditScore ignores missing and unknown answers", () => {
    expect(calculateAuditScore(questions, { 1: "a" })).toBe(50)
    expect(calculateAuditScore(questions, { 1: "c", 2: "d" })).toBe(0)
  })

  it("audit answer payloads serialize and parse without changing values", () => {
    const answers: AuditAnswers = { 1: "a", 2: "d" }
    const serialized = serializeAuditAnswers(answers)

    expect(parseAuditAnswersParam(serialized)).toEqual(answers)
  })

  it("audit answer parsing rejects malformed or unsupported payloads", () => {
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
      expect(parseAuditAnswersParam(payload)).toBeNull()
    })
  })
})
