import { ScButton } from "@/components/safecheck/primitives"
import type { Tutoriel } from "../../data/catalog"
import { Check, ListChecks, Sparkles, Zap } from "lucide-react"
import type { TutorialDetailState } from "../types"
import { TutorialTextWithLexicon } from "./TutorialDetailLexicon"

export function TutorialDetailOverview({
  tutorial,
  completedSteps,
  tutorialState,
  onOpenReader,
}: {
  tutorial: Tutoriel
  completedSteps: Set<number>
  tutorialState: TutorialDetailState
  onOpenReader: () => void
}) {
  return (
    <>
      {tutorial.learns && tutorial.learns.length > 0 && (
        <section className="rounded-2xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-[color:var(--sc-blue)]" />
            <h2 className="font-bold text-base text-[color:var(--sc-text)]">
              Ce que vous allez apprendre
            </h2>
          </div>
          <ul className="space-y-2.5">
            {tutorial.learns.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="shrink-0 w-5 h-5 rounded-full bg-[color:var(--sc-blue)]/10 border border-[color:var(--sc-blue)]/25 flex items-center justify-center mt-0.5">
                  <Check className="w-3 h-3 text-[color:var(--sc-blue)]" />
                </span>
                <span className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">
                  <TutorialTextWithLexicon text={item} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <ListChecks className="w-4 h-4 text-[color:var(--sc-blue)]" />
          <h2 className="font-bold text-base text-[color:var(--sc-text)]">
            Apercu des etapes
          </h2>
          <span className="ml-auto text-xs text-[color:var(--sc-text-muted)]">
            {tutorial.steps.length} etape{tutorial.steps.length > 1 ? "s" : ""}
          </span>
        </div>
        <ol className="space-y-2">
          {tutorial.steps.map((step, index) => (
            <li
              key={step.title}
              className={`flex items-start gap-3 rounded-xl p-3 border transition-all ${completedSteps.has(index) ? "bg-[color:var(--sc-success)]/6 border-[color:var(--sc-success)]/25" : "bg-[color:var(--sc-bg-soft)] border-[color:var(--sc-border)] hover:border-[color:var(--sc-blue)]/25"}`}
            >
              <span
                className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all ${completedSteps.has(index) ? "bg-[color:var(--sc-success)] border-[color:var(--sc-success)] text-[color:var(--sc-text-on-strong)]" : "border-[color:var(--sc-border-strong)] text-[color:var(--sc-text-muted)]"}`}
              >
                {completedSteps.has(index) ? (
                  <Check className="w-3 h-3" />
                ) : (
                  index + 1
                )}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-semibold leading-snug ${completedSteps.has(index) ? "text-[color:var(--sc-success)] line-through decoration-[color:var(--sc-success)]/40" : "text-[color:var(--sc-text)]"}`}
                >
                  {step.title}
                </p>
                <p className="text-xs text-[color:var(--sc-text-muted)] mt-0.5 leading-relaxed line-clamp-1">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-4 pt-4 border-t border-[color:var(--sc-border)]">
          <ScButton
            variant="primary"
            size="sm"
            onClick={onOpenReader}
            className="w-full"
          >
            <Zap className="w-3.5 h-3.5" />
            {tutorialState === "in_progress"
              ? "Reprendre le tutoriel guide"
              : "Lancer le tutoriel guide"}
          </ScButton>
        </div>
      </section>
    </>
  )
}
