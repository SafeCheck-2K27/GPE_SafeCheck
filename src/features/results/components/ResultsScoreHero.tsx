import type {
  ResultLevelConfig,
  ResultRiskStyle,
  ResultTranslator,
} from "../types"

const scoreHeroClassName =
  "rounded-2xl p-6 border flex flex-col md:flex-row items-center gap-6 bg-[color:var(--sc-surface)] shadow-[var(--sc-shadow)]"

const scoreCircleClassName =
  "w-32 h-32 rounded-full flex flex-col items-center justify-center border-[5px] bg-[color:var(--sc-bg)]"

const riskBadgeBaseClassName =
  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"

export function ResultsScoreHero({
  score,
  level,
  riskStyle,
  riskLabel,
  t,
}: {
  score: number
  level: ResultLevelConfig
  riskStyle: ResultRiskStyle
  riskLabel: string
  t: ResultTranslator
}) {
  return (
    <div className={scoreHeroClassName}>
      <div className="shrink-0 flex flex-col items-center gap-2">
        <div
          className={scoreCircleClassName}
          style={{ borderColor: level.colorVar }}
        >
          <span
            className="text-4xl font-extrabold leading-none"
            style={{ color: level.colorVar }}
          >
            {score}
          </span>
          <span className="text-xs font-medium text-[color:var(--sc-text-muted)] mt-0.5">
            /100
          </span>
        </div>
        <span
          className={`${riskBadgeBaseClassName} ${riskStyle.text} ${riskStyle.bg} ${riskStyle.border}`}
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: riskStyle.dot }}
            aria-hidden
          />
          Risque estimé : {riskLabel}
        </span>
      </div>

      <div className="flex-1 text-center md:text-left">
        <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--sc-blue)] mb-1">
          Niveau selon ton score
        </p>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[color:var(--sc-text)] mb-2 font-display text-balance">
          {t(level.labelKey)}
        </h1>
        <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">
          {t(level.descKey)}
        </p>

      </div>
    </div>
  )
}
