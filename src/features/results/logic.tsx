import type { ResultLevelConfig } from "./types"

export const RESULT_LEVELS: readonly ResultLevelConfig[] = [
  {
    id: "novice",
    min: null,
    max: 34,
    labelKey: "level.novice",
    descKey: "level.novice.desc",
    colorVar: "var(--sc-danger)",
    bgClass: "bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.20)]",
    icon: "alert-triangle",
    riskLevel: "critical",
    riskLabel: "Critique",
    riskStyle: {
      text: "text-[color:var(--sc-danger)]",
      bg: "bg-[rgba(239,68,68,0.10)]",
      border: "border-[rgba(239,68,68,0.20)]",
      dot: "#EF4444",
    },
    summary:
      " indique une exposition significative aux risques numériques. Pas d'inquiétude : chaque action compte, et les premières étapes sont simples à mettre en place. Commence par sécuriser ton email principal.",
    recommendationSlice: { start: 0 },
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
    bgClass: "bg-[rgba(245,158,11,0.08)] border-[rgba(245,158,11,0.20)]",
    icon: "bug",
    riskLevel: "high",
    riskLabel: "Élevé",
    riskStyle: {
      text: "text-[color:var(--sc-warn)]",
      bg: "bg-[rgba(245,158,11,0.10)]",
      border: "border-[rgba(245,158,11,0.25)]",
      dot: "#F59E0B",
    },
    summary:
      " révèle plusieurs lacunes dans ta sécurité numérique. Tes risques principaux concernent tes comptes, tes sauvegardes et ta protection contre le phishing. Commence par les 3 premières recommandations ci-dessous.",
    recommendationSlice: { start: 0 },
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
    bgClass: "bg-[rgba(59,130,246,0.08)] border-[rgba(59,130,246,0.20)]",
    icon: "trending-up",
    riskLevel: "medium",
    riskLabel: "Modéré",
    riskStyle: {
      text: "text-[color:var(--sc-blue)]",
      bg: "bg-[rgba(37,99,235,0.08)]",
      border: "border-[rgba(37,99,235,0.20)]",
      dot: "#2563EB",
    },
    summary:
      " indique un niveau de sécurité correct, mais avec des axes d'amélioration importants. Tes priorités immédiates : la double authentification et la gestion des mots de passe.",
    recommendationSlice: { start: 0, end: 4 },
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
    bgClass: "bg-[rgba(37,99,235,0.08)] border-[rgba(37,99,235,0.20)]",
    icon: "shield",
    riskLevel: "low",
    riskLabel: "Faible",
    riskStyle: {
      text: "text-[color:var(--sc-success)]",
      bg: "bg-[rgba(16,185,129,0.10)]",
      border: "border-[rgba(16,185,129,0.25)]",
      dot: "#10B981",
    },
    summary:
      " place ton niveau de sécurité parmi les meilleurs. Tu appliques déjà les pratiques essentielles. Quelques optimisations supplémentaires te permettront d'atteindre un niveau expert.",
    recommendationSlice: { start: 3 },
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
