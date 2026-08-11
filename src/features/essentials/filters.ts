import type { Essential, EssentialFilters, EssentialOs } from "./types"

const IMPORTANCE_ORDER = {
  Critique: 0,
  Important: 1,
  Recommandé: 2,
} as const

export function filterEssentials(
  essentials: Essential[],
  filters: EssentialFilters,
): Essential[] {
  let filtered = [...essentials]

  if (filters.search) {
    const search = filters.search.toLowerCase()
    filtered = filtered.filter(
      (essential) =>
        essential.title.toLowerCase().includes(search) ||
        essential.description.toLowerCase().includes(search),
    )
  }

  if (filters.priority !== "all") {
    filtered = filtered.filter(
      (essential) => essential.importance === filters.priority,
    )
  }
  if (filters.os !== "all") {
    filtered = filtered.filter(
      (essential) =>
        essential.os.includes(filters.os as EssentialOs) ||
        essential.os.includes("Tous"),
    )
  }
  if (filters.difficulty !== "all") {
    filtered = filtered.filter(
      (essential) => essential.difficulty === filters.difficulty,
    )
  }
  if (filters.type !== "all") {
    filtered = filtered.filter(
      (essential) => essential.type === filters.type,
    )
  }
  if (filters.category !== "all") {
    filtered = filtered.filter(
      (essential) => essential.category === filters.category,
    )
  }

  if (filters.sortBy === "popularity") {
    return filtered.sort((a, b) => b.popularity - a.popularity)
  }

  return filtered.sort(
    (a, b) =>
      IMPORTANCE_ORDER[a.importance] - IMPORTANCE_ORDER[b.importance],
  )
}
