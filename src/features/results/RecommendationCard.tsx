import { ArrowRight } from "lucide-react"
import { ScButton, ScCard } from "@/components/safecheck/primitives"
import type {
  Recommendation,
  ResultLanguage,
  ResultTranslator,
} from "./types"
import {
  impactColors,
  impactTranslationKeys,
  recoCopy,
  urgencyColors,
  urgencyTranslationKeys,
} from "./data"

export function RecommendationCard({
  reco,
  index,
  lang,
  t,
  onTutorialClick,
}: {
  reco: Recommendation
  index: number
  lang: ResultLanguage
  t: ResultTranslator
  onTutorialClick: (href: string) => void
}) {
  const copy = recoCopy[reco.key][lang]
  return (
    <ScCard className="flex items-start gap-4 p-4 transition-shadow hover:shadow-[var(--sc-shadow)]">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-white"
        style={{ background: "linear-gradient(135deg, var(--sc-blue-soft), var(--sc-blue))" }}
      >
        {reco.icon}
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
            style={{ background: urgencyColors[reco.urgency] }}
          >
            Urgence : {t(urgencyTranslationKeys[reco.urgency])}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-semibold text-white"
            style={{ background: impactColors[reco.impact] }}
          >
            Impact : {t(impactTranslationKeys[reco.impact])}
          </span>
        </div>
        <p className="text-xs text-[color:var(--sc-text-2)] leading-relaxed mb-3">
          {copy.desc}
        </p>
        <ScButton
          variant="primary"
          size="sm"
          onClick={() => onTutorialClick(reco.tutorielLink)}
        >
          {t("res.viewTuto")}
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </ScButton>
      </div>
    </ScCard>
  )
}
