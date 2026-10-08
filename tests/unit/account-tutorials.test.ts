import assert from "node:assert/strict"
import { test } from "node:test"
import { calculateTutorialCounters, mapAccountTutorials } from "../../src/features/account/tutorial-summary"
import { tutoriels } from "../../src/features/tutorials/data/catalog"
import { getTutorialProgressPercent, getTutorialStatus } from "../../src/features/tutorials/progress"

const tutorial = tutoriels.find((item) => item.id === 3)!
const other = tutoriels.find((item) => item.id === 1)!
const partial = { tutorialId: tutorial.id, tutorialVersion: tutorial.version, currentStep: 2, completedSteps: [0, 1], createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-02T00:00:00Z" }
const complete = { ...partial, completedSteps: tutorial.steps.map((_, index) => index) }

test("account maps partial progress to canonical metadata, IN_PROGRESS and Reprendre", () => {
  const [item] = mapAccountTutorials([partial])
  assert.equal(item.tutorialId, tutorial.id)
  assert.equal(item.slug, tutorial.slug)
  assert.equal(item.title, tutorial.title)
  assert.equal(item.level, tutorial.level)
  assert.equal(item.category, tutorial.category)
  assert.equal(item.duration, tutorial.duration)
  assert.equal(item.totalSteps, tutorial.steps.length)
  assert.equal(item.currentStep, 2)
  assert.deepEqual(item.completedSteps, [0, 1])
  assert.equal(item.updatedAt, partial.updatedAt)
  assert.equal(item.status, "IN_PROGRESS")
  assert.deepEqual(item.action, { label: "Reprendre", href: `/tutoriels/${tutorial.id}` })
})

test("account maps completed progress to COMPLETED, 100 percent and Revoir", () => {
  const [item] = mapAccountTutorials([complete])
  assert.equal(item.status, "COMPLETED")
  assert.equal(item.percentage, 100)
  assert.deepEqual(item.action, { label: "Revoir", href: `/tutoriels/${tutorial.id}` })
})

test("account percentage and status come from the existing domain, not resume position", () => {
  const snapshot = { ...partial, currentStep: tutorial.steps.length - 1, completedSteps: [0] }
  const [item] = mapAccountTutorials([snapshot])
  assert.equal(item.percentage, getTutorialProgressPercent(snapshot, tutorial.steps.length))
  assert.equal(item.status, getTutorialStatus(snapshot, tutorial.steps.length))
  assert.notEqual(item.percentage, snapshot.currentStep / tutorial.steps.length * 100)
})

test("account sorts by updatedAt DESC using instants rather than ISO string order", () => {
  const earlier = { ...partial, updatedAt: "2026-01-02T10:00:00+02:00" }
  const later = { ...partial, tutorialId: other.id, updatedAt: "2026-01-02T09:00:00Z" }
  assert.deepEqual(mapAccountTutorials([earlier, later]).map((item) => item.tutorialId), [other.id, tutorial.id])
})

test("account ignores unknown tutorial IDs without inventing metadata or counters", () => {
  const items = mapAccountTutorials([{ ...partial, tutorialId: 999999 }, partial])
  assert.deepEqual(items.map((item) => item.tutorialId), [tutorial.id])
  assert.deepEqual(calculateTutorialCounters(items), { total: 1, inProgress: 1, completed: 0 })
})

test("account refuses incompatible versions before normalizing historical steps", () => {
  assert.throws(() => mapAccountTutorials([{ ...partial, tutorialVersion: tutorial.version + 1, currentStep: 999, completedSteps: [999] }]), /Incompatible tutorial progress version/)
  assert.deepEqual(mapAccountTutorials([{ ...partial, tutorialId: 999999, tutorialVersion: 42 }]), [])
})

test("empty progress produces an empty account collection and zero counters", () => {
  assert.deepEqual(mapAccountTutorials([]), [])
  assert.deepEqual(calculateTutorialCounters([]), { total: 0, inProgress: 0, completed: 0 })
})

test("account counters include only begun tutorials and distinguish both statuses", () => {
  const items = mapAccountTutorials([complete, { ...partial, tutorialId: other.id, currentStep: 0, completedSteps: [] }])
  assert.deepEqual(calculateTutorialCounters(items), { total: 2, inProgress: 1, completed: 1 })
  assert.equal(items.find((item) => item.tutorialId === other.id)?.percentage, 0)
  assert.equal(items.find((item) => item.tutorialId === other.id)?.action.label, "Reprendre")
})

test("account mapping does not mutate or retain input progress arrays", () => {
  const snapshot = { ...partial, completedSteps: [...partial.completedSteps] }
  const before = structuredClone(snapshot)
  const source = [snapshot]
  const [item] = mapAccountTutorials(source)
  assert.deepEqual(source, [before])
  assert.notEqual(item.completedSteps, snapshot.completedSteps)
})
