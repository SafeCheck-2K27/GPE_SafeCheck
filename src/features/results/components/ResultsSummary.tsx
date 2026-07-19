import { BookOpen, Info } from "lucide-react"
import type { ResultLevelConfig } from "../types"

const summaryCardClassName =
  "rounded-2xl p-5 border bg-[color:var(--sc-bg-soft)] border-[color:var(--sc-border)] shadow-[var(--sc-shadow-sm)]"

const infoRowClassName =
  "mt-3 pt-3 border-t border-[color:var(--sc-border)] flex items-start gap-2 text-xs text-[color:var(--sc-text-muted)]"

export function ResultsSummary({
  score,
  level,
}: {
  score: number
  level: ResultLevelConfig
}) {
  return (
    <div className={summaryCardClassName}>
      <div className="flex items-center gap-2 mb-3">
        <span
          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-[color:var(--sc-text-on-strong)]"
          style={{
            background: "linear-gradient(135deg, var(--sc-blue-soft), var(--sc-blue))",
          }}
        >
          <BookOpen className="w-3.5 h-3.5" />
        </span>
        <h2 className="font-bold text-sm text-[color:var(--sc-text)]">
          Résumé de ton diagnostic rapide
        </h2>
      </div>
      <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">
        {!Number.isNaN(score) && "Ton score de "}
        <strong className="text-[color:var(--sc-text)]">{score}/100</strong>
        {!Number.isNaN(score) && level.summary}
      </p>
      <div className={infoRowClassName}>
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>
          {"Ce résultat est issu d'un "}
          <strong className="text-[color:var(--sc-text-2)]">
            audit de qualification rapide
          </strong>
          {
            " (10 questions). Il permet d'identifier tes priorités immédiates, mais ne remplace pas un audit complet. Pour un diagnostic plus précis, tu pourras lancer un audit standard ou complet."
          }
        </span>
      </div>
    </div>
  )
}
