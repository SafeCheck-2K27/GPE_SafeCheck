"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"
import { authApiOrigin, authClient } from "@/lib/auth-client"
import { invalidateAuthRequests } from "@/lib/auth-request-lifecycle"
import {
  AuthActionError,
  claimGuestAudits,
  confirmSession,
  resolveAuthSession,
  resumeAuthConfirmation,
  runAuthOperation,
  toBetterAuthSignup,
  toSafeCheckUser,
  type SafeCheckUser,
} from "./auth-logic"
import { createGuestClaimRecovery, type GuestClaimStatus } from "./guest-claim-recovery"
import { GuestClaimNotice } from "./GuestClaimNotice"
import { SessionNotice } from "./SessionNotice"

export { AuthActionError } from "./auth-logic"
export type { AuthErrorKind, SafeCheckUser } from "./auth-logic"

interface AuthContextValue {
  user: SafeCheckUser | null
  isLoggedIn: boolean
  isHydrated: boolean
  authChanging: boolean
  sessionError: boolean
  retrySession: () => Promise<void>
  guestClaimStatus: GuestClaimStatus
  accountAuditsRevision: number
  retryGuestClaim: () => Promise<void>
  login: (email: string, password: string) => Promise<SafeCheckUser>
  signup: (data: { email: string; password: string; pseudo: string }) => Promise<SafeCheckUser>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending, error: sessionLookupError, refetch } = authClient.useSession()
  const [authChanging, setAuthChanging] = useState(false)
  const [confirmationError, setConfirmationError] = useState(false)
  const [claimOperationRevision, setClaimOperationRevision] = useState(0)
  const operationLock = useRef(false)
  const pendingAuthentication = useRef<SafeCheckUser | null>(null)
  const attemptedIdentity = useRef<string | null>(null)
  const providerActive = useRef(false)
  const [claimRecovery] = useState(() => createGuestClaimRecovery(async (userId, signal) => {
    // A retry must still belong to the confirmed account before sending its cookie.
    await confirmSession(userId, { getSession: () => authClient.getSession({ fetchOptions: { signal } }) })
    signal.throwIfAborted()
    return claimGuestAudits({ fetcher: fetch, apiOrigin: authApiOrigin, warn: console.warn }, signal)
  }))
  const claimSnapshot = useSyncExternalStore(
    claimRecovery.subscribe,
    claimRecovery.getSnapshot,
    claimRecovery.getServerSnapshot,
  )
  const cachedUser = useMemo(
    () => session?.user ? toSafeCheckUser(session.user) : null,
    [session],
  )
  const resolved = resolveAuthSession(cachedUser, isPending, authChanging, !!sessionLookupError || confirmationError)
  const cachedUserId = cachedUser?.id
  // An unavailable session is unresolved, never a confirmed logout or Guest identity.
  const identity = resolved.isHydrated ? resolved.user?.id ?? null : undefined
  const runClaimOperation = useCallback((userId: string) =>
    runAuthOperation(operationLock, () => claimRecovery.claim(userId)).finally(() => {
      // Identity may have changed while its previous auto/manual claim held the lock.
      if (providerActive.current) setClaimOperationRevision((revision) => revision + 1)
    }), [claimRecovery])
  useEffect(() => { invalidateAuthRequests() }, [identity])
  useEffect(() => {
    if (identity !== undefined) {
      if (claimRecovery.getSnapshot().userId !== identity) attemptedIdentity.current = null
      claimRecovery.setIdentity(identity)
      if (identity && !operationLock.current && attemptedIdentity.current !== identity) {
        attemptedIdentity.current = identity
        void runClaimOperation(identity)
      }
    } else if (cachedUserId && cachedUserId !== claimRecovery.getSnapshot().userId) {
      attemptedIdentity.current = null
      claimRecovery.setIdentity(null)
    }
  }, [cachedUserId, claimOperationRevision, claimRecovery, identity, runClaimOperation])
  useEffect(() => {
    providerActive.current = true
    return () => {
      providerActive.current = false
      // Strict Mode replays setup before the microtask; preserve its one pending attempt.
      queueMicrotask(() => { if (!providerActive.current) claimRecovery.setIdentity(null) })
    }
  }, [claimRecovery])
  const ownsClaim = resolved.isLoggedIn && claimSnapshot.userId === resolved.user?.id
  const guestClaimStatus = ownsClaim ? claimSnapshot.status : "idle"
  const accountAuditsRevision = ownsClaim ? claimSnapshot.auditsRevision : 0

  const retryGuestClaim = useCallback(async () => {
    if (operationLock.current || !resolved.isLoggedIn || !resolved.user || claimSnapshot.userId !== resolved.user.id) return
    const userId = resolved.user.id
    await runClaimOperation(userId)
  }, [claimSnapshot.userId, resolved.isLoggedIn, resolved.user, runClaimOperation])

  const runChangingOperation = useCallback(<T,>(operation: () => Promise<T>) => runAuthOperation(operationLock, async () => {
    invalidateAuthRequests()
    setAuthChanging(true)
    try {
      return await operation()
    } finally {
      setAuthChanging(false)
    }
  }), [])

  const finishAuthentication = useCallback(async function finishAuthentication(authenticatedUser: SafeCheckUser): Promise<SafeCheckUser> {
    pendingAuthentication.current = authenticatedUser
    try {
      await confirmSession(authenticatedUser.id, { getSession: () => authClient.getSession() })
    } catch {
      setConfirmationError(true)
      throw new AuthActionError("network", () => runChangingOperation(() =>
        resumeAuthConfirmation(pendingAuthentication, authenticatedUser, finishAuthentication),
      ))
    }
    setConfirmationError(false)
    attemptedIdentity.current = authenticatedUser.id
    claimRecovery.setIdentity(authenticatedUser.id)
    await claimRecovery.claim(authenticatedUser.id)
    pendingAuthentication.current = null
    await refetch()
    return authenticatedUser
  }, [claimRecovery, refetch, runChangingOperation])

  const retrySession = useCallback(async () => {
    if (operationLock.current) return
    await runChangingOperation(async () => {
      try {
        const pendingUser = pendingAuthentication.current
        if (pendingUser) {
          await resumeAuthConfirmation(pendingAuthentication, pendingUser, finishAuthentication)
        } else {
          // Better Auth refetch resolves void and publishes lookup failures through useSession.error.
          await refetch()
          setConfirmationError(false)
        }
      } catch {
        setConfirmationError(true)
      }
    })
  }, [finishAuthentication, refetch, runChangingOperation])

  const login = useCallback((email: string, password: string) => runChangingOperation(async () => {
    pendingAuthentication.current = null
    let result: Awaited<ReturnType<typeof authClient.signIn.email>>
    try {
      result = await authClient.signIn.email({ email, password })
    } catch {
      throw new AuthActionError("network")
    }
    if (result.error) {
      throw new AuthActionError(result.error.status === 401 ? "invalid_credentials" : "generic")
    }
    if (!result.data?.user) throw new AuthActionError("generic")
    return finishAuthentication(toSafeCheckUser(result.data.user))
  }), [finishAuthentication, runChangingOperation])

  const signup = useCallback((data: { email: string; password: string; pseudo: string }) => runChangingOperation(async () => {
    pendingAuthentication.current = null
    let result: Awaited<ReturnType<typeof authClient.signUp.email>>
    try {
      result = await authClient.signUp.email(toBetterAuthSignup(data))
    } catch {
      throw new AuthActionError("network")
    }
    if (result.error) throw new AuthActionError("generic")
    if (!result.data?.user) throw new AuthActionError("generic")
    return finishAuthentication(toSafeCheckUser(result.data.user))
  }), [finishAuthentication, runChangingOperation])

  const logout = useCallback(() => runChangingOperation(async () => {
    pendingAuthentication.current = null
    try {
      const result = await authClient.signOut()
      if (result.error) throw new AuthActionError("generic")
    } catch (error) {
      if (error instanceof AuthActionError) throw error
      throw new AuthActionError("network")
    }
    // Preserve recovery on sign-out failure; clear it only after the server accepts sign-out.
    attemptedIdentity.current = null
    claimRecovery.setIdentity(null)
    setConfirmationError(false)
    await refetch()
  }), [claimRecovery, refetch, runChangingOperation])

  const value = useMemo<AuthContextValue>(() => ({
    ...resolved,
    authChanging,
    retrySession,
    guestClaimStatus,
    accountAuditsRevision,
    retryGuestClaim,
    login,
    signup,
    logout,
  }), [accountAuditsRevision, authChanging, guestClaimStatus, login, logout, resolved, retryGuestClaim, retrySession, signup])

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SessionNotice error={resolved.sessionError} retrying={authChanging} onRetry={retrySession} />
      <GuestClaimNotice status={guestClaimStatus} onRetry={retryGuestClaim} />
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
