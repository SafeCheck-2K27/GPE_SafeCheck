import assert from "node:assert/strict"
import { test } from "node:test"
import { HABITUDES, TECH } from "../../src/features/recommendations/data"
import { filterHabits, filterTechnicalRecommendations } from "../../src/features/recommendations/filters"

test("habit selections combine level and topic, preserve editorial order and reset to all", () => {
  const source = structuredClone(HABITUDES)
  const before = structuredClone(source)
  Object.freeze(source)
  assert.deepEqual(filterHabits(source, { level: "Débutant", tag: "phishing" }).map(({ id }) => id), [
    "lien", "email", "expediteur", "support",
  ])
  assert.deepEqual(filterHabits(source, { level: "Avancé", tag: "phishing" }).map(({ id }) => id), ["phishing-cible"])
  assert.deepEqual(filterHabits(source, { level: "Intermédiaire", tag: "phishing" }), [])
  assert.deepEqual(filterHabits(source, { level: "all", tag: "all" }), before)
  assert.deepEqual(source, before)
})

test("technical selections intersect category, level and urgency without retaining a previous selection", () => {
  const source = structuredClone(TECH)
  const before = structuredClone(source)
  Object.freeze(source)
  assert.deepEqual(filterTechnicalRecommendations(source, {
    category: "logiciels", level: "Débutant", urgency: "Haute",
  }).map(({ id }) => id), [1, 2])
  assert.deepEqual(filterTechnicalRecommendations(source, {
    category: "logiciels", level: "Débutant", urgency: "Moyenne",
  }).map(({ id }) => id), [10])
  assert.deepEqual(filterTechnicalRecommendations(source, {
    category: "all", level: "Intermédiaire", urgency: "Haute",
  }).map(({ id }) => id), [6, 18])
  assert.deepEqual(filterTechnicalRecommendations(source, {
    category: "unknown", level: "all", urgency: "all",
  }), [])
  assert.deepEqual(filterTechnicalRecommendations(source, {
    category: "all", level: "all", urgency: "all",
  }), before)
  assert.deepEqual(source, before)
})
