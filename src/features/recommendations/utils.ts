import type { RecommendationStatus } from "./types"

export const RECOMMENDATION_STATUS_ORDER: RecommendationStatus[] = [
  "todo",
  "en-cours",
  "fait",
  "sauvegarde",
]

export function getNextRecommendationStatus(
  current: RecommendationStatus,
): RecommendationStatus {
  const currentIndex = RECOMMENDATION_STATUS_ORDER.indexOf(current)
  return RECOMMENDATION_STATUS_ORDER[
    (currentIndex + 1) % RECOMMENDATION_STATUS_ORDER.length
  ]
}
