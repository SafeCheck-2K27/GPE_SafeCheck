import assert from "node:assert/strict"
import { test } from "node:test"
import {
  AuthActionError,
  claimGuestAudits,
  confirmSessionAndClaim,
  getAuthFlags,
  toBetterAuthSignup,
  toSafeCheckUser,
} from "../../src/components/safecheck/auth-logic"

test("session user is mapped to the SafeCheck identity", () => {
  const sessionUser = { id: "user-1", email: "a@example.test", name: "Alias", image: "ignored" }
  assert.deepEqual(
    toSafeCheckUser(sessionUser),
    { id: "user-1", email: "a@example.test", pseudo: "Alias" },
  )
})

test("signup sends only the Better Auth credentials and maps pseudo to name", () => {
  const input = {
    email: "a@example.test",
    password: "secret-password",
    pseudo: "Alias",
    role: "ADMIN",
    userId: "other-user",
    guestSubject: "guest-id",
  }
  assert.deepEqual(toBetterAuthSignup(input), {
    email: "a@example.test",
    password: "secret-password",
    name: "Alias",
  })
})

test("pending session remains loading even when a cached user exists", () => {
  const user = toSafeCheckUser({ id: "user-1", email: "a@example.test", name: "Alias" })
  assert.deepEqual(getAuthFlags(user, true), { isLoggedIn: false, isHydrated: false })
})

test("missing session is unauthenticated after hydration", () => {
  assert.deepEqual(getAuthFlags(null, false), { isLoggedIn: false, isHydrated: true })
})

test("confirmed session is authenticated", () => {
  const user = toSafeCheckUser({ id: "user-1", email: "a@example.test", name: "Alias" })
  assert.deepEqual(getAuthFlags(user, false), { isLoggedIn: true, isHydrated: true })
})

test("confirmed authentication attempts a credentialed guest claim", async () => {
  const requests: Array<{ url: URL; init: RequestInit }> = []
  const warnings: string[] = []
  const claim = await confirmSessionAndClaim("user-1", {
    getSession: async () => ({ data: { user: { id: "user-1" } } }),
    fetcher: async (url, init) => {
      requests.push({ url, init })
      return Response.json({ claimedCount: 1 })
    },
    apiOrigin: "http://localhost:3001",
    warn: (message) => warnings.push(message),
  })
  assert.equal(requests.length, 1)
  assert.equal(claim, "succeeded")
  assert.equal(requests[0].url.href, "http://localhost:3001/audits/claim-guest")
  assert.deepEqual(requests[0].init, { method: "POST", credentials: "include", cache: "no-store" })
  assert.deepEqual(warnings, [])
})

test("claim HTTP failure does not reject a confirmed authentication", async () => {
  const warnings: string[] = []
  const claim = await confirmSessionAndClaim("user-1", {
    getSession: async () => ({ data: { user: { id: "user-1" } } }),
    fetcher: async () => (Response.json({}, { status: 500 })),
    apiOrigin: "http://localhost:3001",
    warn: (message) => warnings.push(message),
  })
  assert.deepEqual(warnings, ["SafeCheck: guest audits could not be claimed"])
  assert.equal(claim, "failed")
})

test("guest claim invokes the browser fetch callback without rebinding its receiver", async () => {
  const warnings: string[] = []
  let calls = 0
  await confirmSessionAndClaim("user-1", {
    getSession: async () => ({ data: { user: { id: "user-1" } } }),
    fetcher: async function (this: unknown) {
      if (this !== undefined) throw new TypeError("Illegal invocation")
      calls++
      return Response.json({ claimedCount: 1 })
    },
    apiOrigin: "http://localhost:3001",
    warn: (message) => warnings.push(message),
  })
  assert.deepEqual(warnings, [])
  assert.equal(calls, 1)
})

test("claim network failure does not reject a confirmed authentication", async () => {
  const warnings: string[] = []
  const claim = await confirmSessionAndClaim("user-1", {
    getSession: async () => ({ data: { user: { id: "user-1" } } }),
    fetcher: async () => { throw new Error("offline") },
    apiOrigin: "http://localhost:3001",
    warn: (message) => warnings.push(message),
  })
  assert.equal(warnings.length, 1)
  assert.equal(claim, "failed")
})

test("an empty idempotent claim is still successful", async () => {
  assert.equal(await confirmSessionAndClaim("user-1", {
    getSession: async () => ({ data: { user: { id: "user-1" } } }),
    fetcher: async () => new Response(JSON.stringify({ claimedCount: 0 }), { status: 200 }),
    apiOrigin: "http://localhost:3001",
    warn: () => { throw new Error("Unexpected failure") },
  }), "unchanged")
})

test("an invalidated claim never posts under the next identity", async () => {
  const controller = new AbortController()
  controller.abort()
  let calls = 0
  const warnings: string[] = []
  const result = await claimGuestAudits({
    fetcher: async () => { calls++; return Response.json({ claimedCount: 1 }) },
    apiOrigin: "http://localhost:3001",
    warn: (message) => warnings.push(message),
  }, controller.signal)
  assert.equal(result, "failed")
  assert.equal(calls, 0)
  assert.deepEqual(warnings, [])
})

test("unconfirmed or mismatched session never attempts the claim", async () => {
  for (const getSession of [
    async () => ({ data: null }),
    async () => ({ data: { user: { id: "other-user" } } }),
    async () => ({ data: { user: { id: "user-1" } }, error: new Error("session failed") }),
  ]) {
    let claimCalls = 0
    await assert.rejects(
      confirmSessionAndClaim("user-1", {
        getSession,
        fetcher: async () => { claimCalls += 1; return Response.json({ claimedCount: 1 }) },
        apiOrigin: "http://localhost:3001",
        warn: () => {},
      }),
      (error: unknown) => error instanceof AuthActionError && error.kind === "network",
    )
    assert.equal(claimCalls, 0)
  }
})

test("session confirmation network exceptions become recoverable authentication errors", async () => {
  let claims = 0
  await assert.rejects(confirmSessionAndClaim("user-1", {
    getSession: async () => { throw new Error("transport") },
    fetcher: async () => { claims++; return Response.json({ claimedCount: 1 }) },
    apiOrigin: "http://localhost:3001",
    warn: () => {},
  }), (error: unknown) => error instanceof AuthActionError && error.kind === "network")
  assert.equal(claims, 0)
})
