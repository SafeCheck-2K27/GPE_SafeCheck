import { AuthActionError, type SafeCheckUser } from "./auth-logic"

export type AuthFormRecovery = () => Promise<SafeCheckUser>

export function getAuthFormRecovery(failure: unknown, previous: AuthFormRecovery | null): AuthFormRecovery | null {
  return failure instanceof AuthActionError ? failure.recovery ?? previous : previous
}

/** Resume confirmation after a successful credential POST, without repeating it. */
export async function submitAuthForm<T>(action: () => Promise<T>, recovery: AuthFormRecovery | null): Promise<T | SafeCheckUser> {
  return recovery ? recovery() : action()
}
