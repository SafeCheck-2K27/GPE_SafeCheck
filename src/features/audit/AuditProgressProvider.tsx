"use client"

import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import type { AuditAnswers, AuditAnswerValue } from "./types"

/*
   SafeCheck - Audit progress context

   Persists the in-progress audit (answers + current question) in
   localStorage so a user who closes the tab or navigates away can
   resume the audit exactly where they left off.
 */

const STORAGE_KEY = "safecheck.audit.progress.v1"

interface AuditProgressState {
  answers: AuditAnswers
  currentQuestionIndex: number
}

const EMPTY_STATE: AuditProgressState = { answers: {}, currentQuestionIndex: 0 }

interface AuditProgressContextValue extends AuditProgressState {
  /** True until we've read localStorage on first mount (avoids a flash). */
  isHydrated: boolean
  setAnswer: (questionId: number, value: AuditAnswerValue) => void
  setCurrentQuestionIndex: (index: number) => void
  reset: () => void
}

const AuditProgressContext = createContext<AuditProgressContextValue | null>(null)

function readFromStorage(): AuditProgressState {
  if (typeof window === "undefined") return EMPTY_STATE
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_STATE
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === "object" && typeof parsed.answers === "object") {
      return {
        answers: parsed.answers ?? {},
        currentQuestionIndex:
          typeof parsed.currentQuestionIndex === "number" ? parsed.currentQuestionIndex : 0,
      }
    }
    return EMPTY_STATE
  } catch {
    return EMPTY_STATE
  }
}

function writeToStorage(state: AuditProgressState) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore quota / privacy mode errors */
  }
}

export function AuditProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuditProgressState>(EMPTY_STATE)
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydrate from localStorage on mount.
  useEffect(() => {
    queueMicrotask(() => {
      setState(readFromStorage())
      setIsHydrated(true)
    })
  }, [])

  // Sync progress across tabs.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return
      setState(readFromStorage())
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const setAnswer = useCallback((questionId: number, value: AuditAnswerValue) => {
    setState((current) => {
      const next = { ...current, answers: { ...current.answers, [questionId]: value } }
      writeToStorage(next)
      return next
    })
  }, [])

  const setCurrentQuestionIndex = useCallback((index: number) => {
    setState((current) => {
      const next = { ...current, currentQuestionIndex: index }
      writeToStorage(next)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    writeToStorage(EMPTY_STATE)
    setState(EMPTY_STATE)
  }, [])

  const value: AuditProgressContextValue = {
    ...state,
    isHydrated,
    setAnswer,
    setCurrentQuestionIndex,
    reset,
  }

  return <AuditProgressContext.Provider value={value}>{children}</AuditProgressContext.Provider>
}

export function useAuditProgress(): AuditProgressContextValue {
  const ctx = useContext(AuditProgressContext)
  if (!ctx) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[v0] useAuditProgress() called outside <AuditProgressProvider>. Wrap the audit page in <AuditProgressProvider>.",
      )
    }
    return {
      answers: {},
      currentQuestionIndex: 0,
      isHydrated: true,
      setAnswer: () => {},
      setCurrentQuestionIndex: () => {},
      reset: () => {},
    }
  }
  return ctx
}
