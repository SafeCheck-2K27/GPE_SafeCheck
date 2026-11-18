import type { TutorialProgressDto } from "../tutorials/hydration"
import type { TutorialSaveQueue } from "../tutorials/save-queue"
import { mapAccountTutorials, type AccountTutorial } from "./tutorial-summary"

export type AccountTutorialLoad =
  | { kind: "ready"; items: AccountTutorial[] }
  | { kind: "save-error" }
  | { kind: "cancelled" }

export async function loadAccountTutorials(
  queue: TutorialSaveQueue,
  load: (signal: AbortSignal) => Promise<TutorialProgressDto[]>,
  signal: AbortSignal,
  retrySaves = false,
): Promise<AccountTutorialLoad> {
  await queue.idle()
  if (signal.aborted) return { kind: "cancelled" }
  if (retrySaves) await queue.retryFailed()
  if (signal.aborted) return { kind: "cancelled" }
  // No activity timestamp exists for a failed write; do not present old DB rows as confirmed progress.
  if (queue.recoveries().length > 0) return { kind: "save-error" }
  const snapshots = await load(signal)
  if (signal.aborted) return { kind: "cancelled" }
  return { kind: "ready", items: mapAccountTutorials(snapshots) }
}
