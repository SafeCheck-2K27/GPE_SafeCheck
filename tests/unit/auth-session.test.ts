import assert from "node:assert/strict"
import { test } from "node:test"
import { AuthActionError, resolveAuthSession, runAuthOperation } from "../../src/components/safecheck/auth-logic"

const user = { id: "user-1", email: "a@example.test", pseudo: "Alias" }

test("session lookup errors hide cached identity and never become Guest", () => {
  for (const cached of [null, user]) {
    assert.deepEqual(resolveAuthSession(cached, false, false, true), {
      user: null, isLoggedIn: false, isHydrated: false, sessionError: true,
    })
  }
})

test("pending and changing sessions hide all cached account identity", () => {
  for (const [pending, changing] of [[true, false], [false, true], [true, true]]) {
    assert.deepEqual(resolveAuthSession(user, pending, changing, false), {
      user: null, isLoggedIn: false, isHydrated: false, sessionError: false,
    })
  }
})

test("settled session resolves only to authenticated identity or confirmed Guest", () => {
  assert.deepEqual(resolveAuthSession(user, false, false, false), {
    user, isLoggedIn: true, isHydrated: true, sessionError: false,
  })
  assert.deepEqual(resolveAuthSession(null, false, false, false), {
    user: null, isLoggedIn: false, isHydrated: true, sessionError: false,
  })
})

test("global operation lock blocks same-tick duplicate and conflicting operations", async () => {
  const lock = { current: false }
  let resolve!: () => void
  const deferred = new Promise<void>((done) => { resolve = done })
  let requests = 0
  const first = runAuthOperation(lock, async () => { requests++; await deferred; return "confirmed" })
  assert.equal(lock.current, true)
  for (let i = 0; i < 3; i++) {
    await assert.rejects(runAuthOperation(lock, async () => { requests++ }),
      (error: unknown) => error instanceof AuthActionError && error.kind === "busy")
  }
  assert.equal(requests, 1)
  resolve()
  assert.equal(await first, "confirmed")
  assert.equal(lock.current, false)
  await runAuthOperation(lock, async () => { requests++ })
  assert.equal(requests, 2)
})

test("operation failure always releases the global lock for retry", async () => {
  const lock = { current: false }
  await assert.rejects(runAuthOperation(lock, async () => { throw new Error("offline") }), /offline/)
  assert.equal(lock.current, false)
  assert.equal(await runAuthOperation(lock, async () => "retried"), "retried")
})

// Recovery belongs to this exact successful authentication, even if a newer one has the same ID.
test("obsolete confirmation recovery never sends a request after logout or a newer authentication", async () => {
  const { resumeAuthConfirmation } = await import("../../src/components/safecheck/auth-logic")
  for (const replacement of [null, { ...user }, { ...user, id: "user-2" }]) {
    const pending = { current: replacement }
    let requests = 0
    await assert.rejects(resumeAuthConfirmation(pending, user, async () => { requests++; return user }),
      (error: unknown) => error instanceof AuthActionError && error.kind === "generic")
    assert.equal(requests, 0)
  }
})

test("confirmation recovery resumes the same user without creating another account", async () => {
  const { resumeAuthConfirmation } = await import("../../src/components/safecheck/auth-logic")
  const pending = { current: user }
  const events: string[] = []
  const recovery = new AuthActionError("network", () => resumeAuthConfirmation(pending, user, async (expected) => {
    assert.equal(expected, user)
    events.push("confirmation", "claim", "refetch")
    return expected
  }))
  assert.equal(await recovery.recovery!(), user)
  assert.deepEqual(events, ["confirmation", "claim", "refetch"])
})
