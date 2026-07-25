"use client"

import { useCallback } from "react"
import { usePersistentState } from "@/lib/use-persistent-state"
import {
  parseEssentialStatusMap,
  type EssentialStatus,
  type EssentialStatusMap,
} from "./status"

const STORAGE_KEY = "safecheck.essentials.status.v1"

// Fonctions stables (niveau module) exigées par usePersistentState.
const parse = (raw: string | null): EssentialStatusMap => parseEssentialStatusMap(raw)
const serialize = (map: EssentialStatusMap): string | null =>
  Object.keys(map).length > 0 ? JSON.stringify(map) : null

export interface EssentialStatusStore {
  statuses: EssentialStatusMap
  isHydrated: boolean
  getStatus: (essentialId: number) => EssentialStatus
  setStatus: (essentialId: number, status: EssentialStatus) => void
}

export function useEssentialStatus(): EssentialStatusStore {
  const { value, isHydrated, set } = usePersistentState(STORAGE_KEY, { parse, serialize })

  const getStatus = useCallback(
    (essentialId: number): EssentialStatus => value[essentialId] ?? "a_faire",
    [value],
  )

  const setStatus = useCallback(
    (essentialId: number, status: EssentialStatus) => {
      set((current) => {
        const next = { ...current }
        // « à faire » est le défaut : on retire la clé plutôt que de la stocker.
        if (status === "a_faire") delete next[essentialId]
        else next[essentialId] = status
        return next
      })
    },
    [set],
  )

  return { statuses: value, isHydrated, getStatus, setStatus }
}
