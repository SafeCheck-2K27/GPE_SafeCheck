import { createAudit } from "@/features/audit/api"
import { authRequestSignal } from "@/lib/auth-request-lifecycle"

export function auditSessionKey(isHydrated: boolean, userId: string | null, auditId: string | null) {
  return isHydrated ? JSON.stringify([userId, auditId]) : null
}

type RequestCallbacks<T> = {
  success: (value: T) => void
  error?: (error: unknown) => void
  settled?: () => void
}

/** One mounted identity/URL owns its requests and their UI continuations. */
export function createAuditRequestScope() {
  const route = new AbortController()
  let sessionSignal: AbortSignal | undefined
  let signal: AbortSignal | undefined
  let active = false
  let generation = 0
  let creation: ReturnType<typeof createAudit> | undefined
  const isCurrent = () => active && !route.signal.aborted && !sessionSignal?.aborted

  return {
    isCurrent,
    activate() {
      active = true
      const activation = ++generation
      return () => {
        if (generation !== activation) return
        active = false
        // React's Strict Mode replay reactivates before this microtask. Keep its POST.
        queueMicrotask(() => { if (!active) route.abort() })
      }
    },
    create(requestSignal: AbortSignal) {
      return creation ??= createAudit(requestSignal)
    },
    async run<T>(request: (signal: AbortSignal) => Promise<T>, callbacks: RequestCallbacks<T>) {
      const requestGeneration = generation
      // Capture credentials after AuthProvider's passive identity effect has run.
      await Promise.resolve()
      if (!isCurrent() || generation !== requestGeneration) return
      sessionSignal ??= authRequestSignal()
      signal ??= AbortSignal.any([route.signal, sessionSignal])
      const canPublish = () => isCurrent() && generation === requestGeneration
      if (!canPublish()) return
      try {
        const result = await request(signal)
        if (canPublish()) callbacks.success(result)
      } catch (error) {
        if (canPublish()) callbacks.error?.(error)
      } finally {
        if (canPublish()) callbacks.settled?.()
      }
    },
  }
}
