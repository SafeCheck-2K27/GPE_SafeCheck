"use client"

import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import type { TutoStatus } from "./types"

/*
   SafeCheck - Contexte de progression des tutoriels

   Persiste le statut de lecture par tutoriel ("todo" / "inprogress" /
   "done") dans le localStorage, en remplacement du jeu de donnees fige
   `mockTutoStatus`, pour un suivi reel qui survit aux rechargements.
 */

const STORAGE_KEY = "safecheck.tutorials.status.v1"

const STATUTS_VALIDES: readonly TutoStatus[] = ["todo", "inprogress", "done"]

type StatusMap = Record<number, TutoStatus>

const EMPTY_STATE: StatusMap = {}

interface TutorialsProgressContextValue {
  statuses: StatusMap
  /** Passe a true une fois le localStorage lu au premier montage (evite un flash). */
  isHydrated: boolean
  getStatus: (tutorialId: number) => TutoStatus
  setStatus: (tutorialId: number, status: TutoStatus) => void
}

const TutorialsProgressContext = createContext<TutorialsProgressContextValue | null>(null)

/*
   Le contenu du localStorage est une entree non fiable : on ne le caste
   jamais directement. On ne recopie que les paires (id numerique ->
   statut connu), ce qui ecarte au passage les cles speciales du type
   `__proto__` et les statuts devenus obsoletes.
 */
function sanitizeStatusMap(parsed: unknown): StatusMap {
  if (!parsed || typeof parsed !== "object") return EMPTY_STATE

  const clean: StatusMap = {}
  for (const [cle, valeur] of Object.entries(parsed)) {
    const id = Number(cle)
    if (!Number.isInteger(id) || id < 0) continue
    if (typeof valeur !== "string") continue
    if (!STATUTS_VALIDES.includes(valeur as TutoStatus)) continue
    clean[id] = valeur as TutoStatus
  }
  return clean
}

function readFromStorage(): StatusMap {
  if (typeof window === "undefined") return EMPTY_STATE
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_STATE
    return sanitizeStatusMap(JSON.parse(raw))
  } catch {
    return EMPTY_STATE
  }
}

function writeToStorage(statuses: StatusMap) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses))
  } catch {
    /* on ignore les erreurs de quota / navigation privee */
  }
}

export function TutorialsProgressProvider({ children }: { children: React.ReactNode }) {
  const [statuses, setStatuses] = useState<StatusMap>(EMPTY_STATE)
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydratation depuis le localStorage au montage.
  useEffect(() => {
    queueMicrotask(() => {
      setStatuses(readFromStorage())
      setIsHydrated(true)
    })
  }, [])

  // Synchronisation de la progression entre les onglets.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return
      setStatuses(readFromStorage())
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const setStatus = useCallback((tutorialId: number, status: TutoStatus) => {
    setStatuses((current) => {
      const next = { ...current, [tutorialId]: status }
      writeToStorage(next)
      return next
    })
  }, [])

  const getStatus = useCallback(
    (tutorialId: number): TutoStatus => statuses[tutorialId] ?? "todo",
    [statuses],
  )

  const value: TutorialsProgressContextValue = {
    statuses,
    isHydrated,
    getStatus,
    setStatus,
  }

  return (
    <TutorialsProgressContext.Provider value={value}>{children}</TutorialsProgressContext.Provider>
  )
}

export function useTutorialsProgress(): TutorialsProgressContextValue {
  const ctx = useContext(TutorialsProgressContext)
  if (!ctx) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[v0] useTutorialsProgress() called outside <TutorialsProgressProvider>. Wrap the page in <TutorialsProgressProvider>.",
      )
    }
    return {
      statuses: {},
      isHydrated: true,
      getStatus: () => "todo",
      setStatus: () => {},
    }
  }
  return ctx
}
