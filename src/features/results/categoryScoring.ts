import type { AuditAnswers, AuditQuestion } from "@/features/audit/types"
import type { ScoreRecommendation } from "./types"

/*
   Analyse des résultats par catégorie (SC-020).

   Le score global dit à l'utilisateur « où j'en suis » ; ce module dit
   « sur quoi agir » en reconstruisant, à partir de ses réponses réelles,
   un score par thème, puis ses points forts et ses points faibles.

   Fonctions pures, sans React ni navigateur : testables et réutilisables
   côté serveur si les résultats sont un jour persistés.

   Règle de notation : on ne note que ce qui a été réellement répondu. Un
   thème laissé vide est signalé « non évalué », jamais compté comme un
   échec — pénaliser une absence de réponse fausserait le diagnostic.
 */

/** Score à partir duquel un thème est un point fort. */
const STRENGTH_THRESHOLD = 70

/** Score en dessous duquel un thème devient prioritaire. */
const WEAKNESS_THRESHOLD = 50

export interface CategoryScore {
  category: string
  /** Score sur 100, calculé sur les seules questions répondues. */
  score: number
  answered: number
  total: number
  notEvaluated: boolean
}

/**
 * Score sur 100 pour chaque catégorie du questionnaire, dans leur ordre
 * d'apparition. Le maximum est pris sur les options réellement proposées,
 * jamais sur une constante : une question dont la meilleure option
 * vaudrait moins de 10 fausserait sinon le pourcentage.
 */
export function computeCategoryScores(
  questions: AuditQuestion[],
  answers: AuditAnswers,
): CategoryScore[] {
  const byCategory = new Map<
    string,
    { earned: number; max: number; answered: number; total: number }
  >()

  for (const question of questions) {
    const entry = byCategory.get(question.category) ?? {
      earned: 0,
      max: 0,
      answered: 0,
      total: 0,
    }
    entry.total += 1

    const option = question.options.find(
      (candidate) => candidate.value === answers[question.id],
    )
    if (option) {
      entry.answered += 1
      entry.earned += option.score
      entry.max += Math.max(...question.options.map((candidate) => candidate.score))
    }

    byCategory.set(question.category, entry)
  }

  return [...byCategory.entries()].map(([category, entry]) => ({
    category,
    score: entry.max > 0 ? Math.round((entry.earned / entry.max) * 100) : 0,
    answered: entry.answered,
    total: entry.total,
    notEvaluated: entry.answered === 0,
  }))
}

/** Points forts : thèmes évalués au-dessus du seuil, du meilleur au moins bon. */
export function getStrengthCategories(scores: CategoryScore[], limit = 3): CategoryScore[] {
  return scores
    .filter((entry) => !entry.notEvaluated && entry.score >= STRENGTH_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

/** Points faibles : thèmes évalués sous le seuil, du plus fragile au moins fragile. */
export function getWeaknessCategories(scores: CategoryScore[], limit = 3): CategoryScore[] {
  return scores
    .filter((entry) => !entry.notEvaluated && entry.score < WEAKNESS_THRESHOLD)
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
}

/*
   Passerelle entre les 10 catégories de l'audit et les 5 catégories des
   recommandations. « Connaissances générales » n'a pas d'action associée :
   elle n'est volontairement pas mappée.
 */
const AUDIT_CATEGORY_TO_RECOMMENDATION_CATEGORY: Record<
  string,
  ScoreRecommendation["category"]
> = {
  "Mots de passe": "comptes",
  "Double authentification": "comptes",
  Appareils: "appareils",
  "Mises à jour": "appareils",
  Sauvegardes: "sauvegardes",
  "Wi-Fi": "reseau",
  "Navigation sur internet": "reseau",
  Phishing: "phishing",
  "Données personnelles": "phishing",
}

export function mapAuditCategoryToRecommendationCategory(
  auditCategory: string,
): ScoreRecommendation["category"] | undefined {
  return AUDIT_CATEGORY_TO_RECOMMENDATION_CATEGORY[auditCategory]
}

/**
 * Réordonne les recommandations pour faire remonter celles qui répondent
 * aux thèmes les plus fragiles de l'utilisateur, sans en retirer aucune :
 * l'ensemble reste celui choisi par le niveau, seul l'ordre reflète le
 * diagnostic réel. Tri stable pour les recommandations non prioritaires.
 */
export function prioritizeRecommendationsByWeakness<T extends { category: ScoreRecommendation["category"] }>(
  recommendations: T[],
  weaknesses: CategoryScore[],
): T[] {
  const weakRecommendationCategories = new Map<ScoreRecommendation["category"], number>()
  weaknesses.forEach((weakness, index) => {
    const recommendationCategory = mapAuditCategoryToRecommendationCategory(weakness.category)
    if (recommendationCategory && !weakRecommendationCategories.has(recommendationCategory)) {
      weakRecommendationCategories.set(recommendationCategory, index)
    }
  })

  if (weakRecommendationCategories.size === 0) return [...recommendations]

  const priorityOf = (recommendation: T): number =>
    weakRecommendationCategories.get(recommendation.category) ?? Number.POSITIVE_INFINITY

  return recommendations
    .map((recommendation, index) => ({ recommendation, index }))
    .sort((a, b) => {
      const priorityDelta = priorityOf(a.recommendation) - priorityOf(b.recommendation)
      // À priorité égale, on conserve l'ordre d'origine (tri stable).
      return priorityDelta !== 0 ? priorityDelta : a.index - b.index
    })
    .map((entry) => entry.recommendation)
}
