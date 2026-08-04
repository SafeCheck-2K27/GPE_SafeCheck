import type { Dispatch, SetStateAction } from "react"
import { mockUser } from "@/lib/account-data"

export type AccountTabId =
  | "dashboard"
  | "historique"
  | "profil"
  | "preferences"

export type AccountForm = typeof mockUser
export type AccountFormSetter = Dispatch<SetStateAction<AccountForm>>

export interface NotificationPreferences {
  alertesSecurite: boolean
  actualitesCyber: boolean
  progressionRappels: boolean
  nouveautesProduit: boolean
  emailHebdo: boolean
}

export type NotificationPreferencesSetter = Dispatch<
  SetStateAction<NotificationPreferences>
>
