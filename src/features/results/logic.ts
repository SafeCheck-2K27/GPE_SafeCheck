import type { ResultLevelConfig } from "./types"

export const RESULT_LEVELS: readonly ResultLevelConfig[] = [
  {
    id: "novice",
    min: null,
    max: 34,
    labelKey: "level.novice",
    descKey: "level.novice.desc",
    colorVar: "var(--sc-danger)",
    riskLabel: "Critique",
    riskStyle: {
      text: "text-[color:var(--sc-danger)]",
      bg: "bg-[rgb(var(--sc-danger-rgb)/0.10)]",
      border: "border-[rgb(var(--sc-danger-rgb)/0.20)]",
      dot: "var(--sc-danger)",
    },
    summary:
      " correspond à la tranche 0–34 de la grille de cet audit, associée à un risque critique.",
    scoreRecommendationIds: [1, 2, 3, 4, 5, 6],
  },
  {
    id: "scarabee",
    min: 35,
    max: 59,
    labelKey: "level.scarabee",
    descKey: "level.scarabee.desc",
    colorVar: "var(--sc-warn)",
    riskLabel: "Élevé",
    riskStyle: {
      text: "text-[color:var(--sc-warn)]",
      bg: "bg-[rgb(var(--sc-warn-rgb)/0.10)]",
      border: "border-[rgb(var(--sc-warn-rgb)/0.25)]",
      dot: "var(--sc-warn)",
    },
    summary:
      " correspond à la tranche 35–59 de la grille de cet audit, associée à un risque élevé.",
    scoreRecommendationIds: [1, 2, 3, 4, 5, 6],
  },
  {
    id: "gardien",
    min: 60,
    max: 79,
    labelKey: "level.gardien",
    descKey: "level.gardien.desc",
    colorVar: "var(--sc-blue-soft)",
    riskLabel: "Modéré",
    riskStyle: {
      text: "text-[color:var(--sc-blue)]",
      bg: "bg-[rgb(var(--sc-blue-rgb)/0.08)]",
      border: "border-[rgb(var(--sc-blue-rgb)/0.20)]",
      dot: "var(--sc-blue)",
    },
    summary:
      " correspond à la tranche 60–79 de la grille de cet audit, associée à un risque modéré.",
    scoreRecommendationIds: [1, 2, 3, 4],
  },
  {
    id: "sentinelle",
    min: 80,
    max: null,
    labelKey: "level.sentinelle",
    descKey: "level.sentinelle.desc",
    colorVar: "var(--sc-blue)",
    riskLabel: "Faible",
    riskStyle: {
      text: "text-[color:var(--sc-success)]",
      bg: "bg-[rgb(var(--sc-success-rgb)/0.10)]",
      border: "border-[rgb(var(--sc-success-rgb)/0.25)]",
      dot: "var(--sc-success)",
    },
    summary:
      " correspond à la tranche 80–100 de la grille de cet audit, associée à un risque faible.",
    scoreRecommendationIds: [4, 5, 6],
  },
]

export function getResultLevel(score: number): ResultLevelConfig {
  return (
    RESULT_LEVELS.find(
      (level) =>
        (level.min === null || score >= level.min) &&
        (level.max === null || score <= level.max),
    ) ?? RESULT_LEVELS[0]
  )
}
