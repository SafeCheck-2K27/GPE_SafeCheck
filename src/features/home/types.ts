export interface HomeTestimonial {
  name: string
  role: string
  text: string
}

export interface HomeJourneyStep {
  number: number
  title: string
  description: string
}

export type HomeModuleTone = "blue" | "indigo" | "cyan"

export type HomeModuleIcon =
  | "book-open"
  | "sliders"
  | "list-checks"
  | "sparkles"
  | "trophy"
  | "book-marked"

export interface HomeExplorationModule {
  title: string
  description: string
  buttonLabel: string
  href: string
  tone: HomeModuleTone
  badge: string
  icon: HomeModuleIcon
}
