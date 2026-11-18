"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import { useAuth } from "@/components/safecheck/AuthProvider"
import type { Tutoriel } from "./data/catalog"
import type { TutorialProgressUpdate } from "./session"
import { getTutorialProgress } from "./api"
import { createTutorialProgressController, type TutorialSyncState } from "./progress-controller"
import { tutorialSaveQueue } from "./transport"

/** Page-local state; authenticated snapshots hydrate from DB and save in order. */
export function useTutorialProgress() {
  const auth = useAuth()
  const identity = auth.isHydrated ? auth.user?.id ?? null : undefined
  const [controller] = useState(() => createTutorialProgressController({ load: getTutorialProgress, queue: tutorialSaveQueue }))
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getServerSnapshot)
  useEffect(() => {
    controller.setIdentity(identity)
    return () => controller.dispose()
  }, [controller, identity])

  // Mask old ownership synchronously, before effect cleanup or a new GET can run.
  const state: TutorialSyncState = snapshot.identity === identity ? snapshot : {
    identity, phase: identity === undefined ? "auth-loading" : "loading", progressById: {}, pending: 0, saveErrors: [],
  }
  const canInteract = state.phase === "ready"
  return {
    state, canInteract, progressById: state.progressById,
    sessionKey: identity === undefined ? "loading" : identity === null ? "guest" : `user:${identity}`,
    updateProgress: (tutorial: Tutoriel, update?: TutorialProgressUpdate) => canInteract && controller.updateProgress(tutorial, update),
    retryHydration: controller.retryHydration,
    retrySaves: controller.retrySaves,
  }
}
