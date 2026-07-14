import { AlertTriangle, Check } from "lucide-react"
import type { ResultLevelConfig, ResultTranslator } from "../types"

export function ResultsAssessment({
  score,
  level,
  t,
}: {
  score: number
  level: ResultLevelConfig
  t: ResultTranslator
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-xl p-4 bg-[color:var(--sc-surface)] border border-[color:var(--sc-border)] shadow-[var(--sc-shadow-sm)]">
        <h2 className="font-bold text-sm mb-3 flex items-center gap-2 text-[color:var(--sc-text)]">
          <Check className="w-4 h-4 text-[color:var(--sc-success)]" />
          {t("res.strong")}
        </h2>
        <ul className="space-y-1.5 text-sm text-[color:var(--sc-text-2)]">
          {level.strengthProfile === "high" ? (
            <>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[color:var(--sc-success)] mt-0.5 shrink-0" />
                {t("res.strong.high.1")}
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[color:var(--sc-success)] mt-0.5 shrink-0" />
                {t("res.strong.high.2")}
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[color:var(--sc-success)] mt-0.5 shrink-0" />
                {t("res.strong.high.3")}
              </li>
            </>
          ) : (
            <>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[color:var(--sc-success)] mt-0.5 shrink-0" />
                {t("res.strong.low.1")}
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[color:var(--sc-success)] mt-0.5 shrink-0" />
                {t("res.strong.low.2")}
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[color:var(--sc-success)] mt-0.5 shrink-0" />
                {t("res.strong.low.3")}
              </li>
            </>
          )}
        </ul>
      </div>

      <div className="rounded-xl p-4 bg-[color:var(--sc-surface)] border border-[color:var(--sc-border)] shadow-[var(--sc-shadow-sm)]">
        <h2 className="font-bold text-sm mb-3 flex items-center gap-2 text-[color:var(--sc-text)]">
          <AlertTriangle className="w-4 h-4 text-[color:var(--sc-warn)]" />
          {t("res.weak")}
        </h2>
        <ul className="space-y-1.5 text-sm text-[color:var(--sc-text-2)]">
          {score < 80 && (
            <li className="flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-[color:var(--sc-warn)] mt-0.5 shrink-0" />
              {t("res.weak.passwords")}
            </li>
          )}
          {score < 70 && (
            <li className="flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-[color:var(--sc-warn)] mt-0.5 shrink-0" />
              {t("res.weak.2fa")}
            </li>
          )}
          {score < 60 && (
            <li className="flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-[color:var(--sc-warn)] mt-0.5 shrink-0" />
              {t("res.weak.updates")}
            </li>
          )}
          {score < 50 && (
            <li className="flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-[color:var(--sc-warn)] mt-0.5 shrink-0" />
              {t("res.weak.backup")}
            </li>
          )}
          {score < 40 && (
            <li className="flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-[color:var(--sc-warn)] mt-0.5 shrink-0" />
              {t("res.weak.wifi")}
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
