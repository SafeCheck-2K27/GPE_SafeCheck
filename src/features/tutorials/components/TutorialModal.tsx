import { ScBadge, ScButton } from "@/components/safecheck/primitives"
import { CATEGORY_LABEL } from "@/lib/tutoriels-data"
import type { Tutoriel } from "@/lib/tutoriels-data"
import {
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  Sparkles,
  X,
} from "lucide-react"

export function TutorialModal({
  tuto,
  currentStep,
  completedSteps,
  onStepChange,
  onMarkStep,
  onClose,
  onOpenPrecision,
}: {
  tuto: Tutoriel
  currentStep: number
  completedSteps: Set<number>
  onStepChange: (i: number) => void
  onMarkStep: (i: number) => void
  onClose: () => void
  onOpenPrecision: (stepTitle?: string) => void
}) {
  const step = tuto.steps[currentStep]
  const isLast = currentStep === tuto.steps.length - 1
  const allDone = completedSteps.size === tuto.steps.length

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden bg-[color:var(--sc-surface)] border border-[color:var(--sc-border)] shadow-[var(--sc-shadow-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-5 border-b border-[color:var(--sc-border)] bg-[color:var(--sc-bg-soft)]">
          <div
            className="absolute inset-0 opacity-60"
            style={{ background: "radial-gradient(at 0% 0%, rgba(37,99,235,0.15), transparent 50%)" }}
          />
          <div className="relative flex items-start justify-between">
            <div>
              <ScBadge tone="info" className="mb-2">
                <BookOpen className="w-3 h-3" />
                Tutoriel
              </ScBadge>
              <h2 className="font-bold text-lg text-[color:var(--sc-text)] font-display">{tuto.title}</h2>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="flex items-center gap-1 text-xs text-[color:var(--sc-text-muted)]">
                  <Clock className="w-3 h-3" /> {tuto.duration}
                </span>
                <span className="text-xs text-[color:var(--sc-text-muted)]">{tuto.level}</span>
                <span className="text-xs text-[color:var(--sc-text-muted)]">
                  {CATEGORY_LABEL[tuto.category]}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[color:var(--sc-surface)] rounded-lg transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5 text-[color:var(--sc-text-muted)]" />
            </button>
          </div>
        </div>

        <div className="px-5 pt-4 pb-2 border-b border-[color:var(--sc-border)]">
          <div className="flex justify-between text-xs text-[color:var(--sc-text-2)] mb-2">
            <span className="font-medium">
              Etape {currentStep + 1} sur {tuto.steps.length}
            </span>
            <span className="font-bold text-[color:var(--sc-blue)]">
              {Math.round(((currentStep + 1) / tuto.steps.length) * 100)}%
            </span>
          </div>
          <div className="relative h-2 bg-[color:var(--sc-surface-2)] rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-[linear-gradient(90deg,#3B82F6,#2563EB)] rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / tuto.steps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="shrink-0 w-9 h-9 rounded-xl bg-[linear-gradient(135deg,#3B82F6,#2563EB)] text-white flex items-center justify-center font-bold text-sm shadow-[var(--sc-shadow-blue-sm)]">
              {currentStep + 1}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base text-[color:var(--sc-text)] mb-2">{step.title}</h3>
              <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">{step.description}</p>
            </div>
          </div>

          <button
            onClick={() => onMarkStep(currentStep)}
            className={`mt-2 inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${ completedSteps.has(currentStep) ? "bg-[color:var(--sc-success)]/10 border-[color:var(--sc-success)]/40 text-[color:var(--sc-success)]" : "bg-[color:var(--sc-surface)] border-[color:var(--sc-border)] text-[color:var(--sc-text-2)] hover:border-[color:var(--sc-blue)]/45" }`}
          >
            {completedSteps.has(currentStep) ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> Etape validee
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" /> Marquer comme fait
              </>
            )}
          </button>

          {tuto.tip && isLast && (
            <div className="mt-5 rounded-xl bg-[color:var(--sc-bg-soft)] border border-[color:var(--sc-border)] p-4">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[color:var(--sc-blue)] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-[color:var(--sc-blue)] uppercase tracking-wider mb-1">
                    Astuce SafeCheck
                  </p>
                  <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">{tuto.tip}</p>
                </div>
              </div>
            </div>
          )}

          {/* Discrete precision link */}
          <div className="mt-4 pt-3 border-t border-[color:var(--sc-border)]">
            <button
              type="button"
              onClick={() => onOpenPrecision(tuto.steps[currentStep].title)}
              className="inline-flex items-center gap-1.5 text-xs text-[color:var(--sc-text-muted)] hover:text-[color:var(--sc-blue)] transition-colors"
            >
              <Flag className="w-3 h-3" />
              Un probleme avec cette etape ? Signaler une precision
            </button>
          </div>

          {allDone && (
            <div className="mt-5 rounded-xl bg-[color:var(--sc-success)]/10 border border-[color:var(--sc-success)]/30 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[color:var(--sc-success)]" />
                <p className="text-sm font-semibold text-[color:var(--sc-success)]">
                  Tutoriel termine ! Bravo, c&apos;est une etape de moins vers ton prochain niveau.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-[color:var(--sc-border)] bg-[color:var(--sc-bg-soft)] flex items-center justify-between gap-3">
          <ScButton
            variant="secondary"
            size="sm"
            onClick={() => onStepChange(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Precedent
          </ScButton>

          <div className="flex gap-1">
            {tuto.steps.map((_, i) => (
              <button
                key={i}
                onClick={() => onStepChange(i)}
                className={`w-2 h-2 rounded-full transition-all ${ i === currentStep ? "bg-[color:var(--sc-blue)] w-6" : completedSteps.has(i) ? "bg-[color:var(--sc-success)]" : "bg-[color:var(--sc-border-strong)]" }`}
                aria-label={`Aller a l'etape ${i + 1}`}
              />
            ))}
          </div>

          {isLast ? (
            <ScButton variant="primary" size="sm" onClick={onClose}>
              Terminer
              <CheckCircle2 className="w-3.5 h-3.5" />
            </ScButton>
          ) : (
            <ScButton variant="primary" size="sm" onClick={() => onStepChange(currentStep + 1)}>
              Suivant
              <ChevronRight className="w-3.5 h-3.5" />
            </ScButton>
          )}
        </div>
      </div>
    </div>
  )
}
