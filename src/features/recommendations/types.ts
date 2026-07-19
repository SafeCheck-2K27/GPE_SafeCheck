import type { ComponentType } from "react"

export type RecommendationView = "hub" | "habitudes" | "techniques"

export type HabitLevel = "Débutant" | "Intermédiaire" | "Avancé"
export type HabitTag =
  | "comptes"
  | "phishing"
  | "réseau"
  | "appareils"
  | "données"
  | "réflexes"
export type RecommendationStatus = "todo" | "en-cours" | "fait" | "sauvegarde"

interface LinkedTutorial {
  id: number
  title: string
}

export interface Habit {
  id: string
  title: string
  pitch: string
  detail: string
  whyImportant: string
  commonMistake: string
  benefit: string
  timeEstimate: string
  icon: ComponentType<{ className?: string }>
  level: HabitLevel
  tag: HabitTag
  linkedTutorials: LinkedTutorial[]
}

export type TechnicalCategory =
  | "logiciels"
  | "os"
  | "hardware"
  | "navigateur"
  | "confidentialite"
  | "sauvegarde"
  | "reseau"

export type TechnicalUrgency = "Haute" | "Moyenne" | "Faible"

export interface TechnicalRecommendation {
  id: number
  title: string
  subtitle: string
  description: string
  urgency: TechnicalUrgency
  level: HabitLevel
  category: TechnicalCategory
  icon: ComponentType<{ className?: string }>
  steps: string[]
  timeEstimate: string
  benefit: string
  whyImportant: string
  commonMistake: string
  linkedTutorials: LinkedTutorial[]
}

export interface HabitFilters {
  level: "all" | HabitLevel
  tag: "all" | HabitTag
}

export interface TechnicalRecommendationFilters {
  category: string
  level: "all" | HabitLevel
  urgency: "all" | TechnicalUrgency
}
