export type ScoreRecommendationId = 1 | 2 | 3 | 4 | 5 | 6

export type ScoreRecommendationIconKey =
  | "lock"
  | "shield"
  | "save"
  | "hard-drive"
  | "wifi"
  | "alert-triangle"

/** A prioritized action selected from an audit score, not a catalog entry. */
export interface ScoreRecommendation {
  id: ScoreRecommendationId
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
  icon: ScoreRecommendationIconKey
}

export interface ScoreRecommendationResolution {
  recommendations: ScoreRecommendation[]
  missingIds: ScoreRecommendationId[]
}

export type ResultLanguage = "fr" | "en"

export type ResultTranslator = (
  key: string,
  params?: Record<string, string | number>,
) => string

export interface ResultRiskStyle {
  text: string
  bg: string
  border: string
  dot: string
}

type ResultLevelId = "novice" | "scarabee" | "gardien" | "sentinelle"

type ResultStrengthProfile = "low" | "high"

export interface ResultLevelConfig {
  readonly id: ResultLevelId
  readonly min: number | null
  readonly max: number | null
  readonly labelKey: string
  readonly descKey: string
  readonly colorVar: string
  readonly riskLabel: string
  readonly riskStyle: ResultRiskStyle
  readonly summary: string
  readonly scoreRecommendationIds: readonly ScoreRecommendationId[]
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

export type ScoreRecommendationsByCategory = Partial<
  Record<ScoreRecommendation["category"], ScoreRecommendation[]>
>
