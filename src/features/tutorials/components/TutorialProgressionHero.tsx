import { ScButton, ScCard } from "@/components/safecheck/primitives"
import type { Tutoriel } from "../data/catalog"
import { cn } from "@/lib/utils"
import { Award, Sparkles, Star, Target, TrendingUp, Users, Zap } from "lucide-react"
import { levels, userProgress } from "../data"

export function TutorialProgressionHero({
  recommendedTuto,
  openTuto,
}: {
  recommendedTuto: Tutoriel
  openTuto: (t: Tutoriel) => void
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] shadow-[var(--sc-shadow-md)] mb-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(at 0% 0%, rgba(37,99,235,0.12), transparent 50%), radial-gradient(at 100% 50%, rgba(6,182,212,0.10), transparent 50%), radial-gradient(at 50% 100%, rgba(99,102,241,0.08), transparent 50%)",
        }}
        aria-hidden
      />
      <div className="relative p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-6 lg:gap-8 items-start">
          {/* LEFT */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="relative mb-4">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center text-white text-3xl md:text-4xl font-bold font-display bg-[linear-gradient(135deg,#3B82F6,#2563EB_60%,#6366F1)] shadow-[0_12px_28px_-10px_rgba(37,99,235,0.55)]">
                P
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#F59E0B] border-3 border-[color:var(--sc-surface)] flex items-center justify-center">
                <Star className="w-4 h-4 text-white fill-white" />
              </div>
            </div>
            <div className="mb-2">
              <p className="text-xs font-semibold text-[color:var(--sc-blue)] uppercase tracking-wider mb-1">
                Niveau actuel
              </p>
              <h2 className="text-xl md:text-2xl font-bold text-[color:var(--sc-text)] font-display">
                {userProgress.level}
              </h2>
            </div>
            <div className="flex gap-2">
              {userProgress.badges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[color:var(--sc-bg-soft)] border border-[color:var(--sc-border)] text-[color:var(--sc-text)]"
                >
                  <Award className="w-3 h-3 text-[color:var(--sc-blue)]" />
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* CENTER */}
          <div className="flex-1 space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[color:var(--sc-text)]">Ta progression</span>
                <span className="text-sm font-bold text-[color:var(--sc-blue)]">
                  {userProgress.progressPercent}%
                </span>
              </div>
              <div className="relative h-3 bg-[color:var(--sc-surface-2)] rounded-full overflow-hidden mb-3">
                <div
                  className="absolute inset-y-0 left-0 bg-[linear-gradient(90deg,#3B82F6,#2563EB,#6366F1)] rounded-full transition-all duration-700"
                  style={{ width: `${userProgress.progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between">
                {levels.map((level, i) => (
                  <div
                    key={level.name}
                    className={cn(
                      "flex flex-col items-center",
                      i <= userProgress.levelIndex ? "opacity-100" : "opacity-40",
                    )}
                  >
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white mb-1 transition-transform",
                        i === userProgress.levelIndex &&
                          "scale-125 ring-2 ring-offset-2 ring-[color:var(--sc-blue)]",
                      )}
                      style={{ backgroundColor: level.color }}
                    >
                      {level.icon}
                    </div>
                    <span
                      className={cn(
                        "text-[9px] font-medium",
                        i === userProgress.levelIndex
                          ? "text-[color:var(--sc-blue)] font-bold"
                          : "text-[color:var(--sc-text-muted)]",
                      )}
                    >
                      {level.name.split(" ")[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-[color:var(--sc-bg-soft)] border border-[color:var(--sc-border)] p-3 text-center">
                <div className="text-lg md:text-xl font-bold text-[color:var(--sc-text)] font-display">
                  {userProgress.completedTutos}
                </div>
                <div className="text-[10px] text-[color:var(--sc-text-muted)] uppercase tracking-wide">
                  Tutoriels
                </div>
              </div>
              <div className="rounded-xl bg-[color:var(--sc-bg-soft)] border border-[color:var(--sc-border)] p-3 text-center">
                <div className="text-lg md:text-xl font-bold text-[color:var(--sc-text)] font-display">
                  {userProgress.stepsToNextLevel}
                </div>
                <div className="text-[10px] text-[color:var(--sc-text-muted)] uppercase tracking-wide">
                  Etapes restantes
                </div>
              </div>
              <div className="rounded-xl bg-[color:var(--sc-bg-soft)] border border-[color:var(--sc-border)] p-3 text-center">
                <div className="text-lg md:text-xl font-bold text-[color:var(--sc-success)] font-display">
                  +{userProgress.percentileBetter}%
                </div>
                <div className="text-[10px] text-[color:var(--sc-text-muted)] uppercase tracking-wide">
                  Vs moyenne
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-[color:var(--sc-surface-2)] border border-[color:var(--sc-border)] p-4">
              <div className="shrink-0 w-8 h-8 rounded-lg bg-[color:var(--sc-blue)]/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-[color:var(--sc-blue)]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[color:var(--sc-blue)] mb-1">
                  Comparaison anonymisee
                </p>
                <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">
                  Tu fais deja mieux que{" "}
                  <span className="font-bold text-[color:var(--sc-success)]">
                    {userProgress.percentileBetter}%
                  </span>{" "}
                  des utilisateurs de ta tranche d&apos;age. {userProgress.avgUserMessage}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-4 lg:w-64">
            <ScCard className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-[color:var(--sc-blue)]" />
                <span className="text-xs font-semibold text-[color:var(--sc-blue)] uppercase tracking-wider">
                  Prochain objectif
                </span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: levels[userProgress.levelIndex + 1]?.color || "#06B6D4" }}
                >
                  {levels[userProgress.levelIndex + 1]?.icon || "L"}
                </div>
                <div>
                  <p className="font-bold text-[color:var(--sc-text)]">{userProgress.nextLevel}</p>
                  <p className="text-xs text-[color:var(--sc-text-muted)]">Niveau suivant</p>
                </div>
              </div>
              <p className="text-xs text-[color:var(--sc-text-2)] leading-relaxed mb-3">
                Il te reste{" "}
                <span className="font-bold text-[color:var(--sc-blue)]">
                  {userProgress.stepsToNextLevel} etapes
                </span>{" "}
                pour debloquer ce niveau.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-[color:var(--sc-success)] font-medium">
                <TrendingUp className="w-3 h-3" />
                Tu progresses plus vite que la moyenne !
              </div>
            </ScCard>

            <div className="rounded-xl border-2 border-[color:var(--sc-blue)]/30 bg-[linear-gradient(135deg,rgba(37,99,235,0.06)_0%,rgba(99,102,241,0.06)_100%)] p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[color:var(--sc-blue)]" />
                <span className="text-xs font-bold text-[color:var(--sc-blue)]">Recommande pour toi</span>
              </div>
              <p className="text-sm font-semibold text-[color:var(--sc-text)] mb-3 leading-snug">
                {recommendedTuto.title}
              </p>
              <ScButton
                variant="primary"
                size="sm"
                onClick={() => openTuto(recommendedTuto)}
                className="w-full"
              >
                <Zap className="w-3.5 h-3.5" />
                Commencer maintenant
              </ScButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
