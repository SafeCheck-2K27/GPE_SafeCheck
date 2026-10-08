import { authRequestSignal } from "@/lib/auth-request-lifecycle"
import { saveTutorialProgress } from "./api"
import { createTutorialSaveQueue, type TutorialSaveQueue } from "./save-queue"

let channel: { userId: string; signal: AbortSignal; queue: TutorialSaveQueue } | undefined

/** Write ordering and unconfirmed snapshots survive routes within this Auth lifecycle. */
export function tutorialSaveQueue(userId: string): TutorialSaveQueue {
  const signal = authRequestSignal()
  if (!channel || channel.userId !== userId || channel.signal !== signal) {
    channel = { userId, signal, queue: createTutorialSaveQueue(saveTutorialProgress, signal) }
  }
  return channel.queue
}
