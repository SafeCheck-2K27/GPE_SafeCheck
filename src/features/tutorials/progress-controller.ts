import type { Tutoriel } from "./data/catalog"
import type { TutorialSaveQueue } from "./save-queue"
import { updateTutorialSession, type TutorialProgressById, type TutorialProgressUpdate } from "./session"
import type { TutorialProgress } from "./progress"

export type ProgressIdentity = string | null | undefined
export type TutorialSyncState = {
  identity: ProgressIdentity
  phase: "auth-loading" | "loading" | "ready" | "error"
  progressById: TutorialProgressById
  pending: number
  saveErrors: number[]
}

/** One mounted page's interactive state; network ordering is injected separately. */
export function createTutorialProgressController(dependencies: {
  load: (signal: AbortSignal) => Promise<TutorialProgressById>
  queue: (userId: string) => TutorialSaveQueue
}) {
  const initial: TutorialSyncState = { identity: undefined, phase: "auth-loading", progressById: {}, pending: 0, saveErrors: [] }
  let state = initial
  let active = false
  let generation = 0
  let loading: AbortController | undefined
  const revisions = new Map<number, number>()
  const listeners = new Set<() => void>()
  const publish = (next: TutorialSyncState) => { state = next; listeners.forEach((listener) => listener()) }
  const current = (token: number) => active && generation === token

  async function hydrate(userId: string, retryFailed = false) {
    loading?.abort()
    const abort = new AbortController()
    loading = abort
    const token = ++generation
    const queue = dependencies.queue(userId)
    const recovered = (progressById: TutorialProgressById = {}) => {
      const saveErrors: number[] = []
      const merged = { ...progressById }
      for (const item of queue.recoveries()) {
        merged[item.tutorialId] = item.progress
        if (item.failed) saveErrors.push(item.tutorialId)
      }
      return { progressById: merged, saveErrors }
    }
    publish({ ...state, phase: "loading", progressById: {}, pending: 0, saveErrors: [] })
    try {
      // Route destinations must not GET an older snapshot while the source is still saving.
      await queue.idle()
      if (!current(token) || abort.signal.aborted) return
      if (retryFailed) await queue.retryFailed()
      if (!current(token) || abort.signal.aborted) return
      const progressById = await dependencies.load(abort.signal)
      if (current(token) && !abort.signal.aborted) publish({ ...state, phase: "ready", ...recovered(progressById) })
    } catch {
      if (current(token) && !abort.signal.aborted) publish({ ...state, phase: "error", ...recovered() })
    }
  }

  function persist(tutorialId: number, progress: TutorialProgress) {
    if (typeof state.identity !== "string") return
    const token = generation
    const revision = (revisions.get(tutorialId) ?? 0) + 1
    revisions.set(tutorialId, revision)
    publish({ ...state, pending: state.pending + 1, saveErrors: state.saveErrors.filter((id) => id !== tutorialId) })
    const finish = (failed: boolean) => {
      if (!current(token)) return
      const errors = new Set(state.saveErrors)
      if (revisions.get(tutorialId) === revision) {
        if (failed) errors.add(tutorialId)
        else errors.delete(tutorialId)
      }
      publish({ ...state, pending: state.pending - 1, saveErrors: [...errors] })
    }
    void dependencies.queue(state.identity).enqueue(tutorialId, progress).then(() => finish(false), () => finish(true))
  }

  return {
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } },
    getSnapshot: () => state,
    getServerSnapshot: () => initial,
    setIdentity(identity: ProgressIdentity) {
      if (active && state.identity === identity) return
      active = true
      generation++
      loading?.abort()
      revisions.clear()
      publish({ identity, phase: identity === undefined ? "auth-loading" : identity === null ? "ready" : "loading", progressById: {}, pending: 0, saveErrors: [] })
      if (typeof identity === "string") void hydrate(identity)
    },
    updateProgress(tutorial: Tutoriel, update?: TutorialProgressUpdate): boolean {
      if (!active || state.phase !== "ready") return false
      const previous = state.progressById[tutorial.id]
      const progressById = updateTutorialSession(state.progressById, tutorial, update)
      const progress = progressById[tutorial.id]!
      if (previous && previous.currentStep === progress.currentStep &&
        previous.completedSteps.length === progress.completedSteps.length &&
        previous.completedSteps.every((step, index) => step === progress.completedSteps[index])) return true
      publish({ ...state, progressById })
      persist(tutorial.id, progress)
      return true
    },
    retryHydration() { if (active && typeof state.identity === "string" && state.phase === "error") void hydrate(state.identity, true) },
    retrySaves() {
      if (!active || state.phase !== "ready") return
      for (const id of state.saveErrors) {
        const progress = state.progressById[id]
        if (progress) persist(id, progress)
      }
    },
    dispose() { active = false; generation++; loading?.abort() },
  }
}
