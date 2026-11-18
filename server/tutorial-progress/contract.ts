import { normalizeTutorialProgress, type TutorialProgress } from "../../src/features/tutorials/progress"
import type { TutorialProgressDto } from "../../src/lib/contracts/tutorial-progress"

export function parseTutorialId(value: string): number | null {
  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0 && String(id) === value ? id : null
}

export type VersionedTutorialProgress = TutorialProgress & { tutorialVersion: number }

export function parseTutorialVersion(body: unknown): number | null {
  if (body === null || typeof body !== "object" || Array.isArray(body)) return null
  const version = (body as Record<string, unknown>).tutorialVersion
  return typeof version === "number" && Number.isSafeInteger(version) && version > 0 ? version : null
}

/** Validate untrusted JSON before the domain normalizes a typed snapshot. */
export function parseTutorialProgress(body: unknown, totalSteps: number): VersionedTutorialProgress | null {
  if (body === null || typeof body !== "object" || Array.isArray(body)) return null
  const input = body as Record<string, unknown>
  const keys = Object.keys(input)
  const tutorialVersion = parseTutorialVersion(body)
  if (keys.length !== 3 || !keys.includes("currentStep") || !keys.includes("completedSteps") || tutorialVersion === null) return null

  const validIndex = (value: unknown): value is number =>
    typeof value === "number" && Number.isSafeInteger(value) && value >= 0 && value < totalSteps
  if (!validIndex(input.currentStep) || !Array.isArray(input.completedSteps) || !input.completedSteps.every(validIndex)) {
    return null
  }

  try {
    const progress = normalizeTutorialProgress({ currentStep: input.currentStep, completedSteps: input.completedSteps }, totalSteps)
    return progress ? { ...progress, tutorialVersion } : null
  } catch (error) {
    if (error instanceof RangeError) return null
    throw error
  }
}

export function tutorialProgressDto(progress: {
  tutorialId: number
  tutorialVersion: number
  currentStep: number
  completedSteps: number[]
  createdAt: Date
  updatedAt: Date
}): TutorialProgressDto {
  return {
    tutorialId: progress.tutorialId,
    tutorialVersion: progress.tutorialVersion,
    currentStep: progress.currentStep,
    completedSteps: progress.completedSteps,
    createdAt: progress.createdAt.toISOString(),
    updatedAt: progress.updatedAt.toISOString(),
  }
}
