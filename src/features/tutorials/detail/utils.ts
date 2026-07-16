import type { Tutoriel } from "@/lib/tutoriels-data"
import type { TutorialDetailState } from "./types"

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

export function getTutorialProgressPercent(
  completedStepCount: number,
  totalStepCount: number,
) {
  return completedStepCount > 0
    ? Math.round((completedStepCount / totalStepCount) * 100)
    : 0
}

export function getTutorialDetailState(
  markedDone: boolean,
  completedStepCount: number,
): TutorialDetailState {
  return markedDone
    ? "done"
    : completedStepCount > 0
      ? "in_progress"
      : "not_started"
}
