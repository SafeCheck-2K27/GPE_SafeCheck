import type { Tutoriel } from "./data/catalog"
import { mockTutoStatus, POPULAR_IDS } from "./data"
import type {
  LibraryCategoryDefinition,
  TutorialFilters,
} from "./types"
import { parseDuration } from "./sorting"

export const DEFAULT_TUTORIAL_FILTERS: TutorialFilters = {
  catFilter: "all",
  levelFilter: "all",
  statusFilter: "all",
  durationFilter: "all",
  typeFilter: "all",
}

export function hasActiveTutorialFilters(filters: TutorialFilters): boolean {
  return Object.entries(filters).some(
    ([key, value]) =>
      value !== DEFAULT_TUTORIAL_FILTERS[key as keyof TutorialFilters],
  )
}

export function matchesTutorialFilters(
  tutorial: Tutoriel,
  filters: TutorialFilters,
): boolean {
  const {
    catFilter,
    levelFilter,
    statusFilter,
    durationFilter,
    typeFilter,
  } = filters

  if (catFilter !== "all" && tutorial.category !== catFilter) return false
  if (levelFilter !== "all" && tutorial.level !== levelFilter) return false

  if (statusFilter !== "all") {
    const status = mockTutoStatus[tutorial.id] || "todo"
    if (status !== statusFilter) return false
  }

  if (durationFilter !== "all") {
    const minutes = parseDuration(tutorial.duration)
    if (durationFilter === "quick" && minutes > 7) return false
    if (durationFilter === "medium" && (minutes <= 7 || minutes > 20)) return false
    if (durationFilter === "long" && minutes <= 20) return false
  }

  if (typeFilter !== "all") {
    if (typeFilter === "essentiel" && !tutorial.isEssential) return false
    if (typeFilter === "recommande" && !tutorial.isRecommended) return false
    if (typeFilter === "populaire" && !POPULAR_IDS.has(tutorial.id)) return false
    if (typeFilter === "technique" && !tutorial.tags.includes("technique")) return false
  }

  return true
}

export function matchesLibraryCategory(
  tutorial: Tutoriel,
  category: LibraryCategoryDefinition,
): boolean {
  return (
    category.level === tutorial.level ||
    Boolean(category.categories?.includes(tutorial.category))
  )
}
