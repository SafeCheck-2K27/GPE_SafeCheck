import type { GuestClaimResult } from "./auth-logic"

export type GuestClaimStatus = "idle" | "pending" | "failed"

type ClaimSnapshot = {
  userId: string | null
  status: GuestClaimStatus
  auditsRevision: number
}

const emptySnapshot: ClaimSnapshot = { userId: null, status: "idle", auditsRevision: 0 }
export const GUEST_CLAIM_TIMEOUT_MS = 15_000

/** One recovery attempt per identity, owned by the existing auth provider. */
export function createGuestClaimRecovery(
  request: (userId: string, signal: AbortSignal) => Promise<GuestClaimResult>,
) {
  let snapshot = emptySnapshot
  let generation = 0
  let controller: AbortController | null = null
  let flight: Promise<void> | null = null
  const listeners = new Set<() => void>()

  function publish(next: ClaimSnapshot) {
    snapshot = next
    listeners.forEach((listener) => listener())
  }

  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => emptySnapshot,
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    setIdentity(userId: string | null) {
      if (snapshot.userId === userId) return
      generation++
      controller?.abort()
      controller = null
      flight = null
      publish({ userId, status: "idle", auditsRevision: 0 })
    },
    claim(userId: string): Promise<void> {
      if (snapshot.userId !== userId) return Promise.resolve()
      if (flight) return flight
      const retryingUnconfirmed = snapshot.status === "failed"
      const scope = generation
      const attemptController = new AbortController()
      controller = attemptController
      flight = Promise.resolve().then(async () => {
        let result: GuestClaimResult
        // The race also settles transports (including session confirmation) that ignore abort.
        let onAbort!: () => void
        const cancelled = new Promise<GuestClaimResult>((resolve) => {
          onAbort = () => resolve("failed")
          attemptController.signal.addEventListener("abort", onAbort, { once: true })
        })
        const deadline = setTimeout(() => attemptController.abort(), GUEST_CLAIM_TIMEOUT_MS)
        try {
          attemptController.signal.throwIfAborted()
          result = await Promise.race([request(userId, attemptController.signal), cancelled])
        } catch {
          result = "failed"
        } finally {
          clearTimeout(deadline)
          attemptController.signal.removeEventListener("abort", onAbort)
        }
        if (scope !== generation) return
        if (attemptController.signal.aborted) result = "failed"
        flight = null
        controller = null
        publish({
          userId,
          status: result === "failed" ? "failed" : "idle",
          // A lost response may have committed: a zero-count retry must recover stale 404s too.
          auditsRevision: snapshot.auditsRevision + (result === "succeeded" || (result === "unchanged" && retryingUnconfirmed) ? 1 : 0),
        })
      })
      publish({ ...snapshot, status: "pending" })
      return flight
    },
  }
}
