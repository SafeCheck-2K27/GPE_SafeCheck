import assert from "node:assert/strict"
import { test } from "node:test"
import { loadAccountTutorials } from "../../src/features/account/tutorial-loading"
import { createTutorialSaveQueue } from "../../src/features/tutorials/save-queue"
import type { TutorialProgress } from "../../src/features/tutorials/progress"

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
const s1 = { currentStep: 0, completedSteps: [0] }
const s2 = { currentStep: 2, completedSteps: [0, 1] }
const timestamp = "2026-01-02T00:00:00Z"

test("Account exposes an unconfirmed save after navigation and retries S2 before GET", async () => {
  const started = deferred<void>()
  const finish = deferred<void>()
  let stored = s1
  let saves = 0
  const queue = createTutorialSaveQueue(async (_, progress) => {
    if (++saves === 1) { started.resolve(); await finish.promise }
    stored = { currentStep: progress.currentStep, completedSteps: [...progress.completedSteps] }
  }, new AbortController().signal)
  const saving = queue.enqueue(3, s2)
  const rejected = assert.rejects(saving)
  await started.promise
  let gets = 0
  const load = async () => {
    gets++
    return [{ tutorialId: 3, tutorialVersion: 1, ...stored, createdAt: timestamp, updatedAt: timestamp }]
  }
  const signal = new AbortController().signal
  const destination = loadAccountTutorials(queue, load, signal)
  finish.reject(new Error("PUT failed after navigation"))
  await rejected
  assert.deepEqual(await destination, { kind: "save-error" })
  assert.equal(gets, 0)
  const result = await loadAccountTutorials(queue, load, signal, true)
  assert.equal(result.kind, "ready")
  if (result.kind !== "ready") assert.fail("Account must reload the confirmed snapshot")
  assert.deepEqual(result.items[0].completedSteps, s2.completedSteps)
  assert.equal(result.items[0].currentStep, s2.currentStep)
  assert.equal(result.items[0].updatedAt, timestamp)
  assert.equal(saves, 2)
  assert.equal(gets, 1)
  assert.deepEqual(queue.recoveries(), [])
})

test("Account keeps a specific save error when retry fails, without announcing old S1", async () => {
  const calls: TutorialProgress[] = []
  const queue = createTutorialSaveQueue(async (_, progress) => {
    calls.push(progress)
    throw new Error("PUT unavailable")
  }, new AbortController().signal)
  await assert.rejects(queue.enqueue(3, s2))
  const result = await loadAccountTutorials(queue, async () => {
    assert.fail("GET must not hide the failed PUT")
  }, new AbortController().signal, true)
  assert.deepEqual(result, { kind: "save-error" })
  assert.deepEqual(calls, [s2, s2])
  assert.deepEqual(queue.recoveries(), [{ tutorialId: 3, progress: s2, failed: true }])
})

test("Account retry can save S2 even when the following GET fails", async () => {
  let calls = 0
  let stored = s1
  const queue = createTutorialSaveQueue(async (_, progress) => {
    if (++calls === 1) throw new Error("first PUT failed")
    stored = { currentStep: progress.currentStep, completedSteps: [...progress.completedSteps] }
  }, new AbortController().signal)
  await assert.rejects(queue.enqueue(3, s2))
  await assert.rejects(loadAccountTutorials(queue, async () => { throw new Error("GET failed") }, new AbortController().signal, true), /GET failed/)
  assert.deepEqual(stored, s2)
  assert.deepEqual(queue.recoveries(), [])
})

test("Account navigation cancellation does not retry or GET under its disposed page", async () => {
  const queue = createTutorialSaveQueue(async () => { throw new Error("PUT failed") }, new AbortController().signal)
  await assert.rejects(queue.enqueue(3, s2))
  const controller = new AbortController()
  controller.abort()
  assert.deepEqual(await loadAccountTutorials(queue, async () => { assert.fail("Unexpected GET") }, controller.signal, true), { kind: "cancelled" })
  assert.deepEqual(queue.recoveries(), [{ tutorialId: 3, progress: s2, failed: true }])
})
