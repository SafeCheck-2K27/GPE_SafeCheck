import { allRecommendations } from "./data"
import { resultsBenchmarks } from "./mock-data"
import type {
  Recommendation,
  RecommendationsByCategory,
  ResultLevelConfig,
  ResultMetrics,
} from "./types"

export function getResultScore(scoreParam: string | null): number {
  return scoreParam ? parseInt(scoreParam) : 62
}

export function getDisplayedRecommendations(
  level: ResultLevelConfig,
): Recommendation[] {
  return allRecommendations.slice(
    level.recommendationSlice.start,
    level.recommendationSlice.end,
  )
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

export function groupRecommendationsByCategory(
  recommendations: Recommendation[],
): RecommendationsByCategory {
  return recommendations.reduce<RecommendationsByCategory>((groups, recommendation) => {
    const category = recommendation.category
    if (!groups[category]) groups[category] = []
    groups[category]?.push(recommendation)
    return groups
  }, {})
}
