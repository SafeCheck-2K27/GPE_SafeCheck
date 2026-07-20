import type { AuditAnswers } from "@/features/audit/types"
import type { EssentielStatut } from "@/features/essentiels/types"
import type { TutoStatus } from "@/features/tutorials/types"

/*
   SafeCheck - Global progression

   Aggregates the three persisted sources (audit, essentiels, tutoriels)
   into a single coherent view. Kept as a pure function so it can be
   unit-tested and reused server-side once progression is synced to the DB.

   Deliberately expresses progression as "actions completed", never as a
   percentage of "security achieved" - a user who did every action is not
   100% safe, and the product must not imply otherwise.
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
  /** Completed actions across all three sources. */
  actionsFaites: number
  /** Total trackable actions across all three sources. */
  actionsTotal: number
  /** Ratio of completed actions, 0 to 1. Not a "security score". */
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

  const essentielsValues = Object.values(essentielsStatuts)
  const essentielsFaits = essentielsValues.filter((s) => s === "fait").length
  const essentielsARevoir = essentielsValues.filter((s) => s === "a_revoir").length

  const tutorielsValues = Object.values(tutorielsStatuts)
  const tutorielsTermines = tutorielsValues.filter((s) => s === "done").length
  const tutorielsEnCours = tutorielsValues.filter((s) => s === "inprogress").length

  const actionsFaites = (auditTermine ? 1 : 0) + essentielsFaits + tutorielsTermines
  const actionsTotal = 1 + essentielsCount + tutorielsCount

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
