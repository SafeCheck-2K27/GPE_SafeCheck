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
