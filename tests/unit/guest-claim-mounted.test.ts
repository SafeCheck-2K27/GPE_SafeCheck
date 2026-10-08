import assert from "node:assert/strict"
import { before, beforeEach, afterEach, test, type TestContext } from "node:test"
import { JSDOM } from "jsdom"
import { act, createElement as h, StrictMode, useLayoutEffect, type ComponentType } from "react"
import { createRoot, type Root } from "react-dom/client"
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { SearchParamsContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime"
import { GUEST_CLAIM_TIMEOUT_MS } from "../../src/components/safecheck/guest-claim-recovery"
import { questionnaireV1 } from "../../src/features/audit/versions/questionnaire-v1"

// Each test file runs in its own Node process. Keep one browser and the real auth
// client for this file; replace only its network boundary, never provider callbacks.
const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", {
  url: "https://web.example.test/audit?auditId=guest-audit",
})
for (const name of ["window", "document", "navigator", "HTMLElement", "Element", "Node", "MutationObserver", "localStorage"] as const) {
  Object.defineProperty(globalThis, name, { configurable: true, value: dom.window[name] })
}
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true, self: dom.window })
dom.window.matchMedia = (query) => ({
  matches: false, media: query, onchange: null,
  addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => true,
})
process.env.NEXT_PUBLIC_API_URL = "https://api.example.test"

let AuthProvider: typeof import("../../src/components/safecheck/AuthProvider").AuthProvider
let useAuth: typeof import("../../src/components/safecheck/AuthProvider").useAuth
let I18nProvider: typeof import("../../src/components/safecheck/I18nProvider").I18nProvider
let AuditPage: ComponentType
let ResultatsPage: ComponentType
let authClient: typeof import("../../src/lib/auth-client").authClient
let root: Root | null = null
let auth: ReturnType<typeof useAuth>
let serverUser: string | null = "user-1"
let claims = 0
let reads = 0
let creations = 0
let guestOwned = true
let claimReply: (init: RequestInit) => Promise<Response>
let sessionReply: ((init: RequestInit) => Promise<Response>) | null = null
let auditReply: ((init: RequestInit) => Promise<Response>) | null = null
let createReply: (() => Promise<Response>) | null = null

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => { resolve = done })
  return { promise, resolve }
}

function sessionResponse() {
  return Response.json(serverUser ? {
    user: { id: serverUser, name: "Alias", email: "alias@example.test", emailVerified: false,
      createdAt: "2026-10-05T12:00:00.000Z", updatedAt: "2026-10-05T12:00:00.000Z" },
    session: { id: "session-1", userId: serverUser, expiresAt: "2027-10-05T12:00:00.000Z" },
  } : null)
}

function auditResponse(completed = false) {
  const answers = completed ? questionnaireV1.map((question) => ({ questionId: question.id, value: "a" })) : []
  return Response.json({ id: "guest-audit", status: completed ? "completed" : "in_progress", answeredCount: answers.length, answers,
    createdAt: "2026-10-05T12:00:00.000Z", updatedAt: "2026-10-05T12:00:00.000Z", questionnaireVersion: 1, scoringVersion: 1 })
}

function Probe() {
  const current = useAuth()
  useLayoutEffect(() => { auth = current }, [current])
  return h("output", { "data-auth": true }, `${current.user?.id ?? "guest"}:${current.authChanging}:${current.guestClaimStatus}:${current.accountAuditsRevision}`)
}

function getUserId() { return auth.user?.id }

async function flush() {
  await act(async () => { await new Promise<void>((done) => setImmediate(done)) })
}

async function until(predicate: () => boolean) {
  for (let turn = 0; turn < 40; turn++) {
    if (predicate()) return
    await flush()
  }
  assert.ok(predicate(), `Mounted condition did not settle: ${dom.window.document.body.textContent}`)
}

async function mount(Page?: ComponentType, strict = true) {
  root = createRoot(dom.window.document.getElementById("root")!)
  const router = { back() {}, forward() {}, refresh() {}, push() {}, replace() {}, prefetch() {} }
  const content = h(AppRouterContext.Provider, { value: router },
    h(SearchParamsContext.Provider, { value: new URL(dom.window.location.href).searchParams },
      h(I18nProvider, null, h(AuthProvider, null, h(Probe), Page ? h(Page) : null))))
  await act(async () => { root!.render(strict ? h(StrictMode, null, content) : content) })
  await flush()
}

async function unmount() {
  if (root) await act(async () => { root!.unmount() })
  root = null
  await flush()
}

async function clickRetry() {
  const button = [...dom.window.document.querySelectorAll("button")].find((node) => node.textContent === "Réessayer le rattachement")
  assert.ok(button, "The actual recovery notice must expose its retry button")
  await act(async () => { button.click() })
  await flush()
}

async function networkFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
    const path = new URL(input instanceof Request ? input.url : String(input)).pathname
    if (path === "/api/auth/get-session") return sessionReply ? sessionReply(init) : sessionResponse()
    if (path === "/api/auth/sign-in/email" || path === "/api/auth/sign-up/email") {
      serverUser = "user-1"
      return Response.json({ user: (await sessionResponse().json()).user })
    }
    if (path === "/api/auth/sign-out") { serverUser = null; return Response.json({ success: true }) }
    if (path === "/audits/claim-guest") {
      claims++
      assert.equal(init.credentials, "include")
      return claimReply(init)
    }
    if (path === "/audits" && init.method === "POST") { creations++; return createReply ? createReply() : auditResponse() }
    if (path === "/audits/guest-audit") {
      reads++
      return auditReply ? auditReply(init) : guestOwned ? Response.json({ code: "AUDIT_NOT_FOUND" }, { status: 404 }) : auditResponse()
    }
    throw new Error(`Unexpected network request ${path}`)
}

before(async () => {
  globalThis.fetch = networkFetch
  ;({ AuthProvider, useAuth } = await import("../../src/components/safecheck/AuthProvider"))
  ;({ I18nProvider } = await import("../../src/components/safecheck/I18nProvider"))
  ;({ default: AuditPage } = await import("../../src/app/audit/page"))
  ;({ default: ResultatsPage } = await import("../../src/app/resultats/page"))
  ;({ authClient } = await import("../../src/lib/auth-client"))
})

beforeEach(async (t) => {
  serverUser = "user-1"
  claims = reads = creations = 0
  guestOwned = true
  sessionReply = auditReply = createReply = null
  claimReply = async () => Response.json({}, { status: 503 })
  dom.window.history.replaceState(null, "", "/audit?auditId=guest-audit")
  if ("mock" in t) t.mock.method(console, "warn", () => {})
  // Use the real client's public store/refetch to hydrate from the network fake.
  await act(async () => { await authClient.$store.atoms.session.get().refetch() })
  assert.equal(authClient.$store.atoms.session.get().error, null)
})

afterEach(async () => { await unmount() })

for (const [route, Page, expected] of [
  ["/audit?auditId=guest-audit", () => AuditPage, "La cybersécurité, tu t'y connais ou pas ?"],
  ["/resultats?auditId=guest-audit", () => ResultatsPage, "Niveau selon ton score"],
] as const) {
  test(`${route}: mounted inaccessible screen recovers after notice retry without navigation`, async () => {
    dom.window.history.replaceState(null, "", route)
    const completed = route.startsWith("/resultats")
    auditReply = async () => guestOwned ? Response.json({ code: "AUDIT_NOT_FOUND" }, { status: 404 }) : auditResponse(completed)
    await mount(Page())
    await until(() => auth.guestClaimStatus === "failed" && reads >= 1)
    assert.match(dom.window.document.body.textContent!, /Cet audit est introuvable ou inaccessible/)
    assert.equal(claims, 1, "Strict Mode shares the restored session attempt")
    const previousReads = reads
    claimReply = async () => { guestOwned = false; return Response.json({ claimedCount: 1 }) }
    await clickRetry()
    await until(() => dom.window.document.body.textContent!.includes(expected))
    assert.equal(reads, previousReads + 1)
    assert.equal(auth.accountAuditsRevision, 1)
    assert.equal(getUserId(), "user-1")
    assert.equal(dom.window.location.pathname + dom.window.location.search, route)
    assert.equal(dom.window.document.cookie, "", "Recovery never reads an HttpOnly guest cookie from JavaScript")
  })
}

test("a fresh provider with a restored User retries once and restores a failed notice", async () => {
  await mount()
  await until(() => auth.guestClaimStatus === "failed")
  assert.equal(claims, 1)
  await unmount()
  await mount()
  await until(() => auth.guestClaimStatus === "failed")
  assert.equal(claims, 2)
  await flush()
  assert.equal(claims, 2, "Failure does not become an automatic retry loop")
  claimReply = async () => Response.json({ claimedCount: 1 })
  await clickRetry()
  assert.equal(auth.guestClaimStatus, "idle")
})

test("claim revision during /audit creation keeps its sole POST and completion", async () => {
  dom.window.history.replaceState(null, "", "/audit")
  const creation = deferred<Response>()
  const claim = deferred<Response>()
  createReply = () => creation.promise
  claimReply = () => claim.promise
  await mount(AuditPage)
  await until(() => claims === 1 && creations === 1)
  await act(async () => { claim.resolve(Response.json({ claimedCount: 1 })) })
  await until(() => auth.accountAuditsRevision === 1)
  assert.equal(creations, 1)
  await act(async () => { creation.resolve(auditResponse()) })
  await until(() => dom.window.location.search === "?auditId=guest-audit")
  assert.equal(creations, 1)
})

test("no-op restored claim preserves a mounted audit's active question", async () => {
  guestOwned = false
  const claim = deferred<Response>()
  claimReply = () => claim.promise
  await mount(AuditPage)
  await until(() => dom.window.document.body.textContent!.includes(questionnaireV1[0].text))
  const nextQuestion = dom.window.document.querySelector<HTMLButtonElement>('button[title="Navigation sur internet"]')
  // Use the existing visible progress navigation, if its label changes the test fails.
  const questionButton = nextQuestion ?? [...dom.window.document.querySelectorAll("button")].find((button) => button.textContent?.includes("Navigation sur internet"))
  assert.ok(questionButton)
  await act(async () => { questionButton.click() })
  assert.ok(dom.window.document.body.textContent!.includes(questionnaireV1[1].text))
  await act(async () => { claim.resolve(Response.json({ claimedCount: 0 })) })
  await until(() => auth.guestClaimStatus === "idle")
  assert.equal(auth.accountAuditsRevision, 0)
  assert.equal(reads, 1)
  assert.ok(dom.window.document.body.textContent!.includes(questionnaireV1[1].text))
})

async function deadlineCase(t: TestContext) {
  serverUser = null
  await act(async () => { await authClient.$store.atoms.session.get().refetch() })
  await mount()
  const late = deferred<Response>()
  let claimSignal: AbortSignal | undefined
  claimReply = async (init) => { claimSignal = init.signal as AbortSignal; return late.promise }
  t.mock.timers.enable({ apis: ["setTimeout"] })
  let login!: Promise<unknown>
  await act(async () => { login = auth.login("alias@example.test", "secret-password") })
  await until(() => claims === 1)
  assert.equal(auth.authChanging, true)
  // The recovery timeout must release the auth operation, even if fetch ignores abort.
  await act(async () => { t.mock.timers.tick(GUEST_CLAIM_TIMEOUT_MS) })
  await act(async () => { await login })
  assert.equal(auth.authChanging, false)
  assert.equal(getUserId(), "user-1")
  assert.equal(auth.guestClaimStatus, "failed")
  if (claimSignal) assert.equal(claimSignal.aborted, true)
  assert.equal(auth.accountAuditsRevision, 0)
  await act(async () => { late.resolve(Response.json({ claimedCount: 1 })) })
  await flush()
  assert.equal(auth.guestClaimStatus, "failed")
  assert.equal(auth.accountAuditsRevision, 0)
  claimReply = async () => Response.json({ claimedCount: 1 })
  await clickRetry()
  await until(() => auth.accountAuditsRevision === 1)
  assert.equal(auth.guestClaimStatus, "idle")
  assert.equal(claims, 2, "Normal login does not duplicate its claim with the restored-session effect")
}

test("mounted login settles on suspended claim and remains retryable", { timeout: 5000 }, deadlineCase)
test("mounted restored claim bounds suspended reconfirmation and blocks its late POST", { timeout: 5000 }, async (t) => {
  const late = deferred<Response>()
  let confirmations = 0
  const signals: AbortSignal[] = []
  sessionReply = async (init) => { confirmations++; signals.push(init.signal as AbortSignal); return late.promise }
  t.mock.timers.enable({ apis: ["setTimeout"] })
  await mount()
  await until(() => confirmations >= 1 && auth.guestClaimStatus === "pending")
  // Native cancellation and the promise race cover the whole reconfirmation.
  await act(async () => { t.mock.timers.tick(GUEST_CLAIM_TIMEOUT_MS) })
  await until(() => auth.guestClaimStatus === "failed")
  assert.equal(getUserId(), "user-1")
  assert.equal(claims, 0)
  assert.ok(signals.some((signal) => signal.aborted), "Recovery abort reaches native session transport")
  sessionReply = null
  await act(async () => { late.resolve(sessionResponse()) })
  await flush()
  assert.equal(claims, 0, "Late confirmation cannot send a cookie after deadline")
  assert.equal(auth.guestClaimStatus, "failed")
  claimReply = async () => Response.json({ claimedCount: 1 })
  await clickRetry()
  await until(() => auth.accountAuditsRevision === 1)
})

test("old identity's ignored claim cannot affect the new confirmed User", async () => {
  const old = deferred<Response>()
  let oldSignal!: AbortSignal
  claimReply = async (init) => {
    if (serverUser === "user-1") { oldSignal = init.signal as AbortSignal; return old.promise }
    return Response.json({ claimedCount: 0 })
  }
  await mount()
  await until(() => claims === 1)
  serverUser = "user-2"
  await act(async () => { await authClient.$store.atoms.session.get().refetch() })
  await until(() => auth.user?.id === "user-2")
  await until(() => auth.guestClaimStatus === "idle" && claims === 2)
  assert.equal(oldSignal.aborted, true)
  await act(async () => { old.resolve(Response.json({ claimedCount: 1 })) })
  assert.equal(auth.accountAuditsRevision, 0)
  assert.equal(getUserId(), "user-2")
})

test("manual retry invalidated by another User releases its lock and starts that User's restored claim", async () => {
  await mount()
  await until(() => auth.guestClaimStatus === "failed")
  const old = deferred<Response>()
  let oldSignal!: AbortSignal
  claimReply = async (init) => {
    if (serverUser === "user-1") { oldSignal = init.signal as AbortSignal; return old.promise }
    return Response.json({ claimedCount: 0 })
  }
  await clickRetry()
  await until(() => claims === 2 && auth.guestClaimStatus === "pending")
  serverUser = "user-2"
  await act(async () => { await authClient.$store.atoms.session.get().refetch() })
  await until(() => claims === 3 && auth.guestClaimStatus === "idle")
  assert.equal(oldSignal.aborted, true)
  assert.equal(getUserId(), "user-2")
  await act(async () => { old.resolve(Response.json({ claimedCount: 1 })) })
  assert.equal(auth.accountAuditsRevision, 0)
})

test("malformed successful claim remains failed, with no route invalidation", async () => {
  await mount(AuditPage)
  await until(() => auth.guestClaimStatus === "failed" && reads === 1)
  claimReply = async () => Response.json({})
  await clickRetry()
  await until(() => auth.guestClaimStatus === "failed")
  assert.equal(auth.accountAuditsRevision, 0)
  assert.equal(reads, 1)
})

test("confirmed logout then same User restoration makes a fresh Guest claim attempt", async () => {
  await mount()
  await until(() => auth.guestClaimStatus === "failed")
  await act(async () => { await auth.logout() })
  assert.equal(auth.user, null)
  assert.equal(auth.guestClaimStatus, "idle")
  serverUser = "user-1"
  await act(async () => { await authClient.$store.atoms.session.get().refetch() })
  await until(() => claims === 2 && auth.guestClaimStatus === "failed")
  assert.equal(getUserId(), "user-1")
})

test("unresolved session lookup and retry preserve failed recovery for the same User", async () => {
  await mount()
  await until(() => auth.guestClaimStatus === "failed")
  sessionReply = async () => Response.json({}, { status: 503 })
  await act(async () => { await auth.retrySession() })
  assert.equal(auth.sessionError, true)
  assert.equal(auth.user, null)
  sessionReply = null
  await act(async () => { await auth.retrySession() })
  await until(() => auth.user?.id === "user-1")
  assert.equal(auth.guestClaimStatus, "failed")
  assert.equal(claims, 1, "Session retry preserves the explicit claim recovery instead of silently retrying")
  claimReply = async () => Response.json({ claimedCount: 1 })
  await clickRetry()
  assert.equal(auth.accountAuditsRevision, 1)
})

test("pending restored claim reports a competing logout as busy and deadline releases it", { timeout: 5000 }, async (t) => {
  claimReply = () => new Promise<Response>(() => {})
  t.mock.timers.enable({ apis: ["setTimeout"] })
  await mount()
  await until(() => auth.guestClaimStatus === "pending" && claims === 1)
  await assert.rejects(auth.logout(), (error: unknown) => error instanceof Error && error.message === "busy")
  assert.equal(serverUser, "user-1")
  await act(async () => { t.mock.timers.tick(GUEST_CLAIM_TIMEOUT_MS) })
  await until(() => auth.guestClaimStatus === "failed")
  await act(async () => { await auth.logout() })
  assert.equal(serverUser, null)
  assert.equal(auth.user, null)
})

for (const [route, Page, expected] of [
  ["/audit?auditId=guest-audit", () => AuditPage, questionnaireV1[0].text],
  ["/resultats?auditId=guest-audit", () => ResultatsPage, "Niveau selon ton score"],
] as const) {
  test(`${route}: lost claim response then zero-count retry refreshes inaccessible data`, async () => {
    dom.window.history.replaceState(null, "", route)
    const firstClaim = deferred<Response>()
    claimReply = () => firstClaim.promise
    auditReply = async () => guestOwned ? Response.json({ code: "AUDIT_NOT_FOUND" }, { status: 404 }) : auditResponse(route.startsWith("/resultats"))
    await mount(Page())
    await until(() => dom.window.document.body.textContent!.includes("Cet audit est introuvable ou inaccessible"))
    // Server commits after the original read, but its HTTP response is lost.
    guestOwned = false
    await act(async () => { firstClaim.resolve(Response.json({}, { status: 503 })) })
    await until(() => auth.guestClaimStatus === "failed")
    const previousReads = reads
    claimReply = async () => Response.json({ claimedCount: 0 })
    await clickRetry()
    await until(() => dom.window.document.body.textContent!.includes(expected))
    assert.equal(reads, previousReads + 1)
    assert.equal(auth.accountAuditsRevision, 1)
    assert.equal(dom.window.location.pathname + dom.window.location.search, route)
  })

  test(`${route}: late old GET cannot overwrite the recovered GET`, async () => {
    dom.window.history.replaceState(null, "", route)
    const oldRead = deferred<Response>()
    const oldSignals: AbortSignal[] = []
    auditReply = async (init) => {
      if (guestOwned) {
        oldSignals.push(init.signal as AbortSignal)
        return oldRead.promise.then((response) => response.clone())
      }
      return auditResponse(route.startsWith("/resultats"))
    }
    await mount(Page())
    await until(() => auth.guestClaimStatus === "failed" && oldSignals.length >= 1)
    claimReply = async () => { guestOwned = false; return Response.json({ claimedCount: 1 }) }
    await clickRetry()
    await until(() => dom.window.document.body.textContent!.includes(expected))
    assert.ok(oldSignals.every((signal) => signal.aborted))
    await act(async () => { oldRead.resolve(Response.json({ code: "AUDIT_NOT_FOUND" }, { status: 404 })) })
    await flush()
    assert.ok(dom.window.document.body.textContent!.includes(expected))
    assert.doesNotMatch(dom.window.document.body.textContent!, /Cet audit est introuvable ou inaccessible/)
  })
}
