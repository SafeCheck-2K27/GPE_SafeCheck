import type { ComponentType } from "react"

export type EssentialImportance = "Critique" | "Important" | "Recommandé"
export type EssentialCategory =
  | "motsdepasse"
  | "donnees"
  | "phishing"
  | "appareils"
  | "wifi"
  | "habitudes"
export type EssentialType = "Guide" | "Réglage" | "Notion" | "Habitude"
export type EssentialDifficulty = "Facile" | "Moyen" | "Avancé"
export type EssentialOs = "Windows" | "macOS" | "Mobile" | "Tous"
export type EssentialSort = "popularity" | "priority"

export interface Essential {
  id: number
  title: string
  description: string
  importance: EssentialImportance
  category: EssentialCategory
  type: EssentialType
  difficulty: EssentialDifficulty
  os: EssentialOs[]
  popularity: number
  details: string
  icon: ComponentType<{ className?: string }>
}

export interface EssentialFilters {
  search: string
  priority: string
  os: string
  difficulty: string
  type: string
  category: string
  sortBy: EssentialSort
}

export interface EssentialFilterOption {
  id: string
  label: string
}
