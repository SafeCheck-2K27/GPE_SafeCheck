import { ScBadge, ScButton } from "@/components/safecheck/primitives"
import { CATEGORY_LABEL } from "../../data/catalog"
import type { Tutoriel } from "../../data/catalog"
import {
  Bookmark,
  CheckCircle2,
  Clock,
  Flame,
  RotateCcw,
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
  saved,
  markedDone,
  onOpenReader,
  onToggleSaved,
  onToggleMarkedDone,
}: {
  tutorial: Tutoriel
  tutorialState: TutorialDetailState
  progressPercent: number
  completedStepCount: number
  saved: boolean
  markedDone: boolean
  onOpenReader: () => void
  onToggleSaved: () => void
  onToggleMarkedDone: () => void
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] shadow-[var(--sc-shadow-md)] mb-6">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(at 0% 0%, rgba(37,99,235,0.10), transparent 50%), radial-gradient(at 100% 100%, rgba(99,102,241,0.08), transparent 50%)",
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
          {tutorialState === "in_progress" && (
            <ScBadge tone="warn">
              <Flame className="w-3 h-3" />
              En cours ({progressPercent}%)
            </ScBadge>
          )}
          {tutorialState === "done" && (
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
            Lancer le tutoriel guide
          </ScButton>
          <ScButton variant="secondary" size="sm" onClick={onToggleSaved}>
            <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-current" : ""}`} />
            {saved ? "Sauvegarde" : "Sauvegarder"}
          </ScButton>
          {tutorialState === "in_progress" && (
            <ScButton variant="ghost" size="sm" onClick={onOpenReader}>
              <RotateCcw className="w-3.5 h-3.5" />
              Reprendre
            </ScButton>
          )}
          <ScButton variant="ghost" size="sm" onClick={onToggleMarkedDone}>
            <CheckCircle2
              className={`w-3.5 h-3.5 ${markedDone ? "text-[color:var(--sc-success)]" : ""}`}
            />
            {markedDone ? "Marque comme termine" : "Marquer comme termine"}
          </ScButton>
        </div>

        <TutorialLexiconTags
          text={`${tutorial.title} ${tutorial.description} ${tutorial.objective ?? ""}`}
        />

        {tutorialState === "in_progress" && (
          <div className="mt-4 pt-4 border-t border-[color:var(--sc-border)]">
            <div className="flex justify-between text-xs text-[color:var(--sc-text-2)] mb-1.5">
              <span>
                {completedStepCount} etape{completedStepCount > 1 ? "s" : ""} sur{" "}
                {tutorial.steps.length} completee{completedStepCount > 1 ? "s" : ""}
              </span>
              <span className="font-bold text-[color:var(--sc-blue)]">
                {progressPercent}%
              </span>
            </div>
            <div className="relative h-1.5 bg-[color:var(--sc-surface-2)] rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-[linear-gradient(90deg,#3B82F6,#2563EB)] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
