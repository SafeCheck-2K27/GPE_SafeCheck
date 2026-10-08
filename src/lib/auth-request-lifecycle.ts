let controller = new AbortController()

/** Requests queued under old credentials must never run under a new session. */
export function invalidateAuthRequests() {
  controller.abort()
  controller = new AbortController()
}

export function authRequestSignal() {
  return controller.signal
}
