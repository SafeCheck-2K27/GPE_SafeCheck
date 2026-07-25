import assert from "node:assert/strict"
import { test } from "node:test"
import { auditQuestions } from "../../src/features/audit/data"

/*
   Invariants de la banque de questions de l'audit rapide (SC-017).
   Ces tests protègent le contenu produit : ils échouent si une édition
   future casse l'unicité des identifiants, l'équilibre par catégorie ou
   la validité des options de réponse.
 */

test("chaque question a un identifiant unique", () => {
  const ids = auditQuestions.map((question) => question.id)
  assert.equal(new Set(ids).size, ids.length)
})

test("chaque catégorie compte exactement 5 questions", () => {
  const parCategorie = new Map<string, number>()
  for (const question of auditQuestions) {
    parCategorie.set(question.category, (parCategorie.get(question.category) ?? 0) + 1)
  }

  assert.ok(parCategorie.size >= 1)
  for (const [categorie, nombre] of parCategorie) {
    assert.equal(nombre, 5, `la catégorie « ${categorie} » devrait avoir 5 questions`)
  }
})

test("chaque question offre des options valides et non vides", () => {
  for (const question of auditQuestions) {
    assert.ok(question.text.trim().length > 0, `question ${question.id} sans intitulé`)
    assert.ok(question.options.length >= 2, `question ${question.id} : moins de 2 options`)

    const valeurs = question.options.map((option) => option.value)
    assert.equal(new Set(valeurs).size, valeurs.length, `question ${question.id} : valeurs dupliquées`)

    for (const option of question.options) {
      assert.ok(option.label.trim().length > 0, `question ${question.id} : libellé vide`)
      assert.ok(
        Number.isInteger(option.score) && option.score >= 0,
        `question ${question.id} : score invalide`,
      )
    }
  }
})

test("chaque question propose au moins une bonne réponse (score maximal > 0)", () => {
  for (const question of auditQuestions) {
    const meilleur = Math.max(...question.options.map((option) => option.score))
    assert.ok(meilleur > 0, `question ${question.id} : aucune option positive`)
  }
})
