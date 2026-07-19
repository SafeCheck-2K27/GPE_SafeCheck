"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react"

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
  /** True after the first client snapshot has been read from localStorage. */
  isHydrated: boolean
  login: (email: string, password: string) => Promise<SafeCheckUser>
  signup: (data: Partial<SafeCheckUser> & { email: string; password: string }) => Promise<SafeCheckUser>
  logout: () => void
  updateUser: (patch: Partial<SafeCheckUser>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

type AuthSnapshot = string | null | undefined

const authListeners = new Set<() => void>()
let memorySnapshot: string | null = null

function getAuthSnapshot(): AuthSnapshot {
  if (typeof window === "undefined") return undefined
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return memorySnapshot
  }
}

function getServerAuthSnapshot(): AuthSnapshot {
  return undefined
}

function parseAuthSnapshot(snapshot: AuthSnapshot): SafeCheckUser | null {
  if (!snapshot) return null
  try {
    const parsed = JSON.parse(snapshot)
    if (parsed && typeof parsed === "object" && typeof parsed.email === "string") {
      return parsed as SafeCheckUser
    }
    return null
  } catch {
    return null
  }
}

function subscribeToAuth(listener: () => void) {
  authListeners.add(listener)

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener()
  }
  window.addEventListener("storage", onStorage)

  return () => {
    authListeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

function emitAuthChange() {
  authListeners.forEach((listener) => listener())
}

function writeToStorage(user: SafeCheckUser | null) {
  if (typeof window === "undefined") return
  const nextSnapshot = user ? JSON.stringify(user) : null
  memorySnapshot = nextSnapshot

  try {
    if (nextSnapshot) {
      window.localStorage.setItem(STORAGE_KEY, nextSnapshot)
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    /* ignore quota / privacy mode errors */
  }

  emitAuthChange()
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribeToAuth,
    getAuthSnapshot,
    getServerAuthSnapshot,
  )
  const user = useMemo(() => parseAuthSnapshot(snapshot), [snapshot])
  const isHydrated = snapshot !== undefined

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
      return next
    },
    []
  )

  const logout = useCallback(() => {
    writeToStorage(null)
  }, [])

  const updateUser = useCallback((patch: Partial<SafeCheckUser>) => {
    if (!user) return
    writeToStorage({ ...user, ...patch })
  }, [user])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoggedIn: !!user,
      isHydrated,
      login,
      signup,
      logout,
      updateUser,
    }),
    [isHydrated, login, logout, signup, updateUser, user],
  )

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
