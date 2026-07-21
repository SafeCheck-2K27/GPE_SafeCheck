"use client"

import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import type { AuditAnswers, AuditAnswerValue } from "./types"

/*
   SafeCheck - Contexte de progression de l'audit

   Persiste l'audit en cours (reponses + question courante) dans le
   localStorage, pour qu'un utilisateur qui ferme l'onglet ou navigue
   ailleurs reprenne exactement la ou il s'etait arrete.
 */

const STORAGE_KEY = "safecheck.audit.progress.v1"

interface AuditProgressState {
  answers: AuditAnswers
  currentQuestionIndex: number
}

const EMPTY_STATE: AuditProgressState = { answers: {}, currentQuestionIndex: 0 }

interface AuditProgressContextValue extends AuditProgressState {
  /** Passe a true une fois le localStorage lu au premier montage (evite un flash). */
  isHydrated: boolean
  setAnswer: (questionId: number, value: AuditAnswerValue) => void
  setCurrentQuestionIndex: (index: number) => void
  reset: () => void
}

const AuditProgressContext = createContext<AuditProgressContextValue | null>(null)

/*
   Un localStorage peut etre corrompu ou dater d'une version precedente du
   questionnaire. On assainit donc l'index avant de s'en servir : sans ca,
   une valeur negative, NaN ou hors bornes ferait planter le rendu au
   moment d'indexer `auditQuestions`.
 */
function sanitizeQuestionIndex(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) return 0
  return value
}

function readFromStorage(): AuditProgressState {
  if (typeof window === "undefined") return EMPTY_STATE
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_STATE
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === "object" && typeof parsed.answers === "object") {
      return {
        answers: parsed.answers ?? {},
        currentQuestionIndex: sanitizeQuestionIndex(parsed.currentQuestionIndex),
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
    /* on ignore les erreurs de quota / navigation privee */
  }
}

export function AuditProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuditProgressState>(EMPTY_STATE)
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydratation depuis le localStorage au montage.
  useEffect(() => {
    queueMicrotask(() => {
      setState(readFromStorage())
      setIsHydrated(true)
    })
  }, [])

  // Synchronisation de la progression entre les onglets.
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
