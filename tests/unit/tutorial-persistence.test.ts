import assert from "node:assert/strict"
import { test } from "node:test"
import { authRequestSignal, invalidateAuthRequests } from "../../src/lib/auth-request-lifecycle"
import { tutoriels } from "../../src/features/tutorials/data/catalog"
import { tutorialProgressFromResponse } from "../../src/features/tutorials/hydration"
import { createTutorialProgressController } from "../../src/features/tutorials/progress-controller"
import { createTutorialSaveQueue } from "../../src/features/tutorials/save-queue"
import type { TutorialProgress } from "../../src/features/tutorials/progress"

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
const tutorial = tutoriels.find((item) => item.id === 3)!
const dto = { tutorialId: tutorial.id, tutorialVersion: tutorial.version, currentStep: 2, completedSteps: [0, 1], createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-02T00:00:00Z" }
const a = { currentStep: 1, completedSteps: [0] }
const b = { currentStep: 2, completedSteps: [0, 1] }
type Controller = ReturnType<typeof createTutorialProgressController>
function until(controller: Controller, predicate: (state: ReturnType<Controller["getSnapshot"]>) => boolean) {
  if (predicate(controller.getSnapshot())) return Promise.resolve()
  return new Promise<void>((resolve) => {
    const unsubscribe = controller.subscribe(() => {
      if (predicate(controller.getSnapshot())) { unsubscribe(); resolve() }
    })
  })
}

for (const outcome of ["success", "failure"] as const) {
  test(`same controller reactivates after effect replay and ignores old GET ${outcome}`, { timeout: 2000 }, async () => {
    const firstStarted = deferred<void>()
    const oldResponse = deferred<Record<number, TutorialProgress>>()
    const oldSettled = oldResponse.promise.catch(() => {})
    let oldSignal!: AbortSignal
    let calls = 0
    const queue = createTutorialSaveQueue(async () => {}, new AbortController().signal)
    const controller = createTutorialProgressController({
      load: (signal) => {
        if (++calls === 1) { oldSignal = signal; firstStarted.resolve(); return oldResponse.promise }
        return Promise.resolve({ [tutorial.id]: a })
      },
      queue: () => queue,
    })
    controller.setIdentity("A")
    await firstStarted.promise
    controller.dispose()
    assert.equal(oldSignal.aborted, true)
    assert.equal(controller.updateProgress(tutorial, () => b), false)
    controller.setIdentity("A")
    await until(controller, (state) => state.phase === "ready")
    const fresh = controller.getSnapshot()
    assert.equal(calls, 2)
    assert.deepEqual(fresh.progressById[tutorial.id], a)
    if (outcome === "success") oldResponse.resolve({ [tutorial.id]: b })
    else oldResponse.reject(new Error("obsolete GET failed"))
    await oldSettled
    assert.equal(controller.getSnapshot(), fresh)
    controller.dispose()
  })

  test(`same controller replay during PUT ${outcome} waits and restores confirmed or recoverable progress`, { timeout: 2000 }, async () => {
    const saveStarted = deferred<void>()
    const saveFinish = deferred<void>()
    let stored: Record<number, TutorialProgress> = { [tutorial.id]: a }
    let saves = 0
    let loads = 0
    const queue = createTutorialSaveQueue(async (id, progress) => {
      if (++saves === 1) { saveStarted.resolve(); await saveFinish.promise }
      stored = { [id]: progress }
    }, new AbortController().signal)
    const controller = createTutorialProgressController({ load: async () => { loads++; return stored }, queue: () => queue })
    controller.setIdentity("A")
    await until(controller, (state) => state.phase === "ready")
    controller.updateProgress(tutorial, () => b)
    await saveStarted.promise
    controller.dispose()
    controller.setIdentity("A")
    assert.equal(controller.getSnapshot().phase, "loading")
    assert.equal(controller.getSnapshot().pending, 0)
    assert.equal(loads, 1)
    if (outcome === "success") saveFinish.resolve()
    else saveFinish.reject(new Error("PUT failed during replay"))
    await until(controller, (state) => state.phase === "ready")
    assert.deepEqual(controller.getSnapshot().progressById[tutorial.id], b)
    assert.equal(controller.getSnapshot().pending, 0)
    assert.equal(saves, 1)
    assert.equal(loads, 2)
    assert.deepEqual(controller.getSnapshot().saveErrors, outcome === "success" ? [] : [tutorial.id])
    if (outcome === "failure") {
      assert.deepEqual(stored[tutorial.id], a)
      controller.retrySaves()
      await until(controller, (state) => state.pending === 0)
      assert.deepEqual(stored[tutorial.id], b)
      assert.deepEqual(controller.getSnapshot().saveErrors, [])
    }
    controller.dispose()
  })

  test(`same controller identity change during PUT ignores A's late ${outcome} under B`, { timeout: 2000 }, async () => {
    const saveStarted = deferred<void>()
    const saveFinish = deferred<void>()
    const oldSignal = authRequestSignal()
    const oldQueue = createTutorialSaveQueue(async () => { saveStarted.resolve(); await saveFinish.promise }, oldSignal)
    const newQueue = createTutorialSaveQueue(async () => {}, new AbortController().signal)
    let loads = 0
    const controller = createTutorialProgressController({
      load: async () => ++loads === 1 ? { [tutorial.id]: a } : {},
      queue: (identity) => identity === "A" ? oldQueue : newQueue,
    })
    controller.setIdentity("A")
    await until(controller, (state) => state.phase === "ready")
    controller.updateProgress(tutorial, () => b)
    await saveStarted.promise
    invalidateAuthRequests()
    controller.dispose()
    controller.setIdentity("B")
    assert.deepEqual(controller.getSnapshot().progressById, {})
    await until(controller, (state) => state.phase === "ready")
    const fresh = controller.getSnapshot()
    if (outcome === "success") saveFinish.resolve()
    else saveFinish.reject(new Error("old identity PUT failed"))
    await oldQueue.idle()
    assert.equal(controller.getSnapshot(), fresh)
    assert.deepEqual(fresh, { identity: "B", phase: "ready", progressById: {}, pending: 0, saveErrors: [] })
    assert.deepEqual(oldQueue.recoveries(), [])
    assert.equal(controller.updateProgress(tutorial, () => a), true)
    await until(controller, (state) => state.pending === 0)
    assert.deepEqual(controller.getSnapshot().progressById[tutorial.id], a)
    controller.dispose()
  })
}

test("hydration maps DTOs through the domain and ignores removed catalog IDs", () => {
  assert.deepEqual(tutorialProgressFromResponse({ items: [dto] }), { [tutorial.id]: { currentStep: 2, completedSteps: [0, 1] } })
  assert.deepEqual(tutorialProgressFromResponse({ items: [{ ...dto, currentStep: 999, completedSteps: [2, 0, 2, -1, 999] }] }), {
    [tutorial.id]: { currentStep: tutorial.steps.length - 1, completedSteps: [0, 2] },
  })
  assert.deepEqual(tutorialProgressFromResponse({ items: [{ ...dto, tutorialId: 99999 }] }), {})
})

test("hydration distinguishes an empty response from malformed snapshots", () => {
  assert.deepEqual(tutorialProgressFromResponse({ items: [] }), {})
  for (const payload of [null, {}, { items: null }, { items: [{ ...dto, currentStep: "2" }] },
    { items: [{ ...dto, completedSteps: ["1"] }] }, { items: [{ ...dto, updatedAt: "invalid" }] }, { items: [dto, dto] }]) {
    assert.throws(() => tutorialProgressFromResponse(payload))
  }
})

test("reader refuses incompatible versions before reinterpreting persisted indices", () => {
  assert.throws(() => tutorialProgressFromResponse({ items: [{ ...dto, tutorialVersion: tutorial.version + 1, currentStep: 999, completedSteps: [999] }] }), /Incompatible tutorial progress version/)
  for (const tutorialVersion of [undefined, 0, -1, 1.5, "1", null, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => tutorialProgressFromResponse({ items: [{ ...dto, tutorialVersion }] }), /Invalid tutorial progress response/)
  }
  assert.deepEqual(tutorialProgressFromResponse({ items: [{ ...dto, tutorialId: 99999, tutorialVersion: 42 }] }), {})
})

test("slow save A finishes before save B for the same tutorial", async () => {
  const started = deferred<void>()
  const finishA = deferred<void>()
  const calls: TutorialProgress[] = []
  let stored: TutorialProgress | undefined
  const queue = createTutorialSaveQueue(async (_, snapshot) => {
    calls.push(snapshot)
    if (calls.length === 1) { started.resolve(); await finishA.promise }
    stored = snapshot
  }, new AbortController().signal)
  const first = queue.enqueue(3, a)
  const second = queue.enqueue(3, b)
  await started.promise
  assert.deepEqual(calls, [a])
  finishA.resolve()
  await Promise.all([first, second])
  assert.deepEqual(calls, [a, b])
  assert.deepEqual(stored, b)
})

test("save queues are independent between tutorial IDs", async () => {
  const firstStarted = deferred<void>()
  const finishFirst = deferred<void>()
  const calls: number[] = []
  const queue = createTutorialSaveQueue(async (id) => {
    calls.push(id)
    if (id === 3) { firstStarted.resolve(); await finishFirst.promise }
  }, new AbortController().signal)
  const first = queue.enqueue(3, a)
  await firstStarted.promise
  await queue.enqueue(8, b)
  assert.deepEqual(calls, [3, 8])
  finishFirst.resolve()
  await first
})

test("a rejected save does not poison later snapshots", async () => {
  const calls: TutorialProgress[] = []
  const queue = createTutorialSaveQueue(async (_, snapshot) => {
    calls.push(snapshot)
    if (calls.length === 1) throw new Error("Offline")
  }, new AbortController().signal)
  const first = queue.enqueue(3, a)
  const second = queue.enqueue(3, b)
  await assert.rejects(first)
  await second
  await queue.idle()
  assert.deepEqual(calls, [a, b])
})

test("auth invalidation prevents queued jobs from using another session", async () => {
  const started = deferred<void>()
  const finish = deferred<void>()
  const oldSignal = authRequestSignal()
  const calls: TutorialProgress[] = []
  const queue = createTutorialSaveQueue(async (_, snapshot, signal) => {
    calls.push(snapshot)
    assert.equal(signal, oldSignal)
    started.resolve()
    await finish.promise
  }, oldSignal)
  const first = queue.enqueue(3, a)
  const second = queue.enqueue(3, b)
  const rejected = assert.rejects(second, { name: "AbortError" })
  await started.promise
  invalidateAuthRequests()
  assert.equal(oldSignal.aborted, true)
  assert.notEqual(authRequestSignal(), oldSignal)
  finish.resolve()
  await first
  await rejected
  assert.deepEqual(calls, [a])
})

test("queue captures snapshots instead of retaining mutable input arrays", async () => {
  const input = { currentStep: 1, completedSteps: [0] }
  let saved: TutorialProgress | undefined
  const queue = createTutorialSaveQueue(async (_, snapshot) => { saved = snapshot }, new AbortController().signal)
  const pending = queue.enqueue(3, input)
  input.completedSteps.push(1)
  await pending
  assert.deepEqual(saved, a)
})

test("auth loading and guest never call the progression backend", () => {
  const controller = createTutorialProgressController({ load: async () => { throw new Error("Unexpected GET") }, queue: () => { throw new Error("Unexpected PUT") } })
  controller.setIdentity(undefined)
  assert.equal(controller.updateProgress(tutorial), false)
  controller.setIdentity(null)
  assert.equal(controller.updateProgress(tutorial), true)
  assert.equal(controller.updateProgress(tutorial, () => b), true)
  assert.deepEqual(controller.getSnapshot().progressById[tutorial.id], b)
  assert.equal(controller.getSnapshot().pending, 0)
})

test("user mutations are blocked until GET hydration finishes", async () => {
  const started = deferred<void>()
  const response = deferred<Record<number, TutorialProgress>>()
  const queue = createTutorialSaveQueue(async () => {}, new AbortController().signal)
  const controller = createTutorialProgressController({ load: () => { started.resolve(); return response.promise }, queue: () => queue })
  controller.setIdentity("A")
  await started.promise
  assert.equal(controller.getSnapshot().phase, "loading")
  assert.equal(controller.updateProgress(tutorial, () => b), false)
  response.resolve({ [tutorial.id]: a })
  await until(controller, (state) => state.phase === "ready")
  assert.deepEqual(controller.getSnapshot().progressById[tutorial.id], a)
})

test("GET failure stays a User error and can be retried without pretending to be empty", async () => {
  let calls = 0
  const queue = createTutorialSaveQueue(async () => {}, new AbortController().signal)
  const controller = createTutorialProgressController({ load: async () => { if (++calls === 1) throw new Error("Offline"); return { [tutorial.id]: b } }, queue: () => queue })
  controller.setIdentity("A")
  await until(controller, (state) => state.phase === "error")
  assert.equal(controller.getSnapshot().identity, "A")
  assert.equal(controller.updateProgress(tutorial), false)
  controller.retryHydration()
  await until(controller, (state) => state.phase === "ready")
  assert.deepEqual(controller.getSnapshot().progressById[tutorial.id], b)
})

test("logout clears User progress and ignores a stale hydration response", async () => {
  const started = deferred<void>()
  const response = deferred<Record<number, TutorialProgress>>()
  const queue = createTutorialSaveQueue(async () => {}, new AbortController().signal)
  let loadSignal: AbortSignal | undefined
  const controller = createTutorialProgressController({ load: (signal) => { loadSignal = signal; started.resolve(); return response.promise }, queue: () => queue })
  controller.setIdentity("A")
  await started.promise
  controller.setIdentity(null)
  assert.equal(loadSignal?.aborted, true)
  response.resolve({ [tutorial.id]: b })
  await response.promise
  assert.equal(controller.getSnapshot().identity, null)
  assert.deepEqual(controller.getSnapshot().progressById, {})
})

test("User A to User B never carries A's map or accepts A's late GET", async () => {
  const started = deferred<void>()
  const old = deferred<Record<number, TutorialProgress>>()
  let calls = 0
  const queue = createTutorialSaveQueue(async () => {}, new AbortController().signal)
  const controller = createTutorialProgressController({ load: () => { if (++calls === 1) { started.resolve(); return old.promise }; return Promise.resolve({}) }, queue: () => queue })
  controller.setIdentity("A")
  await started.promise
  controller.setIdentity("B")
  await until(controller, (state) => state.phase === "ready")
  old.resolve({ [tutorial.id]: b })
  await old.promise
  assert.equal(controller.getSnapshot().identity, "B")
  assert.deepEqual(controller.getSnapshot().progressById, {})
})

test("guest progress is not claimed when a User logs in", async () => {
  let saves = 0
  const queue = createTutorialSaveQueue(async () => { saves++ }, new AbortController().signal)
  const controller = createTutorialProgressController({ load: async () => ({ [tutorial.id]: a }), queue: () => queue })
  controller.setIdentity(null)
  controller.updateProgress(tutorial, () => b)
  controller.setIdentity("A")
  assert.deepEqual(controller.getSnapshot().progressById, {})
  await until(controller, (state) => state.phase === "ready")
  assert.deepEqual(controller.getSnapshot().progressById[tutorial.id], a)
  assert.equal(saves, 0)
})

test("PUT errors preserve optimistic state; retry sends the current full snapshot", async () => {
  const calls: TutorialProgress[] = []
  const queue = createTutorialSaveQueue(async (_, progress) => { calls.push(progress); if (calls.length === 1) throw new Error("Offline") }, new AbortController().signal)
  const controller = createTutorialProgressController({ load: async () => ({}), queue: () => queue })
  controller.setIdentity("A")
  await until(controller, (state) => state.phase === "ready")
  controller.updateProgress(tutorial, () => b)
  assert.deepEqual(controller.getSnapshot().progressById[tutorial.id], b)
  await until(controller, (state) => state.saveErrors.length === 1)
  assert.equal(controller.getSnapshot().identity, "A")
  assert.deepEqual(controller.getSnapshot().progressById[tutorial.id], b)
  controller.retrySaves()
  await until(controller, (state) => state.pending === 0)
  assert.deepEqual(controller.getSnapshot().saveErrors, [])
  assert.deepEqual(calls, [b, b])
})

test("old successful PUTs never overwrite newer optimistic local state", async () => {
  const started = deferred<void>()
  const finish = deferred<void>()
  let calls = 0
  const queue = createTutorialSaveQueue(async () => { if (++calls === 1) { started.resolve(); await finish.promise } }, new AbortController().signal)
  const controller = createTutorialProgressController({ load: async () => ({}), queue: () => queue })
  controller.setIdentity("A")
  await until(controller, (state) => state.phase === "ready")
  controller.updateProgress(tutorial, () => a)
  await started.promise
  controller.updateProgress(tutorial, () => b)
  assert.deepEqual(controller.getSnapshot().progressById[tutorial.id], b)
  finish.resolve()
  await until(controller, (state) => state.pending === 0)
  assert.deepEqual(controller.getSnapshot().progressById[tutorial.id], b)
})

test("route destinations wait for source saves before hydrating from DB", async () => {
  const started = deferred<void>()
  const finish = deferred<void>()
  let stored: Record<number, TutorialProgress> = {}
  const queue = createTutorialSaveQueue(async (id, progress) => { started.resolve(); await finish.promise; stored = { [id]: progress } }, new AbortController().signal)
  const dependencies = { load: async () => stored, queue: () => queue }
  const source = createTutorialProgressController(dependencies)
  source.setIdentity("A")
  await until(source, (state) => state.phase === "ready")
  source.updateProgress(tutorial, () => b)
  await started.promise
  source.dispose()
  const destination = createTutorialProgressController(dependencies)
  destination.setIdentity("A")
  assert.equal(destination.getSnapshot().phase, "loading")
  finish.resolve()
  await until(destination, (state) => state.phase === "ready")
  assert.deepEqual(destination.getSnapshot().progressById[tutorial.id], b)
})

test("reopening unchanged progress does not issue an unnecessary PUT", async () => {
  let saves = 0
  const queue = createTutorialSaveQueue(async () => { saves++ }, new AbortController().signal)
  const controller = createTutorialProgressController({ load: async () => ({ [tutorial.id]: b }), queue: () => queue })
  controller.setIdentity("A")
  await until(controller, (state) => state.phase === "ready")
  assert.equal(controller.updateProgress(tutorial), true)
  await queue.idle()
  assert.equal(saves, 0)
})

test("failed PUT across navigation preserves S2 and retry restores it from DB on reload", async () => {
  const started = deferred<void>()
  const finish = deferred<void>()
  let stored: Record<number, TutorialProgress> = { [tutorial.id]: a }
  let calls = 0
  const queue = createTutorialSaveQueue(async (id, progress) => {
    if (++calls === 1) { started.resolve(); await finish.promise }
    stored = { [id]: progress }
  }, new AbortController().signal)
  const dependencies = { load: async () => stored, queue: () => queue }
  const source = createTutorialProgressController(dependencies)
  source.setIdentity("A")
  await until(source, (state) => state.phase === "ready")
  source.updateProgress(tutorial, () => b)
  await started.promise
  source.dispose()
  const destination = createTutorialProgressController(dependencies)
  destination.setIdentity("A")
  finish.reject(new Error("PUT failed after navigation"))
  await until(destination, (state) => state.phase === "ready")
  assert.deepEqual(destination.getSnapshot().progressById[tutorial.id], b)
  assert.deepEqual(destination.getSnapshot().saveErrors, [tutorial.id])
  assert.deepEqual(stored[tutorial.id], a)
  destination.retrySaves()
  await until(destination, (state) => state.pending === 0)
  assert.deepEqual(destination.getSnapshot().saveErrors, [])
  assert.deepEqual(stored[tutorial.id], b)
  destination.dispose()
  // A full reload has no in-memory transport state and reads only confirmed DB data.
  const reload = createTutorialProgressController({
    load: async () => stored,
    queue: () => createTutorialSaveQueue(async () => {}, new AbortController().signal),
  })
  reload.setIdentity("A")
  await until(reload, (state) => state.phase === "ready")
  assert.deepEqual(reload.getSnapshot().progressById[tutorial.id], b)
  assert.deepEqual(reload.getSnapshot().saveErrors, [])
})

test("an old PUT success cannot clear a newer unconfirmed snapshot and recovery is copied", async () => {
  const firstStarted = deferred<void>()
  const firstFinish = deferred<void>()
  const secondStarted = deferred<void>()
  const secondFinish = deferred<void>()
  let calls = 0
  const queue = createTutorialSaveQueue(async () => {
    if (++calls === 1) { firstStarted.resolve(); await firstFinish.promise }
    else { secondStarted.resolve(); await secondFinish.promise }
  }, new AbortController().signal)
  const first = queue.enqueue(3, a)
  await firstStarted.promise
  const input = { currentStep: b.currentStep, completedSteps: [...b.completedSteps] }
  const second = queue.enqueue(3, input)
  const rejected = assert.rejects(second)
  input.completedSteps.push(4)
  firstFinish.resolve()
  await first
  await secondStarted.promise
  const recoveries = queue.recoveries()
  assert.deepEqual(recoveries, [{ tutorialId: 3, progress: b, failed: false }])
  recoveries[0].progress.completedSteps.push(4)
  assert.deepEqual(queue.recoveries(), [{ tutorialId: 3, progress: b, failed: false }])
  secondFinish.reject(new Error("newer PUT failed"))
  await rejected
  assert.deepEqual(queue.recoveries(), [{ tutorialId: 3, progress: b, failed: true }])
})

test("a newer successful snapshot clears recovery after an older failed PUT", async () => {
  const started = deferred<void>()
  const finish = deferred<void>()
  let calls = 0
  const queue = createTutorialSaveQueue(async () => {
    if (++calls === 1) { started.resolve(); await finish.promise }
  }, new AbortController().signal)
  const first = queue.enqueue(3, a)
  const rejected = assert.rejects(first)
  await started.promise
  const second = queue.enqueue(3, b)
  finish.reject(new Error("older PUT failed"))
  await rejected
  await second
  await queue.idle()
  assert.deepEqual(queue.recoveries(), [])
  await queue.retryFailed()
  assert.equal(calls, 2)
})

test("GET failure after navigation keeps PUT recovery and retry saves before reloading", async () => {
  let stored: Record<number, TutorialProgress> = { [tutorial.id]: a }
  let saves = 0
  let loads = 0
  const queue = createTutorialSaveQueue(async (id, progress) => {
    if (++saves <= 2) throw new Error("PUT failed")
    stored = { [id]: progress }
  }, new AbortController().signal)
  const dependencies = {
    load: async () => { if (++loads === 2 || loads === 3) throw new Error("GET failed"); return stored },
    queue: () => queue,
  }
  const source = createTutorialProgressController(dependencies)
  source.setIdentity("A")
  await until(source, (state) => state.phase === "ready")
  source.updateProgress(tutorial, () => b)
  source.dispose()
  const destination = createTutorialProgressController(dependencies)
  destination.setIdentity("A")
  await until(destination, (state) => state.phase === "error")
  assert.deepEqual(destination.getSnapshot().progressById[tutorial.id], b)
  assert.deepEqual(destination.getSnapshot().saveErrors, [tutorial.id])
  assert.equal(destination.updateProgress(tutorial, () => a), false)
  destination.retryHydration()
  await until(destination, (state) => state.phase === "error")
  assert.deepEqual(destination.getSnapshot().saveErrors, [tutorial.id])
  assert.deepEqual(destination.getSnapshot().progressById[tutorial.id], b)
  destination.retryHydration()
  await until(destination, (state) => state.phase === "ready")
  assert.deepEqual(stored[tutorial.id], b)
  assert.deepEqual(destination.getSnapshot().progressById[tutorial.id], b)
  assert.deepEqual(destination.getSnapshot().saveErrors, [])
  assert.equal(saves, 3)
})

for (const outcome of ["success", "failure"] as const) {
  test(`Auth invalidation clears recovery immediately and late PUT ${outcome} cannot recreate it`, async () => {
    const started = deferred<void>()
    const finish = deferred<void>()
    const oldSignal = authRequestSignal()
    let oldCalls = 0
    const oldQueue = createTutorialSaveQueue(async () => {
      oldCalls++
      started.resolve()
      await finish.promise
    }, oldSignal)
    const first = oldQueue.enqueue(3, a)
    const firstResult = outcome === "failure" ? assert.rejects(first) : first
    await started.promise
    const second = oldQueue.enqueue(3, b)
    const secondRejected = assert.rejects(second, { name: "AbortError" })
    assert.deepEqual(oldQueue.recoveries(), [{ tutorialId: 3, progress: b, failed: false }])
    invalidateAuthRequests()
    assert.deepEqual(oldQueue.recoveries(), [])
    const newQueue = createTutorialSaveQueue(async () => {}, authRequestSignal())
    const newUser = createTutorialProgressController({ load: async () => ({}), queue: () => newQueue })
    newUser.setIdentity("B")
    await until(newUser, (state) => state.phase === "ready")
    if (outcome === "failure") finish.reject(new Error("A returned late"))
    else finish.resolve()
    await firstResult
    await secondRejected
    await oldQueue.idle()
    assert.equal(oldCalls, 1)
    assert.deepEqual(oldQueue.recoveries(), [])
    assert.deepEqual(newUser.getSnapshot().progressById, {})
    assert.deepEqual(newUser.getSnapshot().saveErrors, [])
    newUser.updateProgress(tutorial, () => b)
    await until(newUser, (state) => state.pending === 0)
    assert.deepEqual(newQueue.recoveries(), [])
  })
}
