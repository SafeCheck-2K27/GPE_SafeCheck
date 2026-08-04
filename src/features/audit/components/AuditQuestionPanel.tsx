import { Check, ChevronLeft, ChevronRight, Shield } from "lucide-react"
import { ScButton } from "@/components/safecheck/primitives"
import type { AuditAnswerValue, AuditQuestion } from "../types"

export function AuditQuestionPanel({
  question,
  selectedOption,
  currentQuestionIndex,
  isLast,
  onSelect,
  onPrevious,
  onNext,
}: {
  question: AuditQuestion
  selectedOption: AuditAnswerValue | null
  currentQuestionIndex: number
  isLast: boolean
  onSelect: (value: AuditAnswerValue) => void
  onPrevious: () => void
  onNext: () => void
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-start px-4 md:px-6 pt-10 pb-10">
      <div className="w-full max-w-2xl flex flex-col gap-7 sc-fade-in">
        <div className="flex items-end gap-5 md:gap-6">
          <div className="shrink-0 flex flex-col items-center">
            <div className="relative">
              <div
                className="absolute inset-0 -m-3 rounded-full sc-halo opacity-50 sc-pulse-soft pointer-events-none"
                aria-hidden
              />
              <div className="relative w-20 h-20 rounded-full sc-avatar-gradient flex items-center justify-center ring-4 ring-[color:var(--sc-surface)] shadow-[0_14px_30px_-10px_rgba(37,99,235,0.55),inset_0_1px_0_rgba(255,255,255,0.30)]">
                <Shield className="w-9 h-9 text-white" strokeWidth={2.2} />
              </div>
            </div>
          </div>

          <div className="relative min-w-0 flex-1 rounded-2xl p-5 md:p-6 bg-[color:var(--sc-surface)] border border-[color:var(--sc-border)] shadow-[var(--sc-shadow)]">
            <span
              aria-hidden
              className="absolute left-0 bottom-5 w-0 h-0 -translate-x-2"
              style={{
                borderTop: "8px solid transparent",
                borderBottom: "8px solid transparent",
                borderRight: "12px solid var(--sc-surface)",
              }}
            />
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[color:var(--sc-blue)] mb-1.5">
              {question.category}
            </p>
            <p className="text-base md:text-[17px] font-medium text-[color:var(--sc-text)] leading-relaxed text-pretty">
              {question.text}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {question.options.map((option) => {
            const selected = selectedOption === option.value

            return (
              <button
                key={option.value}
                onClick={() => onSelect(option.value)}
                className={`group relative flex items-start gap-3.5 text-left px-4 py-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${selected ? "border-[color:var(--sc-blue)] bg-[color:var(--sc-bg-soft)] shadow-[0_8px_24px_-8px_rgba(37,99,235,0.40)] ring-1 ring-[color:var(--sc-blue)]/40" : "border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] hover:border-[color:var(--sc-blue)]/55 hover:-translate-y-0.5 hover:shadow-[var(--sc-shadow)] hover:bg-[color:var(--sc-bg-soft)]/40"}`}
                aria-pressed={selected}
              >
                <span
                  className={`shrink-0 mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${selected ? "border-[color:var(--sc-blue)] bg-[color:var(--sc-blue)] shadow-[0_4px_10px_-2px_rgba(37,99,235,0.45)]" : "border-[color:var(--sc-border-strong)] bg-[color:var(--sc-surface)] group-hover:border-[color:var(--sc-blue)]/60"}`}
                >
                  {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </span>

                <span
                  className={`shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-md text-[12px] font-bold uppercase transition-colors ${selected ? "bg-[color:var(--sc-blue)]/15 text-[color:var(--sc-blue)] border border-[color:var(--sc-blue)]/35" : "bg-[color:var(--sc-surface-2)] text-[color:var(--sc-text-2)] border border-[color:var(--sc-border)]"}`}
                >
                  {option.value}
                </span>

                <span
                  className={`text-[14.5px] leading-relaxed transition-colors ${selected ? "text-[color:var(--sc-text)]" : "text-[color:var(--sc-text-2)]"}`}
                >
                  {option.label}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <ScButton
            variant="secondary"
            size="md"
            className="w-full sm:w-auto"
            onClick={onPrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-0.5" />
            Précédent
          </ScButton>

          <ScButton
            variant="primary"
            size="md"
            className="w-full sm:w-auto"
            onClick={onNext}
            disabled={!selectedOption}
          >
            {isLast ? "Voir mes résultats" : "Question suivante"}
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </ScButton>
        </div>
      </div>
    </div>
  )
}
