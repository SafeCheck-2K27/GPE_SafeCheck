import type { SignupFormData } from "./types"

export function canContinueSignup(form: SignupFormData): boolean {
  return form.email.trim().length > 0 && form.password.length >= 8
}

export function canSubmitSignupProfile(form: SignupFormData): boolean {
  return form.pseudo.trim().length > 0
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
