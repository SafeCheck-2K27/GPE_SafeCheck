import type { TutorialProgress } from "./progress"

export function createTutorialSaveQueue(
  save: (tutorialId: number, progress: TutorialProgress, signal: AbortSignal) => Promise<void>,
  signal: AbortSignal,
) {
  const tails = new Map<number, Promise<void>>()
  const unconfirmed = new Map<number, { progress: TutorialProgress; failed: boolean }>()
  const copy = (progress: TutorialProgress) => ({ currentStep: progress.currentStep, completedSteps: [...progress.completedSteps] })
  signal.addEventListener("abort", () => unconfirmed.clear(), { once: true })
  const queue = {
    enqueue(tutorialId: number, progress: TutorialProgress): Promise<void> {
      const snapshot = copy(progress)
      const recovery = { progress: copy(snapshot), failed: false }
      if (!signal.aborted) unconfirmed.set(tutorialId, recovery)
      const task = (tails.get(tutorialId) ?? Promise.resolve()).then(async () => {
        if (signal.aborted) throw new DOMException("Session changed", "AbortError")
        try {
          await save(tutorialId, snapshot, signal)
          if (!signal.aborted && unconfirmed.get(tutorialId) === recovery) unconfirmed.delete(tutorialId)
        } catch (error) {
          if (!signal.aborted && unconfirmed.get(tutorialId) === recovery) recovery.failed = true
          throw error
        }
      })
      // A failed request must not poison the next snapshot's chain.
      const tail = task.catch(() => {})
      tails.set(tutorialId, tail)
      void tail.then(() => { if (tails.get(tutorialId) === tail) tails.delete(tutorialId) })
      return task
    },
    async idle() {
      while (tails.size > 0) await Promise.all([...tails.values()])
    },
    recoveries() {
      return [...unconfirmed].map(([tutorialId, { progress, failed }]) => ({ tutorialId, progress: copy(progress), failed }))
    },
    async retryFailed() {
      await Promise.allSettled(queue.recoveries().filter((item) => item.failed)
        .map(({ tutorialId, progress }) => queue.enqueue(tutorialId, progress)))
    },
  }
  return queue
}

export type TutorialSaveQueue = ReturnType<typeof createTutorialSaveQueue>
