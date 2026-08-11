import type {
  Habit,
  HabitFilters,
  TechnicalRecommendation,
  TechnicalRecommendationFilters,
} from "./types"

export function filterHabits(
  habits: Habit[],
  filters: HabitFilters,
): Habit[] {
  return habits.filter((habit) => {
    if (filters.level !== "all" && habit.level !== filters.level) return false
    if (filters.tag !== "all" && habit.tag !== filters.tag) return false
    return true
  })
}

export function filterTechnicalRecommendations(
  recommendations: TechnicalRecommendation[],
  filters: TechnicalRecommendationFilters,
): TechnicalRecommendation[] {
  return recommendations.filter((recommendation) => {
    if (
      filters.category !== "all" &&
      recommendation.category !== filters.category
    ) {
      return false
    }
    if (
      filters.level !== "all" &&
      recommendation.level !== filters.level
    ) {
      return false
    }
    if (
      filters.urgency !== "all" &&
      recommendation.urgency !== filters.urgency
    ) {
      return false
    }
    return true
  })
}
