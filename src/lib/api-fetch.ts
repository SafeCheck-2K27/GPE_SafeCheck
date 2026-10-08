import { ApiPayloadError } from "@/lib/contracts/payload"

// These MVP JSON reads/writes contain small snapshots, not uploads or long-running
// jobs. Allow 15s for a slow connection, then release the waiting UI/save queue.
// This is a recovery deadline, not a measured latency SLA. It includes body decoding.
// A timeout is unconfirmed: callers retain snapshots for retry.
export const API_REQUEST_TIMEOUT_MS = 15_000

export class ApiTimeoutError extends Error {
  constructor() {
    super("API request timed out")
    this.name = "TimeoutError"
  }
}

/** Shared HTTP mechanics; feature clients own status handling and payload decoding. */
export async function apiFetchJson(path: string, init: RequestInit = {}): Promise<{
  status: number
  ok: boolean
  payload: unknown
}> {
  init.signal?.throwIfAborted()
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  if (!baseUrl) throw new Error("NEXT_PUBLIC_API_URL is not configured")

  const controller = new AbortController()
  let rejectCancellation!: (reason: unknown) => void
  const cancellation = new Promise<never>((_, reject) => { rejectCancellation = reject })
  const cancel = (reason: unknown) => {
    if (controller.signal.aborted) return
    controller.abort(reason)
    rejectCancellation(reason)
  }
  const sessionAbort = () => cancel(init.signal!.reason)
  init.signal?.addEventListener("abort", sessionAbort, { once: true })
  const timer = setTimeout(() => cancel(new ApiTimeoutError()), API_REQUEST_TIMEOUT_MS)

  const exchange = async () => {
    const response = await fetch(new URL(path, baseUrl), {
      ...init,
      signal: controller.signal,
      credentials: "include",
      cache: "no-store",
    })
    controller.signal.throwIfAborted()

    let payload: unknown
    try {
      payload = await response.json()
    } catch (error) {
      controller.signal.throwIfAborted()
      if (!(error instanceof SyntaxError)) throw error
      if (response.ok) throw new ApiPayloadError("Invalid JSON API response")
      payload = null
    }
    controller.signal.throwIfAborted()
    return { status: response.status, ok: response.ok, payload }
  }
  try {
    // Some transports do not settle on abort. Racing also bounds those promises;
    // the exchange still checks cancellation before accepting a late response.
    return await Promise.race([exchange(), cancellation])
  } finally {
    clearTimeout(timer)
    init.signal?.removeEventListener("abort", sessionAbort)
  }
}
