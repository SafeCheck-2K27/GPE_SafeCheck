export interface SafeCheckUser {
  id: string
  email: string
  pseudo: string
}

export type AuthErrorKind = "invalid_credentials" | "network" | "generic" | "busy"

export class AuthActionError extends Error {
  constructor(readonly kind: AuthErrorKind, readonly recovery?: () => Promise<SafeCheckUser>) {
    super(kind)
  }
}

export function toSafeCheckUser(user: { id: string; email: string; name: string }): SafeCheckUser {
  return { id: user.id, email: user.email, pseudo: user.name }
}

export function toBetterAuthSignup(data: { email: string; password: string; pseudo: string }) {
  return { email: data.email, password: data.password, name: data.pseudo }
}

export function getAuthFlags(user: SafeCheckUser | null, isPending: boolean) {
  return { isLoggedIn: !!user && !isPending, isHydrated: !isPending }
}

export function resolveAuthSession(
  cachedUser: SafeCheckUser | null,
  isPending: boolean,
  authChanging: boolean,
  sessionError: boolean,
) {
  const blocked = isPending || authChanging || sessionError
  const user = blocked ? null : cachedUser
  return { user, ...getAuthFlags(user, blocked), sessionError }
}

/** Acquire before the first await: React state alone cannot prevent same-tick submissions. */
export async function runAuthOperation<T>(
  lock: { current: boolean },
  operation: () => Promise<T>,
): Promise<T> {
  if (lock.current) throw new AuthActionError("busy")
  lock.current = true
  try {
    return await operation()
  } finally {
    lock.current = false
  }
}

export async function resumeAuthConfirmation(
  pending: { current: SafeCheckUser | null },
  expectedUser: SafeCheckUser,
  resume: (user: SafeCheckUser) => Promise<SafeCheckUser>,
): Promise<SafeCheckUser> {
  // Object identity scopes a callback to one auth success, including repeated logins by the same user.
  if (pending.current !== expectedUser) throw new AuthActionError("generic")
  return resume(expectedUser)
}

type SessionDependencies = {
  getSession: () => Promise<{ data?: { user: { id: string } } | null; error?: unknown }>
}

type ClaimDependencies = {
  fetcher: (url: URL, init: RequestInit) => Promise<{ ok: boolean; json: () => Promise<unknown> }>
  apiOrigin: string
  warn: (message: string) => void
}

export type GuestClaimResult = "succeeded" | "unchanged" | "failed"

export async function confirmSession(
  userId: string,
  dependencies: SessionDependencies,
): Promise<void> {
  let confirmed: Awaited<ReturnType<SessionDependencies["getSession"]>>
  try {
    confirmed = await dependencies.getSession()
  } catch {
    throw new AuthActionError("network")
  }
  if (confirmed.error || confirmed.data?.user.id !== userId) {
    throw new AuthActionError("network")
  }
}

export async function claimGuestAudits(
  dependencies: ClaimDependencies,
  signal?: AbortSignal,
): Promise<GuestClaimResult> {
  try {
    signal?.throwIfAborted()
    // Native window.fetch must not receive the dependencies object as its receiver.
    const fetcher = dependencies.fetcher
    const response = await fetcher(new URL("/audits/claim-guest", dependencies.apiOrigin), {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      ...(signal ? { signal } : {}),
    })
    if (!response.ok) throw new Error("Guest audit claim failed")
    signal?.throwIfAborted()
    const payload = await response.json() as { claimedCount?: unknown } | null
    signal?.throwIfAborted()
    if (!payload || !Number.isSafeInteger(payload.claimedCount) || (payload.claimedCount as number) < 0) {
      throw new Error("Invalid guest audit claim response")
    }
    if (payload.claimedCount === 0) return "unchanged"
    return "succeeded"
  } catch {
    // Authentication succeeded. The signed guest cookie remains available for a later claim.
    if (!signal?.aborted) dependencies.warn("SafeCheck: guest audits could not be claimed")
    return "failed"
  }
}

export async function confirmSessionAndClaim(
  userId: string,
  dependencies: SessionDependencies & ClaimDependencies,
): Promise<GuestClaimResult> {
  await confirmSession(userId, dependencies)
  return claimGuestAudits(dependencies)
}
