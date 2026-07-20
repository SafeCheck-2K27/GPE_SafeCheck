"use client"

import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import type { TutoStatus } from "./types"

/*
   SafeCheck - Tutorials progress context

   Persists per-tutorial reading status ("todo" / "inprogress" / "done")
   in localStorage, replacing the mockTutoStatus fixture with a real,
   per-user record that survives reloads.
 */

const STORAGE_KEY = "safecheck.tutorials.status.v1"

type StatusMap = Record<number, TutoStatus>

const EMPTY_STATE: StatusMap = {}

interface TutorialsProgressContextValue {
  statuses: StatusMap
  /** True until we've read localStorage on first mount (avoids a flash). */
  isHydrated: boolean
  getStatus: (tutorialId: number) => TutoStatus
  setStatus: (tutorialId: number, status: TutoStatus) => void
}

const TutorialsProgressContext = createContext<TutorialsProgressContextValue | null>(null)

function readFromStorage(): StatusMap {
  if (typeof window === "undefined") return EMPTY_STATE
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_STATE
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === "object") return parsed as StatusMap
    return EMPTY_STATE
  } catch {
    return EMPTY_STATE
  }
}

function writeToStorage(statuses: StatusMap) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses))
  } catch {
    /* ignore quota / privacy mode errors */
  }
}

export function TutorialsProgressProvider({ children }: { children: React.ReactNode }) {
  const [statuses, setStatuses] = useState<StatusMap>(EMPTY_STATE)
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydrate from localStorage on mount.
  useEffect(() => {
    queueMicrotask(() => {
      setStatuses(readFromStorage())
      setIsHydrated(true)
    })
  }, [])

  // Sync progress across tabs.
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
