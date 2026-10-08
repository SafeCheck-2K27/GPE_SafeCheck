export type TutorialStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"

/** Absence (null) means never started. Status and percentage are derived. */
export interface TutorialProgress {
  readonly currentStep: number
  readonly completedSteps: readonly number[]
}

function validateTotalSteps(totalSteps: number) {
  if (!Number.isSafeInteger(totalSteps) || totalSteps <= 0) {
    throw new RangeError("totalSteps must be a positive safe integer")
  }
}

function isValidStep(step: number, totalSteps: number) {
  return Number.isSafeInteger(step) && step >= 0 && step < totalSteps
}

function validateStep(step: number, totalSteps: number) {
  validateTotalSteps(totalSteps)
  if (!isValidStep(step, totalSteps)) {
    throw new RangeError("step must be an integer within the tutorial bounds")
  }
}

export function createTutorialProgress(totalSteps: number): TutorialProgress {
  validateTotalSteps(totalSteps)
  return { currentStep: 0, completedSteps: [] }
}

/** Clean typed snapshots without mutating them; this is not an API payload validator. */
export function normalizeTutorialProgress(
  progress: TutorialProgress | null,
  totalSteps: number,
): TutorialProgress | null {
  validateTotalSteps(totalSteps)
  if (progress === null) return null

  return {
    currentStep: Number.isFinite(progress.currentStep)
      ? Math.max(0, Math.min(totalSteps - 1, Math.trunc(progress.currentStep)))
      : 0,
    completedSteps: [...new Set(progress.completedSteps.filter((step) => isValidStep(step, totalSteps)))].sort((a, b) => a - b),
  }
}

export function getTutorialStatus(progress: TutorialProgress | null, totalSteps: number): TutorialStatus {
  const normalized = normalizeTutorialProgress(progress, totalSteps)
  if (normalized === null) return "NOT_STARTED"
  return normalized.completedSteps.length === totalSteps ? "COMPLETED" : "IN_PROGRESS"
}

/** Exact ratio; presentation can format decimals without changing completion rules. */
export function getTutorialProgressPercent(progress: TutorialProgress | null, totalSteps: number): number {
  const normalized = normalizeTutorialProgress(progress, totalSteps)
  return normalized === null ? 0 : (normalized.completedSteps.length / totalSteps) * 100
}

export function isStepCompleted(progress: TutorialProgress | null, step: number, totalSteps: number): boolean {
  const normalized = normalizeTutorialProgress(progress, totalSteps)
  return isValidStep(step, totalSteps) && (normalized?.completedSteps.includes(step) ?? false)
}

function setCompletedStep(
  progress: TutorialProgress | null,
  step: number,
  totalSteps: number,
  completed: boolean,
): TutorialProgress {
  validateStep(step, totalSteps)
  const normalized = normalizeTutorialProgress(progress, totalSteps) ?? createTutorialProgress(totalSteps)
  const steps = new Set(normalized.completedSteps)
  if (completed) steps.add(step)
  else steps.delete(step)
  return { currentStep: normalized.currentStep, completedSteps: [...steps].sort((a, b) => a - b) }
}

export function addCompletedStep(progress: TutorialProgress | null, step: number, totalSteps: number): TutorialProgress {
  return setCompletedStep(progress, step, totalSteps, true)
}

export function removeCompletedStep(progress: TutorialProgress | null, step: number, totalSteps: number): TutorialProgress {
  return setCompletedStep(progress, step, totalSteps, false)
}

export function toggleCompletedStep(progress: TutorialProgress | null, step: number, totalSteps: number): TutorialProgress {
  return setCompletedStep(progress, step, totalSteps, !isStepCompleted(progress, step, totalSteps))
}

/** Terminer validates every step, preserving the resume position. */
export function completeTutorial(progress: TutorialProgress | null, totalSteps: number): TutorialProgress {
  const normalized = normalizeTutorialProgress(progress, totalSteps) ?? createTutorialProgress(totalSteps)
  return {
    currentStep: normalized.currentStep,
    completedSteps: Array.from({ length: totalSteps }, (_, index) => index),
  }
}

function moveTutorialStep(progress: TutorialProgress | null, totalSteps: number, direction: -1 | 1): TutorialProgress {
  const normalized = normalizeTutorialProgress(progress, totalSteps) ?? createTutorialProgress(totalSteps)
  return {
    currentStep: Math.max(0, Math.min(totalSteps - 1, normalized.currentStep + direction)),
    completedSteps: normalized.completedSteps,
  }
}

export function nextTutorialStep(progress: TutorialProgress | null, totalSteps: number): TutorialProgress {
  return moveTutorialStep(progress, totalSteps, 1)
}

export function previousTutorialStep(progress: TutorialProgress | null, totalSteps: number): TutorialProgress {
  return moveTutorialStep(progress, totalSteps, -1)
}
