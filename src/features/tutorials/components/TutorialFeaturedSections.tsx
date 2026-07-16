import Link from "next/link"
import {
  ArrowRight,
  Clock,
  Play,
  Sparkles,
  Target,
} from "lucide-react"
import { ScBadge, ScButton } from "@/components/safecheck/primitives"
import type { Tutoriel } from "../data/catalog"
import { TutorialIcon } from "./TutorialIcon"
import {
  RECOMMENDED_REASONS,
  mockTutoLastStep,
  mockTutoStatus,
} from "../data"
import { TutorialCard } from "./TutorialCards"

export function TutorialFeaturedSections({
  visible,
  recommendedTutorials,
  inProgressTutorials,
  onOpenTutorial,
}: {
  visible: boolean
  recommendedTutorials: Tutoriel[]
  inProgressTutorials: Tutoriel[]
  onOpenTutorial: (tutorial: Tutoriel) => void
}) {
  if (!visible) return null

  return (
    <>
      <section className="mb-8" aria-label="Recommande pour vous">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[linear-gradient(135deg,#3B82F6,#2563EB)] text-white shadow-[var(--sc-shadow-blue-sm)]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base md:text-lg text-[color:var(--sc-text)] font-display">
                Recommande pour vous
              </h2>
              <p className="text-xs text-[color:var(--sc-text-muted)]">
                Base sur votre profil et votre dernier audit
              </p>
            </div>
          </div>
          <ScBadge tone="info">
            <Target className="w-3 h-3" />
            Priorite
          </ScBadge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendedTutorials.map((tutorial) => (
            <TutorialCard
              key={tutorial.id}
              tuto={tutorial}
              onStart={() => onOpenTutorial(tutorial)}
              status={mockTutoStatus[tutorial.id] || "todo"}
              recommendationReason={RECOMMENDED_REASONS[tutorial.id]}
            />
          ))}
        </div>
      </section>

      {inProgressTutorials.length > 0 && (
        <section className="mb-8" aria-label="Reprendre la ou vous en etiez">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[color:var(--sc-blue)]/10 border border-[color:var(--sc-blue)]/20 text-[color:var(--sc-blue)]">
              <Play className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base md:text-lg text-[color:var(--sc-text)] font-display">
                Reprendre la ou vous en etiez
              </h2>
              <p className="text-xs text-[color:var(--sc-text-muted)]">
                {inProgressTutorials.length} tutoriel
                {inProgressTutorials.length > 1 ? "s" : ""} en cours
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {inProgressTutorials.map((tutorial) => {
              const progress = mockTutoLastStep[tutorial.id]
              const progressPercentage = progress
                ? Math.round((progress.step / tutorial.steps.length) * 100)
                : 0

              return (
                <div
                  key={tutorial.id}
                  className="flex items-center gap-4 rounded-xl border border-[color:var(--sc-blue)]/30 bg-[color:var(--sc-surface)] shadow-[var(--sc-shadow-sm)] p-4 hover:border-[color:var(--sc-blue)]/50 hover:shadow-[var(--sc-shadow-md)] transition-all"
                >
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-[color:var(--sc-bg-soft)] flex items-center justify-center text-[color:var(--sc-blue)]">
                    <div className="scale-150">
                      <TutorialIcon icon={tutorial.icon} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[color:var(--sc-blue)] text-white">
                        <Play className="w-2.5 h-2.5 fill-white" /> En cours
                      </span>
                      <span className="text-[10px] text-[color:var(--sc-text-muted)] flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {tutorial.duration}
                      </span>
                    </div>
                    <p className="font-semibold text-sm text-[color:var(--sc-text)] truncate font-display">
                      {tutorial.title}
                    </p>
                    {progress && (
                      <p className="text-xs text-[color:var(--sc-text-muted)] truncate mt-0.5">
                        Derniere etape :{" "}
                        <span className="text-[color:var(--sc-text-2)]">
                          {progress.label}
                        </span>
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 bg-[color:var(--sc-surface-2)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[linear-gradient(90deg,#3B82F6,#2563EB)] rounded-full transition-all"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-[color:var(--sc-blue)] shrink-0">
                        {progressPercentage}%
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col gap-2">
                    <ScButton
                      variant="primary"
                      size="sm"
                      onClick={() => onOpenTutorial(tutorial)}
                    >
                      <Play className="w-3.5 h-3.5" />
                      Reprendre
                    </ScButton>
                    <Link
                      href={`/tutoriels/${tutorial.id}`}
                      className="inline-flex items-center justify-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] text-[color:var(--sc-text-2)] hover:border-[color:var(--sc-blue)]/40 hover:text-[color:var(--sc-blue)] transition-all"
                    >
                      Voir
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </>
  )
}
