import { TrendingUp, Users, Zap } from "lucide-react"
import type { ResultMetrics } from "../types"

const comparisonCardClassName =
  "rounded-2xl p-5 border bg-[color:var(--sc-surface)] border-[color:var(--sc-border)] shadow-[var(--sc-shadow-sm)]"

export function ResultsComparison({
  score,
  scoreColor,
  metrics,
}: {
  score: number
  scoreColor: string
  metrics: ResultMetrics
}) {
  return (
    <div className={comparisonCardClassName}>
      <div className="flex items-center gap-2 mb-4">
        <span
          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-white"
          style={{
            background: "linear-gradient(135deg, var(--sc-blue-soft), var(--sc-indigo))",
          }}
        >
          <Users className="w-3.5 h-3.5" />
        </span>
        <h2 className="font-bold text-sm text-[color:var(--sc-text)]">
          Où tu te situes
        </h2>
        <span className="ml-auto text-[10px] text-[color:var(--sc-text-muted)] bg-[color:var(--sc-surface-2)] border border-[color:var(--sc-border)] px-2 py-0.5 rounded-full">
          Données mockées · anonymisées
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <span className="text-[color:var(--sc-blue)] shrink-0 mt-0.5">
            <TrendingUp className="w-4 h-4" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">
              {score > metrics.averageScore ? (
                <>
                  Ton score est{" "}
                  <strong className="text-[color:var(--sc-success)]">
                    au-dessus de la moyenne
                  </strong>{" "}
                  des utilisateurs SafeCheck ({metrics.averageScore}/100).
                </>
              ) : score === metrics.averageScore ? (
                <>
                  Ton score correspond{" "}
                  <strong className="text-[color:var(--sc-text)]">
                    exactement à la moyenne
                  </strong>{" "}
                  des utilisateurs SafeCheck ({metrics.averageScore}/100).
                </>
              ) : (
                <>
                  Ton score est{" "}
                  <strong className="text-[color:var(--sc-warn)]">
                    légèrement en-dessous de la moyenne
                  </strong>{" "}
                  des utilisateurs SafeCheck ({metrics.averageScore}/100).
                </>
              )}
            </p>
            <div className="mt-2 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-xs text-[color:var(--sc-text-muted)]">
                <span className="w-16 text-right shrink-0">Ton score</span>
                <div className="flex-1 h-2 rounded-full bg-[color:var(--sc-surface-2)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${score}%`, background: scoreColor }}
                  />
                </div>
                <span className="w-8 font-bold text-[color:var(--sc-text)] shrink-0">
                  {score}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[color:var(--sc-text-muted)]">
                <span className="w-16 text-right shrink-0">Moyenne</span>
                <div className="flex-1 h-2 rounded-full bg-[color:var(--sc-surface-2)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[color:var(--sc-text-muted)]"
                    style={{ width: `${metrics.averageScore}%` }}
                  />
                </div>
                <span className="w-8 font-bold text-[color:var(--sc-text-muted)] shrink-0">
                  {metrics.averageScore}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[color:var(--sc-border)]" />

        <div className="flex items-start gap-3">
          <span className="text-[color:var(--sc-warn)] shrink-0 mt-0.5">
            <Users className="w-4 h-4" />
          </span>
          <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">
            <strong className="text-[color:var(--sc-text)]">
              {metrics.similarProfilePercentage} %
            </strong>{" "}
            des utilisateurs ayant un profil similaire commencent aussi par
            renforcer leurs mots de passe.
          </p>
        </div>

        <div className="border-t border-[color:var(--sc-border)]" />

        <div className="flex items-start gap-3">
          <span className="text-[color:var(--sc-success)] shrink-0 mt-0.5">
            <Zap className="w-4 h-4" />
          </span>
          <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">
            Les profils proches du tien gagnent souvent{" "}
            <strong className="text-[color:var(--sc-success)]">
              +{metrics.gainAfterTutorials} points
            </strong>{" "}
            après les 3 premiers tutoriels.
          </p>
        </div>
      </div>
    </div>
  )
}
