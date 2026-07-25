import assert from "node:assert/strict"
import { test } from "node:test"
import {
  countByStatus,
  parseEssentialStatusMap,
} from "../../src/features/essentials/status"

test("parse ne conserve que les paires (id numérique -> statut connu)", () => {
  const raw = JSON.stringify({
    1: "fait",
    2: "a_revoir",
    3: "statut_inconnu",
    "-1": "fait",
    abc: "fait",
    4: 42,
  })
  assert.deepEqual(parseEssentialStatusMap(raw), { 1: "fait", 2: "a_revoir" })
})

test("parse résiste à une entrée corrompue ou absente", () => {
  for (const raw of [null, "", "pas-du-json", "[]", "42", JSON.stringify({ __proto__: "fait" })]) {
    const parsed = parseEssentialStatusMap(raw)
    assert.equal(typeof parsed, "object")
    // Aucune clé héritée ni valeur parasite ne doit passer.
    assert.deepEqual(Object.keys(parsed), [])
  }
})

test("countByStatus compte les statuts d'une valeur donnée", () => {
  const statuses = { 1: "fait", 2: "fait", 3: "a_revoir" } as const
  assert.equal(countByStatus(statuses, "fait"), 2)
  assert.equal(countByStatus(statuses, "a_revoir"), 1)
  assert.equal(countByStatus(statuses, "a_faire"), 0)
})
