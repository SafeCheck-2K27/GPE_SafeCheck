import assert from "node:assert/strict"
import { test } from "node:test"
import { tutoriels } from "../../src/features/tutorials/data/catalog"
import { DEFAULT_TUTORIAL_FILTERS, matchesTutorialFilters } from "../../src/features/tutorials/filters"
import { completeTutorial, nextTutorialStep, toggleCompletedStep } from "../../src/features/tutorials/progress"
import { searchTutorials } from "../../src/features/tutorials/search"
import { getTutorialCardStatus, updateTutorialSession } from "../../src/features/tutorials/session"

const tutorial = tutoriels.find(({ id }) => id === 2)!
const other = tutoriels.find(({ id }) => id === 1)!

test("absent session progress produces the Commencer card status even for a formerly mocked done tutorial", () => {
  assert.equal(getTutorialCardStatus(other, {}), "todo")
})

test("started progress produces the Reprendre card status even with zero validations", () => {
  const session = updateTutorialSession({}, tutorial)
  assert.equal(getTutorialCardStatus(tutorial, session), "inprogress")
})

test("completed progress produces Revoir and unchecking a step produces Reprendre", () => {
  const completed = updateTutorialSession({}, tutorial, (previous) => completeTutorial(previous, tutorial.steps.length))
  assert.equal(getTutorialCardStatus(tutorial, completed), "done")
  const incomplete = updateTutorialSession(completed, tutorial, (previous) => toggleCompletedStep(previous, 3, tutorial.steps.length))
  assert.equal(getTutorialCardStatus(tutorial, incomplete), "inprogress")
})

test("reopening restores the same position and validations instead of resetting them", () => {
  let session = updateTutorialSession({}, tutorial)
  session = updateTutorialSession(session, tutorial, (previous) => toggleCompletedStep(previous, 0, tutorial.steps.length))
  session = updateTutorialSession(session, tutorial, (previous) => toggleCompletedStep(previous, 1, tutorial.steps.length))
  session = updateTutorialSession(session, tutorial, (previous) => nextTutorialStep(nextTutorialStep(previous, tutorial.steps.length), tutorial.steps.length))
  const reopened = updateTutorialSession(session, tutorial)
  assert.deepEqual(reopened[tutorial.id], { currentStep: 2, completedSteps: [0, 1] })
})

test("updates isolate tutorial identities and never mutate the previous session", () => {
  const first = updateTutorialSession({}, tutorial)
  Object.freeze(first[tutorial.id]?.completedSteps)
  Object.freeze(first[tutorial.id])
  Object.freeze(first)
  const second = updateTutorialSession(first, other, (previous) => completeTutorial(previous, other.steps.length))
  assert.equal(second[tutorial.id], first[tutorial.id])
  assert.equal(first[other.id], undefined)
  assert.equal(getTutorialCardStatus(tutorial, second), "inprogress")
  assert.equal(getTutorialCardStatus(other, second), "done")
})

test("catalog status filters and search agree with real session progress", () => {
  const doneFilter = { ...DEFAULT_TUTORIAL_FILTERS, statusFilter: "done" as const }
  const session = updateTutorialSession({}, tutorial, (previous) => completeTutorial(previous, tutorial.steps.length))
  assert.equal(matchesTutorialFilters(tutorial, doneFilter, session), true)
  assert.equal(matchesTutorialFilters(other, doneFilter, session), false)
  assert.equal(matchesTutorialFilters(tutorial, doneFilter, {}), false)
  assert.deepEqual(searchTutorials(tutoriels, "mot de passe", doneFilter, session).map(({ id }) => id), [tutorial.id])
})

test("a fresh page session has no inherited progress", () => {
  const oldSession = updateTutorialSession({}, tutorial, (previous) => completeTutorial(previous, tutorial.steps.length))
  assert.equal(getTutorialCardStatus(tutorial, oldSession), "done")
  assert.equal(getTutorialCardStatus(tutorial, {}), "todo")
})

test("the session adapter normalizes resume updates through the domain", () => {
  const session = updateTutorialSession({}, tutorial, () => ({ currentStep: 99, completedSteps: [1, 1, -1, NaN] }))
  assert.deepEqual(session[tutorial.id], { currentStep: tutorial.steps.length - 1, completedSteps: [1] })
})
