import { tutoriels } from "./data/catalog"
import { normalizeTutorialProgress } from "./progress"
import type { TutorialProgressById } from "./session"
import type { TutorialProgressDto } from "@/lib/contracts/tutorial-progress"

export type { TutorialProgressDto } from "@/lib/contracts/tutorial-progress"

export function decodeTutorialProgress(payload: unknown): TutorialProgressDto {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("Invalid tutorial progress response")
  const item = payload as Record<string, unknown>
  if (!Number.isSafeInteger(item.tutorialId) || (item.tutorialId as number) <= 0 ||
    !Number.isSafeInteger(item.tutorialVersion) || (item.tutorialVersion as number) <= 0 ||
    !Number.isSafeInteger(item.currentStep) || !Array.isArray(item.completedSteps) ||
    !item.completedSteps.every((step) => Number.isSafeInteger(step)) ||
    typeof item.createdAt !== "string" || !Number.isFinite(Date.parse(item.createdAt)) ||
    typeof item.updatedAt !== "string" || !Number.isFinite(Date.parse(item.updatedAt))) {
    throw new Error("Invalid tutorial progress response")
  }
  return item as TutorialProgressDto
}

export function decodeTutorialProgressResponse(payload: unknown): TutorialProgressDto[] {
  if (!payload || typeof payload !== "object" || !Array.isArray((payload as { items?: unknown }).items)) {
    throw new Error("Invalid tutorial progress response")
  }
  const items: TutorialProgressDto[] = []
  const seen = new Set<number>()
  for (const raw of (payload as { items: unknown[] }).items) {
    const item = decodeTutorialProgress(raw)
    if (seen.has(item.tutorialId)) throw new Error("Duplicate tutorial progress response")
    seen.add(item.tutorialId)
    items.push(item)
  }
  return items
}

export function tutorialProgressFromResponse(payload: unknown): TutorialProgressById {
  const result: TutorialProgressById = {}
  for (const item of decodeTutorialProgressResponse(payload)) {
    const tutorial = tutoriels.find((candidate) => candidate.id === item.tutorialId)
    // Historical rows for removed content do not invent cards or new catalog IDs.
    if (tutorial) {
      assertTutorialProgressVersion(item, tutorial.version)
      result[item.tutorialId] = normalizeTutorialProgress(item, tutorial.steps.length)!
    }
  }
  return result
}

export function assertTutorialProgressVersion(progress: TutorialProgressDto, version: number): void {
  if (progress.tutorialVersion !== version) throw new Error("Incompatible tutorial progress version")
}
