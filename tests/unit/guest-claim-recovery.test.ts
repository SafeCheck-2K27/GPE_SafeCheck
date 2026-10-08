import assert from "node:assert/strict"
import { test } from "node:test"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { GuestClaimNotice } from "../../src/components/safecheck/GuestClaimNotice"
import { I18nProvider } from "../../src/components/safecheck/I18nProvider"
import { createGuestClaimRecovery, GUEST_CLAIM_TIMEOUT_MS } from "../../src/components/safecheck/guest-claim-recovery"
import type { GuestClaimResult } from "../../src/components/safecheck/auth-logic"

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => { resolve = done })
  return { promise, resolve }
}

function renderNotice(recovery: ReturnType<typeof createGuestClaimRecovery>) {
  return renderToStaticMarkup(createElement(I18nProvider, null,
    createElement(GuestClaimNotice, {
      status: recovery.getSnapshot().status,
      onRetry: () => recovery.claim("user-1"),
    }),
  ))
}

test("failed claim remains retryable and successful retry refreshes account audits", async () => {
  let calls = 0
  const recovery = createGuestClaimRecovery(async () => ++calls === 1 ? "failed" : "succeeded")
  recovery.setIdentity("user-1")
  await recovery.claim("user-1")
  assert.deepEqual(recovery.getSnapshot(), { userId: "user-1", status: "failed", auditsRevision: 0 })
  const failedNotice = renderNotice(recovery)
  assert.match(failedNotice, /role="status"/)
  assert.match(failedNotice, /n’ont pas pu être rattachés/)
  assert.match(failedNotice, /Réessayer le rattachement/)
  assert.doesNotMatch(failedNotice, /disabled/)
  // Navigation does not change identity or discard the failed snapshot.
  recovery.setIdentity("user-1")
  assert.equal(recovery.getSnapshot().status, "failed")
  await recovery.claim("user-1")
  assert.deepEqual(recovery.getSnapshot(), { userId: "user-1", status: "idle", auditsRevision: 1 })
  assert.equal(renderNotice(recovery), "")
  assert.equal(calls, 2)
})

test("repeated failures retain recovery without refreshing account audits", async () => {
  const recovery = createGuestClaimRecovery(async () => "failed")
  recovery.setIdentity("user-1")
  await recovery.claim("user-1")
  await recovery.claim("user-1")
  assert.equal(recovery.getSnapshot().status, "failed")
  assert.equal(recovery.getSnapshot().auditsRevision, 0)
})

test("concurrent retry clicks share one pending claim", async () => {
  const request = deferred<GuestClaimResult>()
  let calls = 0
  const recovery = createGuestClaimRecovery(async () => { calls++; return request.promise })
  recovery.setIdentity("user-1")
  const first = recovery.claim("user-1")
  const duplicate = recovery.claim("user-1")
  assert.equal(first, duplicate)
  await Promise.resolve()
  assert.equal(calls, 1)
  assert.equal(recovery.getSnapshot().status, "pending")
  const pendingNotice = renderNotice(recovery)
  assert.match(pendingNotice, /Rattachement en cours/)
  assert.match(pendingNotice, /disabled/)
  request.resolve("succeeded")
  await first
  assert.equal(recovery.getSnapshot().auditsRevision, 1)
})

test("identity changes abort and ignore late retries, even when returning to the same user", async () => {
  for (const outcome of ["succeeded", "failed"] as const) {
    const request = deferred<GuestClaimResult>()
    let signal!: AbortSignal
    const recovery = createGuestClaimRecovery(async (_userId, requestSignal) => {
      signal = requestSignal
      return request.promise
    })
    recovery.setIdentity("user-1")
    const pending = recovery.claim("user-1")
    await Promise.resolve()
    recovery.setIdentity("user-2")
    assert.equal(signal.aborted, true)
    recovery.setIdentity("user-1")
    request.resolve(outcome)
    await pending
    assert.deepEqual(recovery.getSnapshot(), { userId: "user-1", status: "idle", auditsRevision: 0 })
  }
})

test("logout clears recovery and stale UI cannot claim under another identity", async () => {
  let calls = 0
  const recovery = createGuestClaimRecovery(async () => { calls++; return "failed" })
  recovery.setIdentity("user-1")
  await recovery.claim("user-1")
  recovery.setIdentity(null)
  await recovery.claim("user-1")
  recovery.setIdentity("user-2")
  await recovery.claim("user-1")
  assert.equal(calls, 1)
  assert.deepEqual(recovery.getSnapshot(), { userId: "user-2", status: "idle", auditsRevision: 0 })
})

test("a late old response cannot clear the next identity's pending attempt", async () => {
  const oldRequest = deferred<GuestClaimResult>()
  const newRequest = deferred<GuestClaimResult>()
  let calls = 0
  const recovery = createGuestClaimRecovery(async (userId) => {
    calls++
    return userId === "user-1" ? oldRequest.promise : newRequest.promise
  })
  recovery.setIdentity("user-1")
  const oldAttempt = recovery.claim("user-1")
  await Promise.resolve()
  recovery.setIdentity("user-2")
  const newAttempt = recovery.claim("user-2")
  oldRequest.resolve("succeeded")
  await oldAttempt
  assert.equal(recovery.getSnapshot().status, "pending")
  assert.equal(recovery.claim("user-2"), newAttempt)
  assert.equal(calls, 2)
  newRequest.resolve("failed")
  await newAttempt
  assert.deepEqual(recovery.getSnapshot(), { userId: "user-2", status: "failed", auditsRevision: 0 })
})

test("identity invalidation before the request starts prevents the POST", async () => {
  let calls = 0
  const recovery = createGuestClaimRecovery(async () => { calls++; return "succeeded" })
  recovery.setIdentity("user-1")
  const attempt = recovery.claim("user-1")
  recovery.setIdentity(null)
  await attempt
  assert.equal(calls, 0)
  assert.deepEqual(recovery.getSnapshot(), { userId: null, status: "idle", auditsRevision: 0 })
})

test("unexpected retry exceptions remain actionable", async () => {
  const recovery = createGuestClaimRecovery(async () => { throw new Error("session unavailable") })
  recovery.setIdentity("user-1")
  await recovery.claim("user-1")
  assert.equal(recovery.getSnapshot().status, "failed")
})

test("deadline aborts an ignored transport, releases retry and rejects late success", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] })
  const late = deferred<GuestClaimResult>()
  let signal!: AbortSignal
  let calls = 0
  const recovery = createGuestClaimRecovery(async (_userId, requestSignal) => {
    signal = requestSignal
    return ++calls === 1 ? late.promise : "succeeded"
  })
  recovery.setIdentity("user-1")
  const attempt = recovery.claim("user-1")
  await Promise.resolve()
  t.mock.timers.tick(GUEST_CLAIM_TIMEOUT_MS)
  await attempt
  assert.equal(signal.aborted, true)
  assert.equal(recovery.getSnapshot().status, "failed")
  late.resolve("succeeded")
  await Promise.resolve()
  assert.equal(recovery.getSnapshot().auditsRevision, 0)
  await recovery.claim("user-1")
  assert.equal(recovery.getSnapshot().auditsRevision, 1)
})

test("successful no-op claim clears recovery without invalidating loaded edits", async () => {
  const recovery = createGuestClaimRecovery(async () => "unchanged")
  recovery.setIdentity("user-1")
  await recovery.claim("user-1")
  assert.deepEqual(recovery.getSnapshot(), { userId: "user-1", status: "idle", auditsRevision: 0 })
})
