export type AccountSessionView = "error" | "loading" | "authenticated" | "guest"

export function getAccountSessionView({
  isHydrated,
  sessionError,
  authChanging,
  isLoggedIn,
  hasUser,
}: {
  isHydrated: boolean
  sessionError: boolean
  authChanging: boolean
  isLoggedIn: boolean
  hasUser: boolean
}): AccountSessionView {
  if (sessionError) return "error"
  if (!isHydrated || authChanging) return "loading"
  return isLoggedIn && hasUser ? "authenticated" : "guest"
}
