import { assertTutorialProgressVersion, decodeTutorialProgress, decodeTutorialProgressResponse, tutorialProgressFromResponse } from "./hydration"
import type { TutorialProgress } from "./progress"
import { apiFetchJson } from "@/lib/api-fetch"
import { tutoriels } from "./data/catalog"

export class TutorialProgressApiError extends Error {
  constructor(readonly status: number) { super(`Tutorial progress request failed: ${status}`) }
}

async function request(path: string, init: RequestInit = {}): Promise<unknown> {
  const response = await apiFetchJson(path, init)
  if (!response.ok) throw new TutorialProgressApiError(response.status)
  return response.payload
}

export async function getTutorialProgress(signal?: AbortSignal) {
  return tutorialProgressFromResponse(await request("/me/tutorial-progress", { signal }))
}

/** Preserve server activity timestamps for read-only account history. */
export async function getTutorialProgressSnapshots(signal?: AbortSignal) {
  return decodeTutorialProgressResponse(await request("/me/tutorial-progress", { signal }))
}

export async function saveTutorialProgress(tutorialId: number, progress: TutorialProgress, signal?: AbortSignal): Promise<void> {
  const tutorial = tutoriels.find((candidate) => candidate.id === tutorialId)
  if (!tutorial) throw new Error("Unknown tutorial")
  const payload = await request(`/me/tutorial-progress/${tutorialId}`, {
    method: "PUT", headers: { "Content-Type": "application/json" }, signal,
    body: JSON.stringify({ tutorialVersion: tutorial.version, currentStep: progress.currentStep, completedSteps: progress.completedSteps }),
  })
  const snapshot = decodeTutorialProgress(payload)
  if (snapshot.tutorialId !== tutorialId) throw new Error("Mismatched tutorial progress response")
  assertTutorialProgressVersion(snapshot, tutorial.version)
}
