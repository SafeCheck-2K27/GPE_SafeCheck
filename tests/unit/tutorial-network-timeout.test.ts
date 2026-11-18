import assert from "node:assert/strict"
import { test, type TestContext } from "node:test"
import { API_REQUEST_TIMEOUT_MS, ApiTimeoutError } from "../../src/lib/api-fetch"
import { getTutorialProgress, getTutorialProgressSnapshots, saveTutorialProgress } from "../../src/features/tutorials/api"
import { createTutorialSaveQueue } from "../../src/features/tutorials/save-queue"
import { createTutorialProgressController } from "../../src/features/tutorials/progress-controller"
import { loadAccountTutorials } from "../../src/features/account/tutorial-loading"

const s1 = { currentStep: 0, completedSteps: [0] }
const s2 = { currentStep: 2, completedSteps: [0, 1] }
const timestamp = "2026-01-02T00:00:00Z"

function transport(t: TestContext, stallBody: boolean) {
  const previous = process.env.NEXT_PUBLIC_API_URL
  process.env.NEXT_PUBLIC_API_URL = "https://api.example.test"
  t.after(() => {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_API_URL
    else process.env.NEXT_PUBLIC_API_URL = previous
  })
  t.mock.timers.enable({ apis: ["setTimeout"] })
  let stored = s1
  let puts = 0
  let gets = 0
  let begin!: () => void
  const started = new Promise<void>((resolve) => { begin = resolve })
  const dto = () => ({ tutorialId: 3, tutorialVersion: 1, ...stored, createdAt: timestamp, updatedAt: timestamp })
  t.mock.method(globalThis, "fetch", async (_url: URL, init: RequestInit) => {
    if (init.method === "PUT") {
      if (++puts === 1) {
        if (!stallBody) {
          begin()
          return new Promise<Response>(() => {}) // Deliberately ignores abort.
        }
        return { status: 200, ok: true, json: () => {
          begin()
          return new Promise<unknown>(() => {})
        } } as Response
      }
      const body = JSON.parse(init.body as string)
      stored = { currentStep: body.currentStep, completedSteps: body.completedSteps }
      return Response.json(dto())
    }
    gets++
    return Response.json({ items: [dto()] })
  })
  const auth = new AbortController()
  const queue = createTutorialSaveQueue(saveTutorialProgress, auth.signal)
  return { queue, auth, started, counts: () => ({ puts, gets }) }
}

for (const stallBody of [false, true]) {
  test(`Account waiting behind a stalled PUT ${stallBody ? "body" : "fetch"} recovers S2 after deadline and retry`, async (t) => {
    const { queue, auth, started, counts } = transport(t, stallBody)
    const rejected = assert.rejects(queue.enqueue(3, s2), ApiTimeoutError)
    await started
    const page = new AbortController()
    const destination = loadAccountTutorials(queue, getTutorialProgressSnapshots, page.signal)
    t.mock.timers.tick(API_REQUEST_TIMEOUT_MS)
    await rejected
    assert.deepEqual(await destination, { kind: "save-error" })
    assert.deepEqual(counts(), { puts: 1, gets: 0 })
    assert.equal(auth.signal.aborted, false)
    assert.deepEqual(queue.recoveries(), [{ tutorialId: 3, progress: s2, failed: true }])
    const result = await loadAccountTutorials(queue, getTutorialProgressSnapshots, page.signal, true)
    assert.equal(result.kind, "ready")
    if (result.kind !== "ready") assert.fail("Expected confirmed account snapshot")
    assert.equal(result.items[0].currentStep, s2.currentStep)
    assert.deepEqual(result.items[0].completedSteps, s2.completedSteps)
    assert.deepEqual(counts(), { puts: 2, gets: 1 })
    assert.deepEqual(queue.recoveries(), [])
  })
}

test("Tutorial destination releases hydration after timeout, displays unconfirmed S2 and retries it", async (t) => {
  const { queue, started, counts } = transport(t, false)
  const rejected = assert.rejects(queue.enqueue(3, s2), ApiTimeoutError)
  await started
  const controller = createTutorialProgressController({ load: getTutorialProgress, queue: () => queue })
  t.after(() => controller.dispose())
  const ready = new Promise<void>((resolve) => {
    const unsubscribe = controller.subscribe(() => {
      if (controller.getSnapshot().phase === "ready") { unsubscribe(); resolve() }
    })
  })
  controller.setIdentity("user-A")
  assert.equal(controller.getSnapshot().phase, "loading")
  t.mock.timers.tick(API_REQUEST_TIMEOUT_MS)
  await rejected
  await ready
  assert.deepEqual(controller.getSnapshot().progressById[3], s2)
  assert.deepEqual(controller.getSnapshot().saveErrors, [3])
  const saved = new Promise<void>((resolve) => {
    const unsubscribe = controller.subscribe(() => {
      const state = controller.getSnapshot()
      if (state.pending === 0 && state.saveErrors.length === 0) { unsubscribe(); resolve() }
    })
  })
  controller.retrySaves()
  await saved
  await queue.idle()
  assert.deepEqual(counts(), { puts: 2, gets: 1 })
  assert.deepEqual(queue.recoveries(), [])
  assert.deepEqual(controller.getSnapshot().progressById[3], s2)
})
