import type { SignupFormData } from "./types"
import {
  hasValidSignupCredentials,
  hasValidSignupProfile,
} from "@/components/safecheck/auth-form"

export function canContinueSignup(form: SignupFormData): boolean {
  return hasValidSignupCredentials(form.email, form.password)
}

export function canSubmitSignupProfile(form: SignupFormData): boolean {
  return hasValidSignupProfile(form.pseudo)
}

export function getPasswordStrengthColor(
  passwordLength: number,
  segment: number,
): string {
  if (passwordLength < segment * 4) return "var(--sc-control-disabled)"
  if (passwordLength >= 12) return "var(--sc-success)"
  if (passwordLength >= 8) return "var(--sc-warn)"
  return "var(--sc-danger-text)"
}
