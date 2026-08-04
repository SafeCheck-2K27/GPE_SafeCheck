import type { Niveau, Tutoriel } from "@/lib/tutoriels-data"
import { POPULAR_IDS } from "./data"
import type { SortOption } from "./types"

export function parseDuration(duration: string): number {
  const match = duration.match(/(\d+)/)
  return match ? parseInt(match[1]) : 10
}

export function sortTutorials(
  tutorials: Tutoriel[],
  mode: SortOption,
): Tutoriel[] {
  if (mode === "recommended") {
    return [...tutorials].sort((a, b) => {
      const aScore =
        (a.isEssential ? 4 : 0) +
        (a.isRecommended ? 2 : 0) +
        (POPULAR_IDS.has(a.id) ? 1 : 0)
      const bScore =
        (b.isEssential ? 4 : 0) +
        (b.isRecommended ? 2 : 0) +
        (POPULAR_IDS.has(b.id) ? 1 : 0)
      return bScore - aScore
    })
  }

  if (mode === "fastest") {
    return [...tutorials].sort(
      (a, b) => parseDuration(a.duration) - parseDuration(b.duration),
    )
  }

  if (mode === "popular") {
    return [...tutorials].sort(
      (a, b) =>
        (POPULAR_IDS.has(b.id) ? 1 : 0) -
        (POPULAR_IDS.has(a.id) ? 1 : 0),
    )
  }

  if (mode === "level_asc") {
    const levelOrder: Record<Niveau, number> = {
      Debutant: 0,
      Intermediaire: 1,
      Avance: 2,
    }
    return [...tutorials].sort(
      (a, b) => levelOrder[a.level] - levelOrder[b.level],
    )
  }

  if (mode === "newest") {
    return [...tutorials].sort((a, b) => b.id - a.id)
  }

  return tutorials
}
