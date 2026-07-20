"use client"

import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import type { EssentielStatut } from "./types"

/*
   SafeCheck - Essentiels progress context

   Persists the per-essentiel status ("a_faire" / "fait" / "a_revoir")
   in localStorage so the checklist state survives reloads, with
   immediate visual feedback on the card and detail views.
 */

const STORAGE_KEY = "safecheck.essentiels.statuts.v1"

type StatutMap = Record<number, EssentielStatut>

const EMPTY_STATE: StatutMap = {}

interface EssentielsContextValue {
  statuts: StatutMap
  /** True until we've read localStorage on first mount (avoids a flash). */
  isHydrated: boolean
  getStatut: (essentielId: number) => EssentielStatut
  setStatut: (essentielId: number, statut: EssentielStatut) => void
}

const EssentielsContext = createContext<EssentielsContextValue | null>(null)

function readFromStorage(): StatutMap {
  if (typeof window === "undefined") return EMPTY_STATE
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_STATE
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === "object") return parsed as StatutMap
    return EMPTY_STATE
  } catch {
    return EMPTY_STATE
  }
}

function writeToStorage(statuts: StatutMap) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(statuts))
  } catch {
    /* ignore quota / privacy mode errors */
  }
}

export function EssentielsProvider({ children }: { children: React.ReactNode }) {
  const [statuts, setStatuts] = useState<StatutMap>(EMPTY_STATE)
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydrate from localStorage on mount.
  useEffect(() => {
    queueMicrotask(() => {
      setStatuts(readFromStorage())
      setIsHydrated(true)
    })
  }, [])

  // Sync statuts across tabs.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return
      setStatuts(readFromStorage())
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const setStatut = useCallback((essentielId: number, statut: EssentielStatut) => {
    setStatuts((current) => {
      const next = { ...current, [essentielId]: statut }
      writeToStorage(next)
      return next
    })
  }, [])

  const getStatut = useCallback(
    (essentielId: number): EssentielStatut => statuts[essentielId] ?? "a_faire",
    [statuts],
  )

  const value: EssentielsContextValue = {
    statuts,
    isHydrated,
    getStatut,
    setStatut,
  }

  return <EssentielsContext.Provider value={value}>{children}</EssentielsContext.Provider>
}

export function useEssentielsProgress(): EssentielsContextValue {
  const ctx = useContext(EssentielsContext)
  if (!ctx) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[v0] useEssentielsProgress() called outside <EssentielsProvider>. Wrap the page in <EssentielsProvider>.",
      )
    }
    return {
      statuts: {},
      isHydrated: true,
      getStatut: () => "a_faire",
      setStatut: () => {},
    }
  }
  return ctx
}
