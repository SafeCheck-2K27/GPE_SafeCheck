export type AuditAnswerValue = "a" | "b" | "c" | "d"

export interface AuditOption {
  label: string
  value: AuditAnswerValue
  score: number
}

export interface AuditQuestion {
  id: number
  category: string
  text: string
  options: AuditOption[]
}

export type AuditAnswers = Partial<Record<number, AuditAnswerValue>>
