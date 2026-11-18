import assert from "node:assert/strict"
import { test } from "node:test"
import { getTutorialProgress, getTutorialProgressSnapshots, saveTutorialProgress, TutorialProgressApiError } from "../../src/features/tutorials/api"
import { ApiPayloadError } from "../../src/lib/contracts/payload"

const dto = { tutorialId: 3, tutorialVersion: 1, currentStep: 2, completedSteps: [0, 1], createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-02T00:00:00Z" }

test("account GET preserves real activity timestamps through the shared validated client", async (t) => {
  const previousUrl = process.env.NEXT_PUBLIC_API_URL
  process.env.NEXT_PUBLIC_API_URL = "https://api.example.test"
  t.after(() => { if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL; else process.env.NEXT_PUBLIC_API_URL = previousUrl })
  let payload: unknown = { items: [dto] }
  const signal = new AbortController().signal
  t.mock.method(globalThis, "fetch", async (url: URL, init: RequestInit) => {
    assert.equal(url.href, "https://api.example.test/me/tutorial-progress")
    assert.equal(init.credentials, "include")
    assert.equal(init.signal?.aborted, false)
    return Response.json(payload)
  })
  assert.deepEqual(await getTutorialProgressSnapshots(signal), [dto])
  payload = { items: [{ ...dto, updatedAt: "invalid" }] }
  await assert.rejects(getTutorialProgressSnapshots(signal))
})

test("frontend GET uses configured API URL, credentials and no-store", async (t) => {
  const previousUrl = process.env.NEXT_PUBLIC_API_URL
  process.env.NEXT_PUBLIC_API_URL = "https://api.example.test"
  t.after(() => { if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL; else process.env.NEXT_PUBLIC_API_URL = previousUrl })
  const signal = new AbortController().signal
  t.mock.method(globalThis, "fetch", async (url: URL, init: RequestInit) => {
    assert.equal(url.href, "https://api.example.test/me/tutorial-progress")
    assert.equal(init.credentials, "include")
    assert.equal(init.cache, "no-store")
    assert.equal(init.signal?.aborted, false)
    return Response.json({ items: [dto] })
  })
  assert.deepEqual(await getTutorialProgress(signal), { 3: { currentStep: 2, completedSteps: [0, 1] } })
})

test("frontend PUT sends exactly the complete snapshot without a client userId", async (t) => {
  const previousUrl = process.env.NEXT_PUBLIC_API_URL
  process.env.NEXT_PUBLIC_API_URL = "https://api.example.test"
  t.after(() => { if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL; else process.env.NEXT_PUBLIC_API_URL = previousUrl })
  t.mock.method(globalThis, "fetch", async (url: URL, init: RequestInit) => {
    assert.equal(url.href, "https://api.example.test/me/tutorial-progress/3")
    assert.equal(init.credentials, "include")
    assert.equal(init.method, "PUT")
    assert.deepEqual(JSON.parse(init.body as string), { tutorialVersion: 1, currentStep: 2, completedSteps: [0, 1] })
    return Response.json(dto)
  })
  await saveTutorialProgress(3, { currentStep: 2, completedSteps: [0, 1] })
})

test("frontend HTTP failures stay failures, including unauthorized sessions", async (t) => {
  const previousUrl = process.env.NEXT_PUBLIC_API_URL
  process.env.NEXT_PUBLIC_API_URL = "https://api.example.test"
  t.after(() => { if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL; else process.env.NEXT_PUBLIC_API_URL = previousUrl })
  t.mock.method(globalThis, "fetch", async () => Response.json({ code: "UNAUTHENTICATED" }, { status: 401 }))
  await assert.rejects(getTutorialProgress(), (error: unknown) => error instanceof TutorialProgressApiError && error.status === 401)
  await assert.rejects(saveTutorialProgress(3, { currentStep: 0, completedSteps: [] }), TutorialProgressApiError)
})

test("tutorial save rejects mismatched response versions and controlled HTTP conflicts", async (t) => {
  const previousUrl = process.env.NEXT_PUBLIC_API_URL
  process.env.NEXT_PUBLIC_API_URL = "https://api.example.test"
  t.after(() => { if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL; else process.env.NEXT_PUBLIC_API_URL = previousUrl })
  let response = Response.json({ ...dto, tutorialVersion: 42 })
  t.mock.method(globalThis, "fetch", async () => response)
  await assert.rejects(saveTutorialProgress(3, { currentStep: 0, completedSteps: [] }), /Incompatible tutorial progress version/)
  response = Response.json({ code: "TUTORIAL_VERSION_CONFLICT" }, { status: 409 })
  await assert.rejects(saveTutorialProgress(3, { currentStep: 0, completedSteps: [] }), (error: unknown) => error instanceof TutorialProgressApiError && error.status === 409)
})

test("tutorial clients reject invalid JSON and preserve HTTP errors with malformed bodies", async (t) => {
  const previousUrl = process.env.NEXT_PUBLIC_API_URL
  process.env.NEXT_PUBLIC_API_URL = "https://api.example.test"
  t.after(() => { if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL; else process.env.NEXT_PUBLIC_API_URL = previousUrl })
  const calls = [
    () => getTutorialProgress(),
    () => getTutorialProgressSnapshots(),
    () => saveTutorialProgress(3, { currentStep: 0, completedSteps: [] }),
  ]
  t.mock.method(globalThis, "fetch", async () => new Response("not JSON"))
  for (const call of calls) await assert.rejects(call(), ApiPayloadError)
  t.mock.method(globalThis, "fetch", async () => new Response("not JSON", { status: 503 }))
  for (const call of calls) {
    await assert.rejects(call(), (error: unknown) => error instanceof TutorialProgressApiError && error.status === 503)
  }
})

test("tutorial read and write clients reject pre-abort and cancellation during body decoding", async (t) => {
  const previousUrl = process.env.NEXT_PUBLIC_API_URL
  process.env.NEXT_PUBLIC_API_URL = "https://api.example.test"
  t.after(() => { if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL; else process.env.NEXT_PUBLIC_API_URL = previousUrl })
  const calls = [
    (signal: AbortSignal) => getTutorialProgress(signal),
    (signal: AbortSignal) => getTutorialProgressSnapshots(signal),
    (signal: AbortSignal) => saveTutorialProgress(3, { currentStep: 0, completedSteps: [] }, signal),
  ]
  for (const call of calls) {
    const preAborted = new AbortController()
    preAborted.abort()
    const fetch = t.mock.method(globalThis, "fetch", async () => Response.json({ items: [dto] }))
    await assert.rejects(call(preAborted.signal), { name: "AbortError" })
    assert.equal(fetch.mock.callCount(), 0)

    const lateAborted = new AbortController()
    t.mock.method(globalThis, "fetch", async () => ({
      status: 200, ok: true, json: async () => {
        lateAborted.abort()
        return { items: [dto] }
      },
    }) as Response)
    await assert.rejects(call(lateAborted.signal), { name: "AbortError" })
  }
})
