import { Check, Sparkles, X } from "lucide-react"
import type { AuditAnswers, AuditQuestion } from "../types"

export function AuditProgressSidebar({
  questions,
  currentQuestionIndex,
  answers,
  progress,
  open,
  onClose,
  onQuestionSelect,
}: {
  questions: AuditQuestion[]
  currentQuestionIndex: number
  answers: AuditAnswers
  progress: number
  open: boolean
  onClose: () => void
  onQuestionSelect: (index: number) => void
}) {
  const answeredCount = Object.keys(answers).length

  return (
    <aside
      className={`fixed bottom-0 left-0 top-16 z-40 w-72 max-w-[calc(100vw-2rem)] shrink-0 transition-[transform,width] duration-300 ease-out lg:relative lg:bottom-auto lg:left-auto lg:top-auto lg:z-10 lg:max-w-none ${open ? "translate-x-0 lg:w-72" : "-translate-x-full lg:w-0 lg:translate-x-0 lg:overflow-hidden"}`}
    >
      <div className="h-full flex flex-col bg-[color:var(--sc-surface)] border-r border-[color:var(--sc-border)] shadow-[var(--sc-shadow-sm)]">
        <div className="relative px-5 pt-5 pb-4 border-b border-[color:var(--sc-border)]">
          <button
            type="button"
            aria-label="Fermer le panneau de progression"
            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-lg text-[color:var(--sc-text-muted)] transition-colors hover:bg-[color:var(--sc-bg-soft)] hover:text-[color:var(--sc-text)] lg:hidden"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-[linear-gradient(135deg,var(--sc-blue-soft),var(--sc-blue))] text-white shadow-[var(--sc-shadow-blue-sm)]">
              <Sparkles className="w-3.5 h-3.5" strokeWidth={2.4} />
            </span>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--sc-text-muted)]">
              Audit qualif&apos; rapide
            </p>
          </div>
          <h2 className="font-display text-base font-bold text-[color:var(--sc-text)] tracking-tight">
            Cheminement des questions
          </h2>
          <p className="text-[12px] text-[color:var(--sc-text-muted)] mt-1">
            {answeredCount}/{questions.length} répondues
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {questions.map((question, index) => {
            const isActive = index === currentQuestionIndex
            const isAnswered = !!answers[question.id]

            return (
              <button
                key={question.id}
                onClick={() => onQuestionSelect(index)}
                className={`group relative w-full flex items-start gap-3 text-left px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${isActive ? "bg-[color:var(--sc-bg-soft)] border border-[color:var(--sc-blue)]/30 shadow-[var(--sc-shadow-blue-sm)]" : "border border-transparent hover:bg-[color:var(--sc-bg-soft)]/60 hover:border-[color:var(--sc-border)]"}`}
                aria-current={isActive ? "step" : undefined}
              >
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-r-full bg-[linear-gradient(180deg,var(--sc-blue-soft),var(--sc-blue))]"
                  />
                )}

                <span
                  className={`shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-[12px] font-bold mt-0.5 transition-all ${isActive ? "bg-[linear-gradient(135deg,var(--sc-blue-soft),var(--sc-blue))] text-white shadow-[0_4px_10px_-2px_rgba(37,99,235,0.45)] ring-2 ring-[color:var(--sc-surface)]" : isAnswered ? "bg-[rgba(16,185,129,0.12)] text-[color:var(--sc-success)] border border-[rgba(16,185,129,0.30)] dark:bg-[rgba(16,185,129,0.16)] dark:text-[#6EE7B7] dark:border-[rgba(16,185,129,0.32)]" : "bg-[color:var(--sc-surface-2)] text-[color:var(--sc-text-muted)] border border-[color:var(--sc-border)]"}`}
                >
                  {isAnswered && !isActive ? (
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  ) : (
                    index + 1
                  )}
                </span>

                <span className="flex-1 min-w-0">
                  <span
                    className={`block text-[10.5px] font-semibold uppercase tracking-wider mb-0.5 ${isActive ? "text-[color:var(--sc-blue)]" : "text-[color:var(--sc-text-muted)]"}`}
                  >
                    {question.category}
                  </span>
                  <span
                    className={`block text-[12.5px] leading-snug line-clamp-2 ${isActive ? "text-[color:var(--sc-text)] font-medium" : isAnswered ? "text-[color:var(--sc-text-2)]" : "text-[color:var(--sc-text-muted)]"}`}
                  >
                    {question.text}
                  </span>
                </span>
              </button>
            )
          })}
        </nav>

        <div className="px-5 py-4 border-t border-[color:var(--sc-border)] bg-[color:var(--sc-surface-2)]/40">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--sc-text-muted)]">
              Avancement
            </span>
            <span className="text-[12px] font-bold text-[color:var(--sc-blue)]">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden bg-[color:var(--sc-surface-2)] border border-[color:var(--sc-border)]">
            <div
              className="h-full rounded-full transition-all duration-500 bg-[linear-gradient(90deg,var(--sc-blue-soft),var(--sc-blue),var(--sc-indigo))] shadow-[0_0_10px_rgba(37,99,235,0.40)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  )
}
