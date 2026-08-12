import { describe, expect, it } from "vitest"
import { scoreRecommendations } from "../../src/features/results/data"
import { getResultLevel } from "../../src/features/results/logic"
import {
  getResultScore,
  resolveScoreRecommendationsById,
} from "../../src/features/results/utils"
import type { ScoreRecommendationId } from "../../src/features/results/types"

describe("result score and recommendation helpers", () => {
  it("getResultScore applies the documented fallback and clamps valid integers", () => {
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
      expect(getResultScore(value)).toBe(expected)
    })
  })

  it("getResultLevel respects every score boundary", () => {
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
      expect(getResultLevel(score).id).toBe(expected)
    })
  })

  it("recommendations are resolved by stable ids in configured order", () => {
    const resolution = resolveScoreRecommendationsById(
      [3, 1, 6],
      scoreRecommendations,
    )

    expect(resolution.recommendations.map(({ id }) => id)).toEqual([3, 1, 6])
    expect(resolution.missingIds).toEqual([])
  })

  it("unknown recommendation ids are reported without hiding valid entries", () => {
    const resolution = resolveScoreRecommendationsById(
      [3, 999 as ScoreRecommendationId, 1],
      scoreRecommendations,
    )

    expect(resolution.recommendations.map(({ id }) => id)).toEqual([3, 1])
    expect(resolution.missingIds).toEqual([999])
  })
})
