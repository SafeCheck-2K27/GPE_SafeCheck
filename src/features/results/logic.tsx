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
      bg: "bg-[rgba(239,68,68,0.10)]",
      border: "border-[rgba(239,68,68,0.20)]",
      dot: "#EF4444",
    },
    summary:
      " indique une exposition significative aux risques numériques. Pas d'inquiétude : chaque action compte, et les premières étapes sont simples à mettre en place. Commence par sécuriser ton email principal.",
    scoreRecommendationIds: [1, 2, 3, 4, 5, 6],
    metrics: {
      gainPoints: "30 à 40",
      gainActions: 3,
      gainTime: "40 à 60 min",
      gainAfterTutorials: "20 à 30",
    },
    strengthProfile: "low",
    hasSecondBadge: false,
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
      bg: "bg-[rgba(245,158,11,0.10)]",
      border: "border-[rgba(245,158,11,0.25)]",
      dot: "#F59E0B",
    },
    summary:
      " révèle plusieurs lacunes dans ta sécurité numérique. Tes risques principaux concernent tes comptes, tes sauvegardes et ta protection contre le phishing. Commence par les 3 premières recommandations ci-dessous.",
    scoreRecommendationIds: [1, 2, 3, 4, 5, 6],
    metrics: {
      gainPoints: "20 à 30",
      gainActions: 3,
      gainTime: "25 à 40 min",
      gainAfterTutorials: "20 à 30",
    },
    strengthProfile: "low",
    hasSecondBadge: false,
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
      bg: "bg-[rgba(37,99,235,0.08)]",
      border: "border-[rgba(37,99,235,0.20)]",
      dot: "#2563EB",
    },
    summary:
      " indique un niveau de sécurité correct, mais avec des axes d'amélioration importants. Tes priorités immédiates : la double authentification et la gestion des mots de passe.",
    scoreRecommendationIds: [1, 2, 3, 4],
    metrics: {
      gainPoints: "15 à 20",
      gainActions: 2,
      gainTime: "15 à 25 min",
      gainAfterTutorials: "10 à 15",
    },
    strengthProfile: "high",
    hasSecondBadge: true,
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
      bg: "bg-[rgba(16,185,129,0.10)]",
      border: "border-[rgba(16,185,129,0.25)]",
      dot: "#10B981",
    },
    summary:
      " place ton niveau de sécurité parmi les meilleurs. Tu appliques déjà les pratiques essentielles. Quelques optimisations supplémentaires te permettront d'atteindre un niveau expert.",
    scoreRecommendationIds: [4, 5, 6],
    metrics: {
      gainPoints: "15 à 20",
      gainActions: 2,
      gainTime: "15 à 25 min",
      gainAfterTutorials: "10 à 15",
    },
    strengthProfile: "high",
    hasSecondBadge: true,
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
