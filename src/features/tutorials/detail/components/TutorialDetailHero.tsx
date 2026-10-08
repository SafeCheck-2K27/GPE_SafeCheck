import { ScBadge, ScButton } from "@/components/safecheck/primitives"
import { CATEGORY_LABEL } from "../../data/catalog"
import type { Tutoriel } from "../../data/catalog"
import {
  CheckCircle2,
  Clock,
  Flame,
  Target,
  Zap,
} from "lucide-react"
import type { TutorialDetailState } from "../types"
import { TutorialDetailLevelBadge } from "./TutorialDetailLevelBadge"
import {
  TutorialLexiconTags,
  TutorialTextWithLexicon,
} from "./TutorialDetailLexicon"

export function TutorialDetailHero({
  tutorial,
  tutorialState,
  progressPercent,
  completedStepCount,
  onOpenReader,
  onComplete,
}: {
  tutorial: Tutoriel
  tutorialState: TutorialDetailState
  progressPercent: number
  completedStepCount: number
  onOpenReader: () => void
  onComplete: () => void
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] shadow-[var(--sc-shadow-md)] mb-6">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(at 0% 0%, rgb(var(--sc-blue-rgb)/0.10), transparent 50%), radial-gradient(at 100% 100%, rgb(var(--sc-indigo-rgb)/0.08), transparent 50%)",
        }}
        aria-hidden
      />
      <div className="relative p-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <TutorialDetailLevelBadge level={tutorial.level} />
          <ScBadge tone="muted">
            <Clock className="w-3 h-3" />
            {tutorial.duration}
          </ScBadge>
          <ScBadge tone="info">{CATEGORY_LABEL[tutorial.category]}</ScBadge>
          {tutorial.platform && (
            <span className="inline-flex items-center gap-1 text-[11px] text-[color:var(--sc-text-muted)] bg-[color:var(--sc-bg-soft)] border border-[color:var(--sc-border)] rounded-full px-2.5 py-0.5 font-medium">
              {tutorial.platform}
            </span>
          )}
          {tutorialState === "IN_PROGRESS" && (
            <ScBadge tone="warn">
              <Flame className="w-3 h-3" />
              En cours ({Math.round(progressPercent)}%)
            </ScBadge>
          )}
          {tutorialState === "COMPLETED" && (
            <ScBadge tone="success">
              <CheckCircle2 className="w-3 h-3" />
              Termine
            </ScBadge>
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-[color:var(--sc-text)] font-display mb-3 text-balance">
          {tutorial.title}
        </h1>

        <p className="text-sm md:text-base text-[color:var(--sc-text-2)] leading-relaxed mb-4 text-pretty">
          <TutorialTextWithLexicon text={tutorial.description} />
        </p>

        {tutorial.objective && (
          <div className="flex items-start gap-3 rounded-xl bg-[color:var(--sc-blue)]/5 border border-[color:var(--sc-blue)]/20 p-4 mb-5">
            <Target className="w-4 h-4 text-[color:var(--sc-blue)] mt-0.5 shrink-0" />
            <div>
              <p className="text-[11px] font-bold text-[color:var(--sc-blue)] uppercase tracking-wider mb-1">
                Objectif concret
              </p>
              <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">
                <TutorialTextWithLexicon text={tutorial.objective} />
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <ScButton variant="primary" onClick={onOpenReader} className="gap-2">
            <Zap className="w-4 h-4" />
            {tutorialState === "COMPLETED" ? "Revoir le tutoriel guide" : tutorialState === "IN_PROGRESS" ? "Reprendre le tutoriel guide" : "Commencer le tutoriel guide"}
          </ScButton>
          <ScButton variant="ghost" size="sm" onClick={onComplete} disabled={tutorialState === "COMPLETED"}>
            <CheckCircle2
              className={`w-3.5 h-3.5 ${tutorialState === "COMPLETED" ? "text-[color:var(--sc-success)]" : ""}`}
            />
            {tutorialState === "COMPLETED" ? "Termine" : "Marquer comme termine"}
          </ScButton>
        </div>

        <TutorialLexiconTags
          text={`${tutorial.title} ${tutorial.description} ${tutorial.objective ?? ""}`}
        />

        {tutorialState !== "NOT_STARTED" && (
          <div className="mt-4 pt-4 border-t border-[color:var(--sc-border)]">
            <div className="flex justify-between text-xs text-[color:var(--sc-text-2)] mb-1.5">
              <span>
                {completedStepCount} etape{completedStepCount > 1 ? "s" : ""} sur{" "}
                {tutorial.steps.length} completee{completedStepCount > 1 ? "s" : ""}
              </span>
              <span className="font-bold text-[color:var(--sc-blue)]">
                {Math.round(progressPercent)}%
              </span>
            </div>
            <div className="relative h-1.5 bg-[color:var(--sc-surface-2)] rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-[linear-gradient(90deg,var(--sc-blue-soft),var(--sc-blue))] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
