import { AlertTriangle, Check } from "lucide-react"
import { ScCard } from "@/components/safecheck/primitives"
import type { ScoreCategorie } from "../categoryScoring"
import type { ResultLevelConfig, ResultTranslator } from "../types"

/*
   Points forts et points faibles (SC-020).

   Quand l'audit a réellement été passé, les deux listes sont construites
   à partir des scores par catégorie de l'utilisateur : ce sont ses vrais
   thèmes, pas un texte générique.

   Si la page est atteinte sans audit (lien direct, résultat partagé), on
   retombe sur les listes indicatives d'origine, calées sur le score.
 */

export function ResultsAssessment({
  score,
  level,
  t,
  pointsForts = [],
  pointsFaibles = [],
}: {
  score: number
  level: ResultLevelConfig
  t: ResultTranslator
  pointsForts?: ScoreCategorie[]
  pointsFaibles?: ScoreCategorie[]
}) {
  const aDesDonneesReelles = pointsForts.length > 0 || pointsFaibles.length > 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ScCard className="p-4">
        <h2 className="font-bold text-sm mb-3 flex items-center gap-2 text-[color:var(--sc-text)]">
          <Check className="w-4 h-4 text-[color:var(--sc-success)]" />
          {t("res.strong")}
        </h2>
        <ul className="space-y-1.5 text-sm text-[color:var(--sc-text-2)]">
          {aDesDonneesReelles ? (
            pointsForts.length > 0 ? (
              pointsForts.map((point) => (
                <li key={point.categorie} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[color:var(--sc-success)] mt-0.5 shrink-0" />
                  <span>
                    {point.categorie}
                    <span className="text-[color:var(--sc-text-muted)]"> — {point.score}%</span>
                  </span>
                </li>
              ))
            ) : (
              <li className="text-[color:var(--sc-text-muted)]">
                Aucun thème n&apos;atteint encore le niveau attendu. C&apos;est
                justement ce que les recommandations ci-dessous vont t&apos;aider à
                changer.
              </li>
            )
          ) : level.strengthProfile === "high" ? (
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
      </ScCard>

      <ScCard className="p-4">
        <h2 className="font-bold text-sm mb-3 flex items-center gap-2 text-[color:var(--sc-text)]">
          <AlertTriangle className="w-4 h-4 text-[color:var(--sc-warn)]" />
          {t("res.weak")}
        </h2>
        <ul className="space-y-1.5 text-sm text-[color:var(--sc-text-2)]">
          {aDesDonneesReelles ? (
            pointsFaibles.length > 0 ? (
              pointsFaibles.map((point) => (
                <li key={point.categorie} className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-[color:var(--sc-warn)] mt-0.5 shrink-0" />
                  <span>
                    {point.categorie}
                    <span className="text-[color:var(--sc-text-muted)]"> — {point.score}%</span>
                  </span>
                </li>
              ))
            ) : (
              <li className="text-[color:var(--sc-text-muted)]">
                Aucun thème n&apos;est en difficulté. Continue comme ça.
              </li>
            )
          ) : (
            <>
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
            </>
          )}
        </ul>
      </ScCard>
    </div>
  )
}
