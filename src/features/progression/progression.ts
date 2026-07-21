import type { AuditAnswers } from "@/features/audit/types"
import type { EssentielStatut } from "@/features/essentiels/types"
import type { TutoStatus } from "@/features/tutorials/types"

/*
   SafeCheck - Progression globale

   Agrege les trois sources persistees (audit, essentiels, tutoriels) en
   une vue coherente. Volontairement ecrite comme une fonction pure :
   testable unitairement et reutilisable cote serveur le jour ou la
   progression sera synchronisee en base.

   Exprime volontairement la progression en "actions realisees", jamais
   en pourcentage de "securite atteinte" : un utilisateur qui a tout fait
   n'est pas protege a 100%, et le produit ne doit pas le laisser croire.
 */

export interface ProgressionInput {
  auditAnswers: AuditAnswers
  auditQuestionCount: number
  essentielsStatuts: Record<number, EssentielStatut>
  essentielsCount: number
  tutorielsStatuts: Record<number, TutoStatus>
  tutorielsCount: number
}

export interface Progression {
  auditRepondu: number
  auditTotal: number
  auditTermine: boolean
  essentielsFaits: number
  essentielsARevoir: number
  essentielsTotal: number
  tutorielsTermines: number
  tutorielsEnCours: number
  tutorielsTotal: number
  /** Actions realisees, toutes sources confondues. */
  actionsFaites: number
  /** Total des actions suivies, toutes sources confondues. */
  actionsTotal: number
  /** Part des actions realisees, entre 0 et 1. Ce n'est pas un "score de securite". */
  partFaite: number
}

export function calculerProgression(input: ProgressionInput): Progression {
  const {
    auditAnswers,
    auditQuestionCount,
    essentielsStatuts,
    essentielsCount,
    tutorielsStatuts,
    tutorielsCount,
  } = input

  const auditRepondu = Object.keys(auditAnswers).length
  const auditTermine = auditQuestionCount > 0 && auditRepondu >= auditQuestionCount

  /*
     Les statuts viennent du localStorage et peuvent survivre a la
     disparition d'un essentiel ou d'un tutoriel du catalogue. Sans
     plafonnement, on compterait plus d'actions faites qu'il n'en existe
     et `partFaite` depasserait 1.
   */
  const essentielsValues = Object.values(essentielsStatuts)
  const essentielsFaits = Math.min(
    essentielsValues.filter((s) => s === "fait").length,
    essentielsCount,
  )
  const essentielsARevoir = Math.min(
    essentielsValues.filter((s) => s === "a_revoir").length,
    essentielsCount,
  )

  const tutorielsValues = Object.values(tutorielsStatuts)
  const tutorielsTermines = Math.min(
    tutorielsValues.filter((s) => s === "done").length,
    tutorielsCount,
  )
  const tutorielsEnCours = Math.min(
    tutorielsValues.filter((s) => s === "inprogress").length,
    tutorielsCount,
  )

  // L'audit ne compte comme une action que s'il comporte des questions.
  const auditEstUneAction = auditQuestionCount > 0 ? 1 : 0

  const actionsFaites = (auditTermine ? 1 : 0) + essentielsFaits + tutorielsTermines
  const actionsTotal = auditEstUneAction + essentielsCount + tutorielsCount

  return {
    auditRepondu,
    auditTotal: auditQuestionCount,
    auditTermine,
    essentielsFaits,
    essentielsARevoir,
    essentielsTotal: essentielsCount,
    tutorielsTermines,
    tutorielsEnCours,
    tutorielsTotal: tutorielsCount,
    actionsFaites,
    actionsTotal,
    partFaite: actionsTotal > 0 ? actionsFaites / actionsTotal : 0,
  }
}
