import { AuthActionError } from "./auth-logic"

export type LoginErrorKey =
  | "login.errorCredentials"
  | "login.errorNetwork"
  | "login.errorGeneric"

export type SignupErrorKey = "signup.errorNetwork" | "signup.errorGeneric"

export function getLoginErrorKey(failure: unknown): LoginErrorKey {
  if (failure instanceof AuthActionError && failure.kind === "invalid_credentials") {
    return "login.errorCredentials"
  }
  if (failure instanceof AuthActionError && failure.kind === "network") {
    return "login.errorNetwork"
  }
  return "login.errorGeneric"
}

export function getSignupErrorKey(failure: unknown): SignupErrorKey {
  return failure instanceof AuthActionError && failure.kind === "network"
    ? "signup.errorNetwork"
    : "signup.errorGeneric"
}

export function hasValidSignupCredentials(email: string, password: string): boolean {
  return email.trim().length > 0 && password.length >= 8
}

export function hasValidSignupProfile(pseudo: string): boolean {
  return pseudo.trim().length > 0
}
