import type { AuditAnswers, AuditQuestion } from '@/features/audit/types'

/*
   SafeCheck - Analyse des résultats par catégorie (SC-020)

   Le score global seul ne dit pas à l'utilisateur *où* il est vulnérable.
   Ce module reconstruit, à partir de ses réponses réelles, un score par
   catégorie, puis en déduit ses points forts et ses points faibles.

   Fonctions pures, sans dépendance à React ni au localStorage : elles
   sont testables unitairement et réutilisables côté serveur le jour où
   les résultats seront persistés en base.

   Principe de notation : on ne note que ce que l'utilisateur a
   réellement répondu. Une catégorie laissée vide n'est pas comptée comme
   un échec, elle est signalée comme non évaluée — pénaliser une absence
   de réponse donnerait un diagnostic faux.
 */

/** Note à partir de laquelle une catégorie est considérée comme acquise. */
const SEUIL_POINT_FORT = 70

/** Note en dessous de laquelle une catégorie devient prioritaire. */
const SEUIL_POINT_FAIBLE = 50

export interface ScoreCategorie {
  categorie: string
  /** Score sur 100, calculé sur les seules questions répondues. */
  score: number
  /** Nombre de questions répondues dans la catégorie. */
  repondues: number
  /** Nombre total de questions de la catégorie. */
  total: number
  /** Vrai si aucune question de la catégorie n'a été répondue. */
  nonEvaluee: boolean
}

/**
 * Calcule un score sur 100 pour chaque catégorie du questionnaire.
 * Les catégories sont retournées dans leur ordre d'apparition.
 */
export function calculerScoresParCategorie(
  questions: AuditQuestion[],
  answers: AuditAnswers,
): ScoreCategorie[] {
  const parCategorie = new Map<
    string,
    { pointsObtenus: number; pointsMax: number; repondues: number; total: number }
  >()

  for (const question of questions) {
    const entree = parCategorie.get(question.category) ?? {
      pointsObtenus: 0,
      pointsMax: 0,
      repondues: 0,
      total: 0,
    }
    entree.total += 1

    const valeur = answers[question.id]
    const option = question.options.find((candidate) => candidate.value === valeur)

    if (option) {
      entree.repondues += 1
      entree.pointsObtenus += option.score
      /*
         Le maximum est calculé sur les options réellement proposées, et
         non sur une constante : une question dont la meilleure option
         vaudrait moins de 10 fausserait sinon le score.
       */
      entree.pointsMax += Math.max(...question.options.map((o) => o.score))
    }

    parCategorie.set(question.category, entree)
  }

  return [...parCategorie.entries()].map(([categorie, e]) => ({
    categorie,
    score: e.pointsMax > 0 ? Math.round((e.pointsObtenus / e.pointsMax) * 100) : 0,
    repondues: e.repondues,
    total: e.total,
    nonEvaluee: e.repondues === 0,
  }))
}

/**
 * Points forts : catégories évaluées dont le score atteint le seuil,
 * de la meilleure à la moins bonne.
 */
export function extrairePointsForts(
  scores: ScoreCategorie[],
  limite = 3,
): ScoreCategorie[] {
  return scores
    .filter((s) => !s.nonEvaluee && s.score >= SEUIL_POINT_FORT)
    .sort((a, b) => b.score - a.score)
    .slice(0, limite)
}

/**
 * Points faibles : catégories évaluées sous le seuil, de la plus
 * fragile à la moins fragile — c'est l'ordre de priorité d'action.
 */
export function extrairePointsFaibles(
  scores: ScoreCategorie[],
  limite = 3,
): ScoreCategorie[] {
  return scores
    .filter((s) => !s.nonEvaluee && s.score < SEUIL_POINT_FAIBLE)
    .sort((a, b) => a.score - b.score)
    .slice(0, limite)
}

/**
 * Score global sur 100, cohérent avec les scores par catégorie
 * puisqu'il s'appuie sur les mêmes questions répondues.
 */
export function calculerScoreGlobal(
  questions: AuditQuestion[],
  answers: AuditAnswers,
): number {
  let pointsObtenus = 0
  let pointsMax = 0

  for (const question of questions) {
    const option = question.options.find(
      (candidate) => candidate.value === answers[question.id],
    )
    if (!option) continue
    pointsObtenus += option.score
    pointsMax += Math.max(...question.options.map((o) => o.score))
  }

  return pointsMax > 0 ? Math.round((pointsObtenus / pointsMax) * 100) : 0
}

/** Nombre de questions répondues, tous thèmes confondus. */
export function compterReponses(answers: AuditAnswers): number {
  return Object.keys(answers).length
}
