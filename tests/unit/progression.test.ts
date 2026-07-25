import assert from "node:assert/strict"
import { test } from "node:test"
import { computeProgression } from "../../src/features/progression/progression"

test("agrège audit, essentiels et tutoriels en actions réalisées", () => {
  const progression = computeProgression({
    auditCompleted: true,
    essentialsStatus: { 1: "fait", 2: "fait", 3: "a_revoir" },
    essentialsTotal: 5,
    tutorialsStatus: { 1: "done", 2: "inprogress" },
    tutorialsTotal: 4,
  })

  assert.equal(progression.essentialsDone, 2)
  assert.equal(progression.essentialsToReview, 1)
  assert.equal(progression.tutorialsDone, 1)
  assert.equal(progression.tutorialsInProgress, 1)
  assert.equal(progression.actionsDone, 1 + 2 + 1) // audit + essentiels faits + tutos faits
  assert.equal(progression.actionsTotal, 1 + 5 + 4)
})

test("le ratio reste entre 0 et 1 même avec des statuts obsolètes", () => {
  // Plus de statuts « fait » que d'éléments réellement au catalogue.
  const progression = computeProgression({
    auditCompleted: true,
    essentialsStatus: { 1: "fait", 2: "fait", 3: "fait", 4: "fait", 5: "fait" },
    essentialsTotal: 3,
    tutorialsStatus: { 1: "done", 2: "done" },
    tutorialsTotal: 1,
  })

  assert.equal(progression.essentialsDone, 3) // plafonné au total
  assert.equal(progression.tutorialsDone, 1) // plafonné au total
  assert.ok(progression.completionRatio >= 0 && progression.completionRatio <= 1)
})

test("catalogue vide : pas de division par zéro", () => {
  const progression = computeProgression({
    auditCompleted: false,
    essentialsStatus: {},
    essentialsTotal: 0,
    tutorialsStatus: {},
    tutorialsTotal: 0,
  })

  // Seule l'action « audit » reste comptée dans le total.
  assert.equal(progression.actionsTotal, 1)
  assert.equal(progression.actionsDone, 0)
  assert.equal(progression.completionRatio, 0)
})

test("audit terminé sans aucune autre action", () => {
  const progression = computeProgression({
    auditCompleted: true,
    essentialsStatus: {},
    essentialsTotal: 6,
    tutorialsStatus: {},
    tutorialsTotal: 8,
  })

  assert.equal(progression.actionsDone, 1)
  assert.equal(progression.actionsTotal, 1 + 6 + 8)
  assert.ok(progression.completionRatio > 0 && progression.completionRatio < 1)
})
