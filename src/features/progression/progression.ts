import type { EssentialStatus, EssentialStatusMap } from "@/features/essentials/status"
import type { TutoStatus } from "@/features/tutorials/types"

/*
   Progression globale (SC-038).

   Agrège les trois sources persistées (audit, essentiels, tutoriels) en
   une vue cohérente. Fonction pure : testable, réutilisable côté serveur
   le jour où la progression sera synchronisée en base.

   Exprimée en « actions réalisées », jamais en pourcentage de « sécurité
   atteinte » : un utilisateur qui a tout fait n'est pas protégé à 100 %,
   et le produit ne doit pas le laisser croire.
 */

export interface ProgressionInput {
  /** L'audit rapide a-t-il été mené à son terme. */
  auditCompleted: boolean
  essentialsStatus: EssentialStatusMap
  essentialsTotal: number
  tutorialsStatus: Record<number, TutoStatus>
  tutorialsTotal: number
}

export interface Progression {
  auditCompleted: boolean
  essentialsDone: number
  essentialsToReview: number
  essentialsTotal: number
  tutorialsDone: number
  tutorialsInProgress: number
  tutorialsTotal: number
  /** Actions réalisées, toutes sources confondues. */
  actionsDone: number
  /** Total des actions suivies, toutes sources confondues. */
  actionsTotal: number
  /** Part des actions réalisées, entre 0 et 1. Ce n'est pas un score de sécurité. */
  completionRatio: number
}

function countStatus<T>(statuses: Record<number, T>, target: T): number {
  return Object.values(statuses).filter((value) => value === target).length
}

export function computeProgression(input: ProgressionInput): Progression {
  const {
    auditCompleted,
    essentialsStatus,
    essentialsTotal,
    tutorialsStatus,
    tutorialsTotal,
  } = input

  /*
     Les statuts viennent du localStorage et peuvent survivre à la
     disparition d'un essentiel ou d'un tutoriel du catalogue. On plafonne
     donc chaque compteur à son total : sans cela, on compterait plus
     d'actions faites qu'il n'en existe et le ratio dépasserait 1.
   */
  const essentialsDone = Math.min(
    countStatus<EssentialStatus>(essentialsStatus, "fait"),
    essentialsTotal,
  )
  const essentialsToReview = Math.min(
    countStatus<EssentialStatus>(essentialsStatus, "a_revoir"),
    essentialsTotal,
  )
  const tutorialsDone = Math.min(countStatus<TutoStatus>(tutorialsStatus, "done"), tutorialsTotal)
  const tutorialsInProgress = Math.min(
    countStatus<TutoStatus>(tutorialsStatus, "inprogress"),
    tutorialsTotal,
  )

  const actionsDone = (auditCompleted ? 1 : 0) + essentialsDone + tutorialsDone
  // L'audit compte pour une action ; les essentiels et tutoriels pour leur total.
  const actionsTotal = 1 + essentialsTotal + tutorialsTotal

  return {
    auditCompleted,
    essentialsDone,
    essentialsToReview,
    essentialsTotal,
    tutorialsDone,
    tutorialsInProgress,
    tutorialsTotal,
    actionsDone,
    actionsTotal,
    completionRatio: actionsTotal > 0 ? actionsDone / actionsTotal : 0,
  }
}
