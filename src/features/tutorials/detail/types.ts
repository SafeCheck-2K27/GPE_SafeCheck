export interface TutorialDetailMockComment {
  id: number
  author: string
  date: string
  text: string
  helpful: boolean
}

export interface TutorialDetailLexiconTag {
  label: string
  slug: string
  patterns: string[]
}

export type TutorialDetailState = "not_started" | "in_progress" | "done"
