import assert from "node:assert/strict"
import { test } from "node:test"
import {
  computeCategoryScores,
  getStrengthCategories,
  getWeaknessCategories,
  mapAuditCategoryToRecommendationCategory,
  prioritizeRecommendationsByWeakness,
} from "../../src/features/results/categoryScoring"
import type { AuditQuestion } from "../../src/features/audit/types"

function question(id: number, category: string, best = 10): AuditQuestion {
  return {
    id,
    category,
    text: `q${id}`,
    options: [
      { label: "a", value: "a", score: best },
      { label: "b", value: "b", score: 5 },
      { label: "c", value: "c", score: 0 },
    ],
  }
}

test("un thème sans réponse est non évalué et jamais un point faible", () => {
  const questions = [question(1, "Mots de passe"), question(2, "Wi-Fi")]
  const scores = computeCategoryScores(questions, { 1: "a" })

  const wifi = scores.find((entry) => entry.category === "Wi-Fi")
  assert.equal(wifi?.notEvaluated, true)
  assert.equal(
    getWeaknessCategories(scores).some((entry) => entry.category === "Wi-Fi"),
    false,
  )
})

test("le score d'un thème est calculé sur les seules réponses données", () => {
  const questions = [question(1, "A"), question(2, "A"), question(3, "B")]
  const scores = computeCategoryScores(questions, { 1: "a", 2: "c", 3: "a" })

  const a = scores.find((entry) => entry.category === "A")
  assert.equal(a?.score, 50) // (10 + 0) sur 20
  assert.equal(a?.answered, 2)
  assert.ok(scores.every((entry) => entry.score >= 0 && entry.score <= 100))
})

test("points forts et faibles sont classés par pertinence", () => {
  const questions = [question(1, "Fort"), question(2, "Faible"), question(3, "Moyen")]
  const scores = computeCategoryScores(questions, { 1: "a", 2: "c", 3: "b" })

  assert.deepEqual(
    getStrengthCategories(scores).map((entry) => entry.category),
    ["Fort"],
  )
  assert.deepEqual(
    getWeaknessCategories(scores).map((entry) => entry.category),
    ["Faible"],
  )
  // Un thème à 50 % n'est ni fort ni faible.
  assert.equal(
    getStrengthCategories(scores).concat(getWeaknessCategories(scores)).some(
      (entry) => entry.category === "Moyen",
    ),
    false,
  )
})

test("aucune réponse : pas de division par zéro, ni fort ni faible", () => {
  const questions = [question(1, "A"), question(2, "B")]
  const scores = computeCategoryScores(questions, {})

  assert.ok(scores.every((entry) => entry.score === 0 && entry.notEvaluated))
  assert.equal(getStrengthCategories(scores).length, 0)
  assert.equal(getWeaknessCategories(scores).length, 0)
})

test("la meilleure option vaut 100 % même si son score est inférieur à 10", () => {
  const questions: AuditQuestion[] = [
    { id: 1, category: "X", text: "q", options: [
      { label: "a", value: "a", score: 6 },
      { label: "b", value: "b", score: 0 },
    ] },
  ]
  const scores = computeCategoryScores(questions, { 1: "a" })
  assert.equal(scores[0].score, 100)
})

test("une réponse orpheline (question retirée) est ignorée", () => {
  const questions = [question(1, "A")]
  const scores = computeCategoryScores(questions, { 1: "a", 999: "a" })
  assert.equal(scores.length, 1)
  assert.equal(scores[0].score, 100)
})

test("la passerelle catégorie audit -> recommandation couvre les thèmes actionnables", () => {
  assert.equal(mapAuditCategoryToRecommendationCategory("Mots de passe"), "comptes")
  assert.equal(mapAuditCategoryToRecommendationCategory("Wi-Fi"), "reseau")
  assert.equal(mapAuditCategoryToRecommendationCategory("Phishing"), "phishing")
  // « Connaissances générales » n'a pas d'action associée.
  assert.equal(mapAuditCategoryToRecommendationCategory("Connaissances générales"), undefined)
})

test("les recommandations liées aux thèmes faibles remontent en tête, sans perte", () => {
  const recommendations = [
    { id: 1, category: "comptes" as const },
    { id: 2, category: "sauvegardes" as const },
    { id: 3, category: "phishing" as const },
  ]
  // L'utilisateur est faible en sauvegardes puis en phishing.
  const weaknesses = [
    { category: "Sauvegardes", score: 10, answered: 1, total: 1, notEvaluated: false },
    { category: "Phishing", score: 20, answered: 1, total: 1, notEvaluated: false },
  ]

  const ordered = prioritizeRecommendationsByWeakness(recommendations, weaknesses)
  assert.deepEqual(ordered.map((entry) => entry.id), [2, 3, 1])
  assert.equal(ordered.length, recommendations.length)
})

test("sans thème faible mappé, l'ordre des recommandations est préservé", () => {
  const recommendations = [
    { id: 1, category: "comptes" as const },
    { id: 2, category: "sauvegardes" as const },
  ]
  const ordered = prioritizeRecommendationsByWeakness(recommendations, [])
  assert.deepEqual(ordered.map((entry) => entry.id), [1, 2])
})
