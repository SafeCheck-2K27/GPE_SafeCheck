"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"

/*
   SafeCheck - Auth context (frontend mockup)

   This is a UI mockup, so there is no real backend. We persist
   the "session" in localStorage so the user stays logged in
   across page navigations and reloads, exactly like a real app.

   Replace the bodies of `login` / `signup` with real API calls
   when wiring a backend.
 */

const STORAGE_KEY = "safecheck.user.v1"

export interface SafeCheckUser {
  email: string
  pseudo: string
  prenom?: string
  nom?: string
  pays?: string
  age?: string
}

interface AuthContextValue {
  user: SafeCheckUser | null
  isLoggedIn: boolean
  /** True until we've read localStorage on first mount (avoids a flash). */
  isHydrated: boolean
  login: (email: string, password: string) => Promise<SafeCheckUser>
  signup: (data: Partial<SafeCheckUser> & { email: string; password: string }) => Promise<SafeCheckUser>
  logout: () => void
  updateUser: (patch: Partial<SafeCheckUser>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readFromStorage(): SafeCheckUser | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === "object" && typeof parsed.email === "string") {
      return parsed as SafeCheckUser
    }
    return null
  } catch {
    return null
  }
}

function writeToStorage(user: SafeCheckUser | null) {
  if (typeof window === "undefined") return
  try {
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    /* ignore quota / privacy mode errors */
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeCheckUser | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydrate from localStorage on mount.
  useEffect(() => {
    queueMicrotask(() => {
      setUser(readFromStorage())
      setIsHydrated(true)
    })
  }, [])

  // Sync session across tabs.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return
      setUser(readFromStorage())
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    void password
    // Mockup: derive a friendly pseudo from the email local part.
    const local = email.split("@")[0] || "Utilisateur"
    const pseudo = local
      .replace(/[._-]+/g, " ")
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0]?.toUpperCase() + w.slice(1))
      .join("")
      || "Utilisateur"

    const next: SafeCheckUser = { email, pseudo }
    writeToStorage(next)
    setUser(next)
    return next
  }, [])

  const signup = useCallback(
    async (data: Partial<SafeCheckUser> & { email: string; password: string }) => {
      const next: SafeCheckUser = {
        email: data.email,
        pseudo: data.pseudo || data.prenom || data.email.split("@")[0] || "Utilisateur",
        prenom: data.prenom,
        nom: data.nom,
        pays: data.pays,
        age: data.age,
      }
      writeToStorage(next)
      setUser(next)
      return next
    },
    []
  )

  const logout = useCallback(() => {
    writeToStorage(null)
    setUser(null)
  }, [])

  const updateUser = useCallback((patch: Partial<SafeCheckUser>) => {
    setUser((current) => {
      if (!current) return current
      const next = { ...current, ...patch }
      writeToStorage(next)
      return next
    })
  }, [])

  const value: AuthContextValue = {
    user,
    isLoggedIn: !!user,
    isHydrated,
    login,
    signup,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    // Permissive fallback so a forgotten provider doesn't crash the
    // whole app - but we still warn loudly in dev.
    if (process.env.NODE_ENV !== "production") {
      console.warn("[v0] useAuth() called outside <AuthProvider>. Wrap your tree in <AuthProvider> in app/layout.tsx.")
    }
    return {
      user: null,
      isLoggedIn: false,
      isHydrated: true,
      login: async () => {
        throw new Error("AuthProvider missing")
      },
      signup: async () => {
        throw new Error("AuthProvider missing")
      },
      logout: () => {},
      updateUser: () => {},
    }
  }
  return ctx
}
