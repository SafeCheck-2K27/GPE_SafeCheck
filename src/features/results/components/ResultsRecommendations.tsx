"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { RecommendationCard } from "../RecommendationCard"
import { categoryLabels } from "../data"
import { groupRecommendationsByCategory } from "../utils"
import type {
  Recommendation,
  ResultLanguage,
  ResultTranslator,
} from "../types"

const recosToggleButtonClassName =
  "w-full flex items-center justify-between px-4 py-3 bg-[color:var(--sc-surface-2)] hover:bg-[color:var(--sc-bg-soft)] text-sm font-semibold text-[color:var(--sc-text)] transition-colors cursor-pointer"

export function ResultsRecommendations({
  recommendations,
  lang,
  t,
  onTutorialClick,
}: {
  recommendations: Recommendation[]
  lang: ResultLanguage
  t: ResultTranslator
  onTutorialClick: (href: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const topRecommendations = recommendations.slice(0, 3)
  const extraRecommendations = recommendations.slice(3)
  const extraByCategory = groupRecommendationsByCategory(extraRecommendations)

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[color:var(--sc-text)] font-display">
          {t("res.priorityRecos")}
        </h2>
        <span className="text-xs text-[color:var(--sc-text-muted)]">
          {recommendations.length} recommandation
          {recommendations.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex flex-col gap-3 mb-3">
        {topRecommendations.map((recommendation, index) => (
          <RecommendationCard
            key={recommendation.id}
            reco={recommendation}
            index={index}
            lang={lang}
            t={t}
            onTutorialClick={onTutorialClick}
          />
        ))}
      </div>

      {extraRecommendations.length > 0 && (
        <div className="rounded-xl border border-[color:var(--sc-border)] overflow-hidden">
          <button
            onClick={() => setExpanded((current) => !current)}
            className={recosToggleButtonClassName}
            aria-expanded={expanded}
          >
            <span className="flex items-center gap-2">
              <ChevronDown
                className={`w-4 h-4 text-[color:var(--sc-blue)] transition-transform ${expanded ? "rotate-180" : ""}`}
              />
              Voir {extraRecommendations.length} recommandation
              {extraRecommendations.length > 1 ? "s" : ""} supplémentaire
              {extraRecommendations.length > 1 ? "s" : ""}
            </span>
            <span className="text-xs text-[color:var(--sc-text-muted)] font-normal">
              Plan d&apos;action complet
            </span>
          </button>

          {expanded && (
            <div className="divide-y divide-[color:var(--sc-border)]">
              {Object.entries(extraByCategory).map(
                ([category, categoryRecommendations]) => {
                  if (!categoryRecommendations) return null
                  const categoryInfo =
                    categoryLabels[category as Recommendation["category"]]

                  return (
                    <div key={category} className="bg-[color:var(--sc-surface)]">
                      <div className="px-4 py-2 flex items-center gap-2 bg-[color:var(--sc-surface-2)]/50">
                        <span className="text-[color:var(--sc-text-muted)]">
                          {categoryInfo.icon}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-[color:var(--sc-text-muted)]">
                          {lang === "fr" ? categoryInfo.fr : categoryInfo.en}
                        </span>
                      </div>
                      <div className="p-3 flex flex-col gap-3">
                        {categoryRecommendations.map((recommendation, index) => (
                          <RecommendationCard
                            key={recommendation.id}
                            reco={recommendation}
                            index={topRecommendations.length + index}
                            lang={lang}
                            t={t}
                            onTutorialClick={onTutorialClick}
                          />
                        ))}
                      </div>
                    </div>
                  )
                },
              )}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
