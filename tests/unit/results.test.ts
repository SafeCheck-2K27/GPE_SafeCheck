import assert from "node:assert/strict"
import { test } from "node:test"
import { scoreRecommendations } from "../../src/features/results/data"
import { getResultLevel } from "../../src/features/results/logic"
import {
  resolveScoreRecommendationsById,
} from "../../src/features/results/utils"
import type { ScoreRecommendationId } from "../../src/features/results/types"

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
  const resolution = resolveScoreRecommendationsById(
    [3, 1, 6],
    scoreRecommendations,
  )

  assert.deepEqual(
    resolution.recommendations.map(({ id }) => id),
    [3, 1, 6],
  )
  assert.deepEqual(resolution.missingIds, [])
})

test("unknown recommendation ids are reported without hiding valid entries", () => {
  const resolution = resolveScoreRecommendationsById(
    [3, 999 as ScoreRecommendationId, 1],
    scoreRecommendations,
  )

  assert.deepEqual(
    resolution.recommendations.map(({ id }) => id),
    [3, 1],
  )
  assert.deepEqual(resolution.missingIds, [999])
})
