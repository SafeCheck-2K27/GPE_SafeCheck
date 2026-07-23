import { ArrowRight, RotateCcw, Save } from "lucide-react"
import { ScButton } from "@/components/safecheck/primitives"
import type { ResultTranslator } from "../types"

const nextStepCardClassName =
  "rounded-2xl p-5 border bg-[color:var(--sc-surface)] border-[color:var(--sc-border)] shadow-[var(--sc-shadow)]"

export function ResultsNextSteps({
  isLoggedIn,
  firstTutorialHref,
  t,
  onOpenSignup,
  onDashboard,
  onTutorialClick,
  onExploreTutorials,
  onRestartAudit,
}: {
  isLoggedIn: boolean
  firstTutorialHref: string
  t: ResultTranslator
  onOpenSignup: () => void
  onDashboard: () => void
  onTutorialClick: (href: string) => void
  onExploreTutorials: () => void
  onRestartAudit: () => void
}) {
  return (
    <>
      <div className={nextStepCardClassName}>
        <h2 className="font-bold text-base text-[color:var(--sc-text)] mb-1 font-display">
          Prochaine étape
        </h2>
        <p className="text-sm text-[color:var(--sc-text-2)] mb-4">
          {isLoggedIn
            ? "Continue sur ta lancée et commence le premier tutoriel recommandé."
            : "Crée un compte pour retrouver tes résultats à tout moment, ou commence à explorer sans compte."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          {isLoggedIn ? (
            <>
              <ScButton
                variant="primary"
                size="lg"
                className="flex-1"
                onClick={onDashboard}
              >
                <Save className="w-4 h-4 mr-1.5" />
                Sauvegarder dans mon tableau de bord
              </ScButton>
              <ScButton
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={() => onTutorialClick(firstTutorialHref)}
              >
                Continuer avec le premier tutoriel
                <ArrowRight className="w-4 h-4 ml-1" />
              </ScButton>
            </>
          ) : (
            <>
              <ScButton
                variant="primary"
                size="lg"
                className="flex-1"
                onClick={onOpenSignup}
              >
                Créer mon compte pour sauvegarder mes résultats
                <ArrowRight className="w-4 h-4 ml-1" />
              </ScButton>
              <ScButton
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={onExploreTutorials}
              >
                Explorer les tutoriels sans compte
              </ScButton>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <ScButton variant="secondary" size="sm" onClick={onRestartAudit}>
          <RotateCcw className="w-4 h-4 mr-1.5" />
          {t("res.restart")}
        </ScButton>
      </div>
    </>
  )
}
