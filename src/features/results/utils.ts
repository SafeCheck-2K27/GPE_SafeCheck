import { scoreRecommendations } from "./data"
import { resultsBenchmarks } from "./mock-data"
import type {
  ScoreRecommendation,
  ScoreRecommendationId,
  ScoreRecommendationsByCategory,
  ResultLevelConfig,
  ResultMetrics,
} from "./types"

const DEFAULT_RESULT_SCORE = 62
const MINIMUM_RESULT_SCORE = 0
const MAXIMUM_RESULT_SCORE = 100
const DECIMAL_INTEGER_PATTERN = /^[+-]?\d+$/

export function getResultScore(scoreParam: string | null): number {
  const normalizedScore = scoreParam?.trim()

  if (!normalizedScore || !DECIMAL_INTEGER_PATTERN.test(normalizedScore)) {
    return DEFAULT_RESULT_SCORE
  }

  const parsedScore = Number.parseInt(normalizedScore, 10)
  if (Number.isNaN(parsedScore)) {
    return DEFAULT_RESULT_SCORE
  }

  return Math.min(
    MAXIMUM_RESULT_SCORE,
    Math.max(MINIMUM_RESULT_SCORE, parsedScore),
  )
}

export function getScoreRecommendationsForLevel(
  level: ResultLevelConfig,
): ScoreRecommendation[] {
  return resolveScoreRecommendationsById(
    level.scoreRecommendationIds,
    scoreRecommendations,
  )
}

export function resolveScoreRecommendationsById(
  ids: readonly ScoreRecommendationId[],
  recommendations: readonly ScoreRecommendation[],
): ScoreRecommendation[] {
  const recommendationsById = new Map(
    recommendations.map((recommendation) => [recommendation.id, recommendation]),
  )

  return ids.map((id) => {
    const recommendation = recommendationsById.get(id)
    if (!recommendation) {
      throw new Error(`Unknown score recommendation id: ${id}`)
    }
    return recommendation
  })
}

export function getResultMetrics(
  score: number,
  level: ResultLevelConfig,
): ResultMetrics {
  return {
    gainPoints: level.metrics.gainPoints,
    gainActions: level.metrics.gainActions,
    gainTime: level.metrics.gainTime,
    averageScore: resultsBenchmarks.averageScore,
    similarProfilePercentage: score < 50 ? 42 : score < 70 ? 28 : 15,
    gainAfterTutorials: level.metrics.gainAfterTutorials,
  }
}

export function groupScoreRecommendationsByCategory(
  recommendations: ScoreRecommendation[],
): ScoreRecommendationsByCategory {
  return recommendations.reduce<ScoreRecommendationsByCategory>((groups, recommendation) => {
    const category = recommendation.category
    if (!groups[category]) groups[category] = []
    groups[category]?.push(recommendation)
    return groups
  }, {})
}
