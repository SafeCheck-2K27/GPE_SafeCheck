"use client"

import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import type { EssentielStatut } from "./types"

/*
   SafeCheck - Contexte de progression des Essentiels

   Persiste le statut par essentiel ("a_faire" / "fait" / "a_revoir")
   dans le localStorage, pour que la checklist survive aux rechargements,
   avec un retour visuel immediat sur la carte et le detail.
 */

const STORAGE_KEY = "safecheck.essentiels.statuts.v1"

const STATUTS_VALIDES: readonly EssentielStatut[] = ["a_faire", "fait", "a_revoir"]

type StatutMap = Record<number, EssentielStatut>

const EMPTY_STATE: StatutMap = {}

interface EssentielsContextValue {
  statuts: StatutMap
  /** Passe a true une fois le localStorage lu au premier montage (evite un flash). */
  isHydrated: boolean
  getStatut: (essentielId: number) => EssentielStatut
  setStatut: (essentielId: number, statut: EssentielStatut) => void
}

const EssentielsContext = createContext<EssentielsContextValue | null>(null)

/*
   Le contenu du localStorage est une entree non fiable : on ne le caste
   jamais directement. On ne recopie que les paires (id numerique ->
   statut connu), ce qui ecarte au passage les cles speciales du type
   `__proto__` et les statuts devenus obsoletes.
 */
function sanitizeStatutMap(parsed: unknown): StatutMap {
  if (!parsed || typeof parsed !== "object") return EMPTY_STATE

  const clean: StatutMap = {}
  for (const [cle, valeur] of Object.entries(parsed)) {
    const id = Number(cle)
    if (!Number.isInteger(id) || id < 0) continue
    if (typeof valeur !== "string") continue
    if (!STATUTS_VALIDES.includes(valeur as EssentielStatut)) continue
    clean[id] = valeur as EssentielStatut
  }
  return clean
}

function readFromStorage(): StatutMap {
  if (typeof window === "undefined") return EMPTY_STATE
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_STATE
    return sanitizeStatutMap(JSON.parse(raw))
  } catch {
    return EMPTY_STATE
  }
}

function writeToStorage(statuts: StatutMap) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(statuts))
  } catch {
    /* on ignore les erreurs de quota / navigation privee */
  }
}

export function EssentielsProvider({ children }: { children: React.ReactNode }) {
  const [statuts, setStatuts] = useState<StatutMap>(EMPTY_STATE)
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydratation depuis le localStorage au montage.
  useEffect(() => {
    queueMicrotask(() => {
      setStatuts(readFromStorage())
      setIsHydrated(true)
    })
  }, [])

  // Synchronisation des statuts entre les onglets.
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
      const next = { ...current }
      // "a_faire" est la valeur par defaut : on retire la cle plutot que
      // de la stocker, pour garder un JSON compact et faciliter les
      // futures migrations de format.
      if (statut === "a_faire") delete next[essentielId]
      else next[essentielId] = statut
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
