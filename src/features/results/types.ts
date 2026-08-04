import type { ReactNode } from "react"

export interface Recommendation {
  id: number
  key:
    | "double-auth"
    | "password-manager"
    | "backup"
    | "auto-updates"
    | "wifi"
    | "phishing"
  category: "comptes" | "appareils" | "sauvegardes" | "reseau" | "phishing"
  urgency: "Haute" | "Moyenne" | "Faible"
  impact: "Fort" | "Moyen" | "Faible"
  tutorielLink: string
  icon: ReactNode
}

export type ResultLanguage = "fr" | "en"

export type ResultTranslator = (
  key: string,
  params?: Record<string, string | number>,
) => string

export type ResultRiskLevel = "low" | "medium" | "high" | "critical"

export interface ResultRiskStyle {
  text: string
  bg: string
  border: string
  dot: string
}

export type ResultLevelId = "novice" | "scarabee" | "gardien" | "sentinelle"

export type ResultLevelIcon =
  | "alert-triangle"
  | "bug"
  | "trending-up"
  | "shield"

export type ResultStrengthProfile = "low" | "high"

export interface ResultLevelConfig {
  readonly id: ResultLevelId
  readonly min: number | null
  readonly max: number | null
  readonly labelKey: string
  readonly descKey: string
  readonly colorVar: string
  readonly bgClass: string
  readonly icon: ResultLevelIcon
  readonly riskLevel: ResultRiskLevel
  readonly riskLabel: string
  readonly riskStyle: ResultRiskStyle
  readonly summary: string
  readonly recommendationSlice: {
    readonly start: number
    readonly end?: number
  }
  readonly metrics: {
    readonly gainPoints: string
    readonly gainActions: number
    readonly gainTime: string
    readonly gainAfterTutorials: string
  }
  readonly strengthProfile: ResultStrengthProfile
  readonly hasSecondBadge: boolean
}

export interface ResultMetrics {
  gainPoints: string
  gainActions: number
  gainTime: string
  averageScore: number
  similarProfilePercentage: number
  gainAfterTutorials: string
}

export type RecommendationsByCategory = Partial<
  Record<Recommendation["category"], Recommendation[]>
>
