import { scoreRecommendations } from "./data"
import type {
  ScoreRecommendation,
  ScoreRecommendationId,
  ScoreRecommendationResolution,
  ScoreRecommendationsByCategory,
  ResultLevelConfig,
} from "./types"

export function getScoreRecommendationsForLevel(
  level: ResultLevelConfig,
): ScoreRecommendationResolution {
  return resolveScoreRecommendationsById(
    level.scoreRecommendationIds,
    scoreRecommendations,
  )
}

export function resolveScoreRecommendationsById(
  ids: readonly ScoreRecommendationId[],
  recommendations: readonly ScoreRecommendation[],
): ScoreRecommendationResolution {
  const recommendationsById = new Map(
    recommendations.map((recommendation) => [recommendation.id, recommendation]),
  )

  const resolvedRecommendations: ScoreRecommendation[] = []
  const missingIds: ScoreRecommendationId[] = []

  ids.forEach((id) => {
    const recommendation = recommendationsById.get(id)

    if (recommendation) {
      resolvedRecommendations.push(recommendation)
      return
    }

    missingIds.push(id)
  })

  return {
    recommendations: resolvedRecommendations,
    missingIds,
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
