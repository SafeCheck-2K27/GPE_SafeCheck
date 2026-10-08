import type { Tutoriel } from "./data/catalog"
import { createTutorialProgress, getTutorialStatus, normalizeTutorialProgress, type TutorialProgress } from "./progress"
import type { TutoStatus } from "./types"

export type TutorialProgressById = Partial<Record<number, TutorialProgress>>
export type TutorialProgressUpdate = (progress: TutorialProgress) => TutorialProgress

const CARD_STATUS: Record<ReturnType<typeof getTutorialStatus>, TutoStatus> = {
  NOT_STARTED: "todo",
  IN_PROGRESS: "inprogress",
  COMPLETED: "done",
}

export function getTutorialCardStatus(tutorial: Tutoriel, progressById: TutorialProgressById): TutoStatus {
  return CARD_STATUS[getTutorialStatus(progressById[tutorial.id] ?? null, tutorial.steps.length)]
}

/** Starting/reopening uses the same update path; other tutorials stay untouched. */
export function updateTutorialSession(
  progressById: TutorialProgressById,
  tutorial: Tutoriel,
  update: TutorialProgressUpdate = (progress) => progress,
): TutorialProgressById {
  const progress = progressById[tutorial.id] ?? createTutorialProgress(tutorial.steps.length)
  return {
    ...progressById,
    [tutorial.id]: normalizeTutorialProgress(update(progress), tutorial.steps.length)!,
  }
}
