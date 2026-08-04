export interface PersonalizationAnswers {
  motivations: string[]
  detailLevel: string | null
  devices: string[]
  techLevel: number
  topics: string[]
  discovery: string | null
}

export type MultiSelectField = "motivations" | "devices" | "topics"
export type SingleSelectField = "detailLevel" | "discovery"

export type PersonalizationIconName =
  | "monitor"
  | "smartphone"
  | "sliders"
  | "help"

export interface PersonalizationOption {
  value: string
  label: string
  icon?: PersonalizationIconName
}
