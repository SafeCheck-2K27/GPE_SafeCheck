export type AuditCatalogStatus = "available" | "coming" | "premium"
export type AuditLevelIconKey = "crown" | "microscope" | "shield-check" | "zap"

export interface AuditLevel {
  id: string
  level: string
  title: string
  duration: string
  durationShort: string
  goal: string
  outputs: string[]
  audience: string
  status: AuditCatalogStatus
  href: string
  icon: AuditLevelIconKey
  accent: string
}

export interface AuditStatusPresentation {
  badgeTone: "success" | "warn" | "premium"
  badgeLabel: string
  badgeIcon: "check" | "sparkles" | null
  actionLabel: "Lancer" | "En savoir plus"
  actionVariant: "primary" | "secondary"
  accessibleAction: "Lancer" | "En savoir plus sur"
}
