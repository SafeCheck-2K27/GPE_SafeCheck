import assert from "node:assert/strict"
import { test } from "node:test"
import { parseTutorialId, parseTutorialProgress, parseTutorialVersion, tutorialProgressDto } from "../../server/tutorial-progress/contract"

test("API tutorial ids accept only canonical positive integer strings", () => {
  assert.equal(parseTutorialId("1"), 1)
  assert.equal(parseTutorialId("34"), 34)
})

test("API tutorial ids reject alternate number encodings and unsafe integers", () => {
  for (const value of ["", "0", "-1", "1.5", "01", "+1", "1e0", "0x1", " 1", "1 ", "NaN", "Infinity", "9007199254740992"]) {
    assert.equal(parseTutorialId(value), null, value)
  }
})

test("API accepts empty validations and nonsequential typed snapshots", () => {
  assert.deepEqual(parseTutorialProgress({ tutorialVersion: 1, currentStep: 0, completedSteps: [] }, 5), { tutorialVersion: 1, currentStep: 0, completedSteps: [] })
  assert.deepEqual(parseTutorialProgress({ tutorialVersion: 1, currentStep: 4, completedSteps: [4, 0] }, 5), { tutorialVersion: 1, currentStep: 4, completedSteps: [0, 4] })
})

test("API requires a positive explicit integer version without coercion", () => {
  for (const tutorialVersion of [undefined, null, "1", true, 0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    const body = { tutorialVersion, currentStep: 0, completedSteps: [] }
    assert.equal(parseTutorialVersion(body), null)
    assert.equal(parseTutorialProgress(body, 5), null)
  }
  assert.deepEqual(parseTutorialProgress({ tutorialVersion: 42, currentStep: 0, completedSteps: [] }, 5), {
    tutorialVersion: 42, currentStep: 0, completedSteps: [],
  })
})

test("API requires exactly the three progress fields and never accepts a client owner", () => {
  for (const body of [null, [], "progress", {}, { tutorialVersion: 1, currentStep: 0 }, { completedSteps: [] },
    { tutorialVersion: 1, currentStep: 0, completedSteps: [], userId: "other-user" },
    { tutorialVersion: 1, currentStep: 0, completedSteps: [], status: "COMPLETED" }]) {
    assert.equal(parseTutorialProgress(body, 5), null)
  }
})

test("API rejects invalid currentStep values rather than coercing or clamping them", () => {
  for (const currentStep of [-1, 5, 1.5, NaN, Infinity, -Infinity, "2", null, true, undefined, Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(parseTutorialProgress({ tutorialVersion: 1, currentStep, completedSteps: [] }, 5), null)
  }
})

test("API rejects invalid completedSteps types and every invalid index", () => {
  for (const completedSteps of [null, {}, "0,1", true, [-1], [5], [1.5], [NaN], [Infinity], ["1"], [null], [true], [undefined]]) {
    assert.equal(parseTutorialProgress({ tutorialVersion: 1, currentStep: 0, completedSteps }, 5), null)
  }
})

test("API uses domain normalization to deduplicate and sort without mutating input", () => {
  const completedSteps = Object.freeze([2, 0, 2, 1])
  const body = Object.freeze({ tutorialVersion: 1, currentStep: 2, completedSteps })
  assert.deepEqual(parseTutorialProgress(body, 5), { tutorialVersion: 1, currentStep: 2, completedSteps: [0, 1, 2] })
  assert.deepEqual(completedSteps, [2, 0, 2, 1])
})

test("API adapter handles domain RangeErrors without leaking them", () => {
  for (const totalSteps of [0, -1, NaN, Infinity, 1.5]) {
    assert.equal(parseTutorialProgress({ tutorialVersion: 1, currentStep: 0, completedSteps: [] }, totalSteps), null)
  }
})

test("API DTO exposes only progress fields and ISO timestamps", () => {
  const record = {
    userId: "private-user", tutorialId: 1, tutorialVersion: 1, currentStep: 2, completedSteps: [0, 1],
    createdAt: new Date("2026-01-01T00:00:00Z"), updatedAt: new Date("2026-01-02T00:00:00Z"),
  }
  assert.deepEqual(tutorialProgressDto(record), {
    tutorialId: 1, tutorialVersion: 1, currentStep: 2, completedSteps: [0, 1],
    createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-02T00:00:00.000Z",
  })
})
