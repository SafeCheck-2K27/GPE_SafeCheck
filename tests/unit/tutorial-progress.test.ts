import assert from "node:assert/strict"
import { test } from "node:test"
import { tutoriels } from "../../src/features/tutorials/data/catalog"
import {
  addCompletedStep,
  completeTutorial,
  createTutorialProgress,
  getTutorialProgressPercent,
  getTutorialStatus,
  isStepCompleted,
  nextTutorialStep,
  normalizeTutorialProgress,
  previousTutorialStep,
  removeCompletedStep,
  toggleCompletedStep,
  type TutorialProgress,
} from "../../src/features/tutorials/progress"

test("absent progress is NOT_STARTED with zero percent and stays absent during normalization", () => {
  assert.equal(getTutorialStatus(null, 5), "NOT_STARTED")
  assert.equal(getTutorialProgressPercent(null, 5), 0)
  assert.equal(normalizeTutorialProgress(null, 5), null)
})

test("opening at the first step creates IN_PROGRESS even without validations", () => {
  const progress = createTutorialProgress(5)
  assert.deepEqual(progress, { currentStep: 0, completedSteps: [] })
  assert.equal(getTutorialStatus(progress, 5), "IN_PROGRESS")
})

test("partial validations derive IN_PROGRESS", () => {
  assert.equal(getTutorialStatus({ currentStep: 0, completedSteps: [0, 2] }, 5), "IN_PROGRESS")
})

test("all unique valid steps derive COMPLETED regardless of their input order", () => {
  assert.equal(getTutorialStatus({ currentStep: 0, completedSteps: [4, 2, 0, 3, 1] }, 5), "COMPLETED")
})

for (const [completedSteps, percent] of [
  [[], 0], [[0], 20], [[0, 2], 40], [[0, 1, 2, 3, 4], 100],
] as const) {
  test(`${completedSteps.length} validated steps out of five yield ${percent} percent`, () => {
    assert.equal(getTutorialProgressPercent({ currentStep: 0, completedSteps }, 5), percent)
  })
}

test("currentStep is only a resume position, never a validation count", () => {
  for (const currentStep of [0, 4]) {
    assert.equal(getTutorialProgressPercent({ currentStep, completedSteps: [] }, 5), 0)
    assert.equal(getTutorialStatus({ currentStep, completedSteps: [] }, 5), "IN_PROGRESS")
    assert.equal(getTutorialProgressPercent({ currentStep, completedSteps: [0, 2] }, 5), 40)
  }
})

test("normalization deduplicates and sorts valid steps without inflating completion", () => {
  const progress = { currentStep: 2, completedSteps: [2, 0, 1, 1, 2] }
  assert.deepEqual(normalizeTutorialProgress(progress, 5), { currentStep: 2, completedSteps: [0, 1, 2] })
  assert.equal(getTutorialProgressPercent(progress, 5), 60)
  assert.equal(getTutorialStatus(progress, 5), "IN_PROGRESS")
  assert.equal(getTutorialProgressPercent({ currentStep: 0, completedSteps: [0, 0, 0, 0, 0] }, 5), 20)
})

for (const step of [-1, 5, 6, 1.5, NaN, Infinity]) {
  test(`invalid validation index ${step} never counts as completed`, () => {
    const progress = { currentStep: 0, completedSteps: [0, step] }
    assert.deepEqual(normalizeTutorialProgress(progress, 5)?.completedSteps, [0])
    assert.equal(isStepCompleted(progress, step, 5), false)
    assert.equal(getTutorialProgressPercent(progress, 5), 20)
    assert.equal(getTutorialStatus(progress, 5), "IN_PROGRESS")
    for (const action of [addCompletedStep, removeCompletedStep, toggleCompletedStep]) {
      assert.throws(() => action(progress, step, 5), RangeError)
    }
  })
}

test("invalid step counts are rejected rather than producing vacuous completion", () => {
  const progress = { currentStep: 0, completedSteps: [] }
  for (const totalSteps of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    for (const operation of [
      () => createTutorialProgress(totalSteps),
      () => normalizeTutorialProgress(null, totalSteps),
      () => normalizeTutorialProgress(progress, totalSteps),
      () => getTutorialStatus(null, totalSteps),
      () => getTutorialProgressPercent(progress, totalSteps),
      () => isStepCompleted(progress, 0, totalSteps),
      () => addCompletedStep(progress, 0, totalSteps),
      () => removeCompletedStep(progress, 0, totalSteps),
      () => toggleCompletedStep(progress, 0, totalSteps),
      () => completeTutorial(progress, totalSteps),
      () => nextTutorialStep(progress, totalSteps),
      () => previousTutorialStep(progress, totalSteps),
    ]) assert.throws(operation, RangeError)
  }
})

test("normalization clamps resume positions and resets nonfinite positions to zero", () => {
  for (const [currentStep, expected] of [[-1, 0], [5, 4], [6, 4], [1.5, 1], [NaN, 0], [Infinity, 0]]) {
    assert.equal(normalizeTutorialProgress({ currentStep, completedSteps: [2] }, 5)?.currentStep, expected)
  }
})

test("toggling an unvalidated step adds it and toggling again removes it", () => {
  const added = toggleCompletedStep(createTutorialProgress(5), 2, 5)
  assert.deepEqual(added, { currentStep: 0, completedSteps: [2] })
  assert.equal(isStepCompleted(added, 2, 5), true)
  const removed = toggleCompletedStep(added, 2, 5)
  assert.deepEqual(removed, { currentStep: 0, completedSteps: [] })
  assert.equal(isStepCompleted(removed, 2, 5), false)
})

test("adding and removing validations are idempotent and keep the resume position", () => {
  const initial = { currentStep: 4, completedSteps: [0] }
  const added = addCompletedStep(initial, 2, 5)
  assert.deepEqual(addCompletedStep(added, 2, 5), added)
  const removed = removeCompletedStep(added, 0, 5)
  assert.deepEqual(removed, { currentStep: 4, completedSteps: [2] })
  assert.deepEqual(removeCompletedStep(removed, 0, 5), removed)
})

test("Terminer validates all steps and agrees with manual validation", () => {
  const complete = completeTutorial({ currentStep: 2, completedSteps: [0] }, 5)
  assert.deepEqual(complete, { currentStep: 2, completedSteps: [0, 1, 2, 3, 4] })
  assert.equal(getTutorialProgressPercent(complete, 5), 100)
  assert.equal(getTutorialStatus(complete, 5), "COMPLETED")
  let manual = { currentStep: 2, completedSteps: [] } as TutorialProgress
  for (const step of [4, 1, 3, 0, 2]) manual = addCompletedStep(manual, step, 5)
  assert.deepEqual(complete, manual)
  assert.deepEqual(completeTutorial(complete, 5), complete)
})

test("unchecking a completed tutorial returns IN_PROGRESS at 80 percent", () => {
  const complete = completeTutorial(null, 5)
  for (const action of [removeCompletedStep, toggleCompletedStep]) {
    const progress = action(complete, 3, 5)
    assert.deepEqual(progress.completedSteps, [0, 1, 2, 4])
    assert.equal(getTutorialStatus(progress, 5), "IN_PROGRESS")
    assert.equal(getTutorialProgressPercent(progress, 5), 80)
  }
})

test("previous and next stay within bounds and move normally in the middle", () => {
  assert.equal(previousTutorialStep(createTutorialProgress(5), 5).currentStep, 0)
  assert.equal(nextTutorialStep({ currentStep: 2, completedSteps: [] }, 5).currentStep, 3)
  assert.equal(previousTutorialStep({ currentStep: 2, completedSteps: [] }, 5).currentStep, 1)
  assert.equal(nextTutorialStep({ currentStep: 4, completedSteps: [] }, 5).currentStep, 4)
})

test("navigation never validates or unvalidates steps", () => {
  const progress = { currentStep: 2, completedSteps: [0, 2] }
  for (const action of [nextTutorialStep, previousTutorialStep]) {
    const moved = action(progress, 5)
    assert.deepEqual(moved.completedSteps, [0, 2])
    assert.equal(getTutorialStatus(moved, 5), "IN_PROGRESS")
    assert.equal(getTutorialProgressPercent(moved, 5), 40)
  }
})

test("reopening and navigating a completed tutorial keeps it COMPLETED", () => {
  const completed = completeTutorial(null, 5)
  for (const reopened of [normalizeTutorialProgress(completed, 5), nextTutorialStep(completed, 5), previousTutorialStep(completed, 5)]) {
    assert.equal(getTutorialStatus(reopened, 5), "COMPLETED")
    assert.equal(getTutorialProgressPercent(reopened, 5), 100)
  }
})

for (const totalSteps of [4, 5, 6]) {
  test(`completion and navigation work with ${totalSteps} steps`, () => {
    const completed = completeTutorial(null, totalSteps)
    assert.deepEqual(completed.completedSteps, Array.from({ length: totalSteps }, (_, index) => index))
    assert.equal(getTutorialStatus(completed, totalSteps), "COMPLETED")
    assert.equal(getTutorialProgressPercent(completed, totalSteps), 100)
    assert.equal(nextTutorialStep({ ...completed, currentStep: totalSteps - 1 }, totalSteps).currentStep, totalSteps - 1)
  })
}

test("progression works for every step count in the canonical catalog including a single step", () => {
  const counts = new Set([1, ...tutoriels.map(({ steps }) => steps.length)])
  for (const totalSteps of counts) {
    const completed = completeTutorial(null, totalSteps)
    assert.equal(getTutorialStatus(completed, totalSteps), "COMPLETED")
    assert.equal(getTutorialProgressPercent(completed, totalSteps), 100)
    assert.equal(getTutorialStatus(removeCompletedStep(completed, 0, totalSteps), totalSteps), "IN_PROGRESS")
  }
  assert.equal(nextTutorialStep(createTutorialProgress(1), 1).currentStep, 0)
})

test("fractional percentages preserve the exact ratio and never round partial completion to 100", () => {
  assert.equal(getTutorialProgressPercent({ currentStep: 0, completedSteps: [0] }, 6), (1 / 6) * 100)
  const progress = { currentStep: 999, completedSteps: Array.from({ length: 999 }, (_, index) => index) }
  assert.equal(getTutorialProgressPercent(progress, 1000), 99.9)
  assert.equal(getTutorialStatus(progress, 1000), "IN_PROGRESS")
})

test("actions from absent progress start it without needing an identity or storage", () => {
  assert.deepEqual(addCompletedStep(null, 2, 5), { currentStep: 0, completedSteps: [2] })
  assert.deepEqual(previousTutorialStep(null, 5), createTutorialProgress(5))
  assert.deepEqual(nextTutorialStep(null, 5), { currentStep: 1, completedSteps: [] })
  assert.equal(isStepCompleted(null, 0, 5), false)
})

test("operations are immutable and normalization is idempotent and JSON-serializable", () => {
  const progress = Object.freeze({ currentStep: 2, completedSteps: Object.freeze([2, 0, 2, -1]) })
  const normalized = normalizeTutorialProgress(progress, 5)
  assert.deepEqual(normalizeTutorialProgress(normalized, 5), normalized)
  assert.deepEqual(JSON.parse(JSON.stringify(normalized)), normalized)
  for (const result of [
    normalized, addCompletedStep(progress, 1, 5), removeCompletedStep(progress, 0, 5),
    toggleCompletedStep(progress, 2, 5), completeTutorial(progress, 5),
    nextTutorialStep(progress, 5), previousTutorialStep(progress, 5),
  ]) {
    assert.notEqual(result, progress)
    assert.notEqual(result?.completedSteps, progress.completedSteps)
  }
  assert.deepEqual(progress, { currentStep: 2, completedSteps: [2, 0, 2, -1] })
})
