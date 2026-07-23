import type { Category, Niveau, Tutoriel } from "./data/catalog"

export type TutoStatus = "todo" | "inprogress" | "done"

export type SortOption =
  | "recommended"
  | "fastest"
  | "popular"
  | "level_asc"
  | "newest"

export type StatusFilter = "all" | TutoStatus
export type DurationFilter = "all" | "quick" | "medium" | "long"
export type TypeFilter =
  | "all"
  | "essentiel"
  | "recommande"
  | "populaire"
  | "technique"

export type PrecisionType =
  | "information_fausse"
  | "information_obsolete"
  | "reformulation"
  | "manque_clarte"
  | "lien_casse"
  | "etape_ne_fonctionne_plus"
  | "precision_utile"

export type LibraryCategoryIcon =
  | "key"
  | "alert"
  | "eye"
  | "wifi"
  | "settings"
  | "smartphone"
  | "save"
  | "globe"
  | "terminal"

export interface LibraryCategoryDefinition {
  id: string
  label: string
  description: string
  icon: LibraryCategoryIcon
  categories?: Category[]
  level?: Niveau
}

export interface TutorialFilters {
  catFilter: "all" | Category
  levelFilter: "all" | Niveau
  statusFilter: StatusFilter
  durationFilter: DurationFilter
  typeFilter: TypeFilter
}

export interface PersonalizedTutorialGroup {
  tutos: Tutoriel[]
  description: string
  priority: string
}
