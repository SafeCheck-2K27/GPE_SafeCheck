import assert from "node:assert/strict"
import { test } from "node:test"
import { scoreRecommendations } from "../../src/features/results/data"
import { getResultLevel } from "../../src/features/results/logic"
import {
  getResultScore,
  resolveScoreRecommendationsById,
} from "../../src/features/results/utils"
import type { ScoreRecommendationId } from "../../src/features/results/types"

test("getResultScore applies the documented fallback and clamps valid integers", () => {
  const cases: Array<[string | null, number]> = [
    [null, 62],
    ["", 62],
    ["abc", 62],
    ["1.5", 62],
    ["-1", 0],
    ["0", 0],
    ["34", 34],
    ["35", 35],
    ["59", 59],
    ["60", 60],
    ["79", 79],
    ["80", 80],
    ["100", 100],
    ["101", 100],
    ["999", 100],
  ]

  cases.forEach(([value, expected]) => {
    assert.equal(getResultScore(value), expected)
  })
})

test("getResultLevel respects every score boundary", () => {
  const cases: Array<[number, string]> = [
    [0, "novice"],
    [34, "novice"],
    [35, "scarabee"],
    [59, "scarabee"],
    [60, "gardien"],
    [79, "gardien"],
    [80, "sentinelle"],
    [100, "sentinelle"],
  ]

  cases.forEach(([score, expected]) => {
    assert.equal(getResultLevel(score).id, expected)
  })
})

test("recommendations are resolved by stable ids in configured order", () => {
  const resolved = resolveScoreRecommendationsById(
    [3, 1, 6],
    scoreRecommendations,
  )

  assert.deepEqual(resolved.map(({ id }) => id), [3, 1, 6])
})

test("an unknown recommendation id fails explicitly", () => {
  assert.throws(
    () =>
      resolveScoreRecommendationsById(
        [999 as ScoreRecommendationId],
        scoreRecommendations,
      ),
    /Unknown score recommendation id: 999/,
  )
})
