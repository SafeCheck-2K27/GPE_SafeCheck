import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
import type { AuditQuestion } from "../types"

export function AuditTopBar({
  sidebarOpen,
  currentQuestionIndex,
  questionCount,
  question,
  progress,
  onToggleSidebar,
}: {
  sidebarOpen: boolean
  currentQuestionIndex: number
  questionCount: number
  question: AuditQuestion
  progress: number
  onToggleSidebar: () => void
}) {
  return (
    <div className="flex items-center gap-4 px-4 md:px-6 py-3 border-b border-[color:var(--sc-border)] bg-[color:var(--sc-surface)]/70 backdrop-blur-md supports-[backdrop-filter]:bg-[color:var(--sc-surface)]/60">
      <button
        onClick={onToggleSidebar}
        className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] text-[color:var(--sc-text-2)] hover:border-[color:var(--sc-blue)]/45 hover:text-[color:var(--sc-blue)] hover:bg-[color:var(--sc-bg-soft)] shadow-[var(--sc-shadow-sm)] transition-all"
        aria-label={sidebarOpen ? "Masquer la barre latérale" : "Afficher la barre latérale"}
      >
        {sidebarOpen ? (
          <PanelLeftClose className="w-4 h-4" />
        ) : (
          <PanelLeftOpen className="w-4 h-4" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[12px] font-bold text-[color:var(--sc-text)] tabular-nums shrink-0">
              Question {currentQuestionIndex + 1}
              <span className="text-[color:var(--sc-text-muted)] font-medium">
                {" "}/ {questionCount}
              </span>
            </span>
            <span aria-hidden className="text-[color:var(--sc-border-strong)]">·</span>
            <span className="text-[12px] font-medium text-[color:var(--sc-blue)] truncate">
              {question.category}
            </span>
          </div>
          <span className="text-[11.5px] font-semibold tabular-nums text-[color:var(--sc-text-muted)] shrink-0">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden bg-[color:var(--sc-surface-2)] border border-[color:var(--sc-border)]">
          <div
            className="h-full rounded-full transition-all duration-500 bg-[linear-gradient(90deg,var(--sc-blue-soft),var(--sc-blue),var(--sc-indigo))] shadow-[0_0_10px_rgb(var(--sc-blue-rgb)/0.40)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
