import assert from "node:assert/strict"
import { test } from "node:test"
import { auditSessionKey, createAuditRequestScope } from "../../src/app/audit/_request-scope"
import { createAudit, getAudit, saveAnswer, submitAudit } from "../../src/features/audit/api"
import { authRequestSignal, invalidateAuthRequests } from "../../src/lib/auth-request-lifecycle"

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej })
  return { promise, resolve, reject }
}

test("loaded audit ownership has a different render key during hydration, identity and URL changes", () => {
  const loadedKey = auditSessionKey(true, "alice", "audit-one")
  assert.equal(auditSessionKey(false, "alice", "audit-one"), null)
  assert.notEqual(auditSessionKey(true, "bob", "audit-one"), loadedKey)
  assert.notEqual(auditSessionKey(true, null, "audit-one"), loadedKey)
  assert.notEqual(auditSessionKey(true, "alice", "audit-two"), loadedKey)
  assert.notEqual(auditSessionKey(true, "guest", "audit-one"), auditSessionKey(true, null, "audit-one"))
  assert.notEqual(auditSessionKey(true, "alice", null), auditSessionKey(true, "alice", ""))
  assert.equal(auditSessionKey(true, "alice", "audit-one"), loadedKey)
})

test("scope ignores both successful and failed completions immediately after auth invalidation", async () => {
  const scope = createAuditRequestScope()
  scope.activate()
  const success = deferred<string>()
  const failure = deferred<string>()
  const effects: string[] = []
  const callbacks = {
    success: (value: string) => { effects.push(value) },
    error: () => { effects.push("error") },
    settled: () => { effects.push("settled") },
  }
  const loading = scope.run(() => success.promise, callbacks)
  const saving = scope.run(() => failure.promise, callbacks)
  await Promise.resolve()
  invalidateAuthRequests()
  assert.equal(scope.isCurrent(), false)
  success.resolve("old answers")
  failure.reject(new Error("old save error"))
  await Promise.all([loading, saving])
  assert.deepEqual(effects, [])
})

test("current identity receives successful state and retryable errors, and a new identity can load", async () => {
  const first = createAuditRequestScope()
  first.activate()
  const effects: string[] = []
  await first.run(async () => "alice answers", {
    success: (value) => { effects.push(value) },
    settled: () => { effects.push("settled") },
  })
  await first.run(async () => { throw new Error("network") }, {
    success: () => { effects.push("unexpected") },
    error: () => { effects.push("retryable error") },
    settled: () => { effects.push("settled") },
  })
  invalidateAuthRequests()
  let obsoleteRequestStarted = false
  await first.run(async () => { obsoleteRequestStarted = true }, { success: () => {} })
  assert.equal(obsoleteRequestStarted, false)
  const second = createAuditRequestScope()
  second.activate()
  await second.run(async () => "bob answers", { success: (value) => { effects.push(value) } })
  assert.deepEqual(effects, ["alice answers", "settled", "retryable error", "settled", "bob answers"])
})

test("route cleanup ignores late completions and aborts pending work", async () => {
  const scope = createAuditRequestScope()
  const cleanup = scope.activate()
  const pending = deferred<string>()
  let signal!: AbortSignal
  let changed = false
  const loading = scope.run((requestSignal) => {
    signal = requestSignal
    return pending.promise
  }, { success: () => { changed = true } })
  await Promise.resolve()
  cleanup()
  assert.equal(scope.isCurrent(), false)
  await Promise.resolve()
  assert.equal(signal.aborted, true)
  pending.resolve("old audit")
  await loading
  assert.equal(changed, false)
})

test("Strict Mode effect replay creates one audit and only its active continuation navigates", async (t) => {
  const previousUrl = process.env.NEXT_PUBLIC_API_URL
  process.env.NEXT_PUBLIC_API_URL = "https://api.example.test"
  t.after(() => {
    if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL
    else process.env.NEXT_PUBLIC_API_URL = previousUrl
  })
  const response = deferred<Response>()
  let posts = 0
  t.mock.method(globalThis, "fetch", async () => { posts++; return response.promise })
  const scope = createAuditRequestScope()
  const cleanup = scope.activate()
  const navigations: string[] = []
  const first = scope.run(scope.create, { success: (audit) => { navigations.push(audit.id) } })
  await Promise.resolve()
  cleanup()
  scope.activate()
  const second = scope.run(scope.create, { success: (audit) => { navigations.push(audit.id) } })
  response.resolve(Response.json({
    id: "new-audit", status: "in_progress",
    createdAt: "2026-10-05T12:00:00.000Z", updatedAt: "2026-10-05T12:00:00.000Z",
    questionnaireVersion: 1, scoringVersion: 1,
  }))
  await Promise.all([first, second])
  assert.equal(posts, 1)
  assert.deepEqual(navigations, ["new-audit"])
})

test("malformed audit data reaches the current scope error callback without publishing state", async (t) => {
  const previousUrl = process.env.NEXT_PUBLIC_API_URL
  process.env.NEXT_PUBLIC_API_URL = "https://api.example.test"
  t.after(() => {
    if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL
    else process.env.NEXT_PUBLIC_API_URL = previousUrl
  })
  t.mock.method(globalThis, "fetch", async () => Response.json({ id: "incomplete-audit" }))
  const scope = createAuditRequestScope()
  const cleanup = scope.activate()
  t.after(cleanup)
  const effects: string[] = []
  await scope.run((signal) => getAudit("incomplete-audit", signal), {
    success: () => { effects.push("state") },
    error: (error) => { effects.push(error instanceof Error ? error.name : "unknown") },
    settled: () => { effects.push("settled") },
  })
  assert.deepEqual(effects, ["ApiPayloadError", "settled"])
})

test("first request captures the auth signal after provider effects have settled", async () => {
  const scope = createAuditRequestScope()
  scope.activate()
  let usedSignal: AbortSignal | undefined
  let completed = false
  const loading = scope.run(async (signal) => { usedSignal = signal }, { success: () => { completed = true } })
  // AuthProvider's identity effect can run after child effects on initial hydration.
  invalidateAuthRequests()
  await loading
  assert.equal(usedSignal?.aborted, false)
  assert.equal(completed, true)
})

for (const [name, request] of [
  ["GET", (signal: AbortSignal) => getAudit("old-audit", signal)],
  ["create", (signal: AbortSignal) => createAudit(signal)],
  ["save", (signal: AbortSignal) => saveAnswer("old-audit", 1, "a", signal)],
  ["submit", (signal: AbortSignal) => submitAudit("old-audit", signal)],
] as const) {
  test(`${name} invalidation aborts transport and suppresses late state, errors and navigation`, async (t) => {
    const previousUrl = process.env.NEXT_PUBLIC_API_URL
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.test"
    t.after(() => {
      if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL
      else process.env.NEXT_PUBLIC_API_URL = previousUrl
    })
    const response = deferred<Response>()
    let signal!: AbortSignal
    t.mock.method(globalThis, "fetch", async (_url: URL, init: RequestInit) => {
      signal = init.signal as AbortSignal
      return response.promise
    })
    const scope = createAuditRequestScope()
    scope.activate()
    const effects: string[] = []
    const work = scope.run<unknown>(request, {
      success: () => { effects.push("state or navigation") },
      error: () => { effects.push("error") },
      settled: () => { effects.push("settled") },
    })
    await Promise.resolve()
    const oldAuthSignal = authRequestSignal()
    invalidateAuthRequests()
    assert.equal(oldAuthSignal.aborted, true)
    assert.equal(signal.aborted, true)
    response.resolve(Response.json({ id: "old-audit", value: "a", answers: [] }))
    await work
    assert.deepEqual(effects, [])
  })
}
