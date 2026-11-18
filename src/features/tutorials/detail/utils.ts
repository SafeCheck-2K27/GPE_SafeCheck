import type { Tutoriel } from "../data/catalog"

export function resolveTutorialRoute(
  tutorials: readonly Tutoriel[],
  routeParam: string | undefined,
) {
  return tutorials.find(
    (tutorial) =>
      tutorial.slug === routeParam || tutorial.id === Number(routeParam),
  )
}

export function getRelatedTutorials(
  tutorials: readonly Tutoriel[],
  tutorial: Tutoriel,
  limit = 3,
) {
  return tutorials
    .filter(
      (candidate) =>
        candidate.id !== tutorial.id &&
        (candidate.category === tutorial.category ||
          candidate.level === tutorial.level),
    )
    .slice(0, limit)
}
