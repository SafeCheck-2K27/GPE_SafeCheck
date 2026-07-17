import { ArrowRight } from "lucide-react"
import { ScButton, ScCard } from "@/components/safecheck/primitives"
import { ScoreRecommendationIcon } from "./ScoreRecommendationIcon"
import type {
  ScoreRecommendation,
  ResultLanguage,
  ResultTranslator,
} from "./types"
import {
  scoreRecommendationCopy,
  scoreRecommendationImpactColors,
  scoreRecommendationImpactTranslationKeys,
  scoreRecommendationUrgencyColors,
  scoreRecommendationUrgencyTranslationKeys,
} from "./data"

export function ScoreRecommendationCard({
  recommendation,
  index,
  lang,
  t,
  onTutorialClick,
}: {
  recommendation: ScoreRecommendation
  index: number
  lang: ResultLanguage
  t: ResultTranslator
  onTutorialClick: (href: string) => void
}) {
  const copy = scoreRecommendationCopy[recommendation.key][lang]
  return (
    <ScCard className="flex items-start gap-4 p-4 transition-shadow hover:shadow-[var(--sc-shadow)]">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-white"
        style={{ background: "linear-gradient(135deg, var(--sc-blue-soft), var(--sc-blue))" }}
      >
        <ScoreRecommendationIcon
          icon={recommendation.icon}
          className="w-5 h-5"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="font-bold text-sm text-[color:var(--sc-text)]">
            Priorité {index + 1} : {copy.title}
          </span>
        </div>
        <div className="flex gap-2 mb-2.5 flex-wrap">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-semibold text-white"
            style={{
              background:
                scoreRecommendationUrgencyColors[recommendation.urgency],
            }}
          >
            Urgence :{" "}
            {t(
              scoreRecommendationUrgencyTranslationKeys[
                recommendation.urgency
              ],
            )}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-semibold text-white"
            style={{
              background:
                scoreRecommendationImpactColors[recommendation.impact],
            }}
          >
            Impact :{" "}
            {t(
              scoreRecommendationImpactTranslationKeys[
                recommendation.impact
              ],
            )}
          </span>
        </div>
        <p className="text-xs text-[color:var(--sc-text-2)] leading-relaxed mb-3">
          {copy.desc}
        </p>
        <ScButton
          variant="primary"
          size="sm"
          onClick={() => onTutorialClick(recommendation.tutorielLink)}
        >
          {t("res.viewTuto")}
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </ScButton>
      </div>
    </ScCard>
  )
}
