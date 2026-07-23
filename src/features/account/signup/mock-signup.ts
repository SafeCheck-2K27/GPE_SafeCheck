import type { SafeCheckUser } from "@/components/safecheck/AuthProvider"
import type { SignupFormData } from "./types"

type MockSignupPayload = Partial<SafeCheckUser> & {
  email: string
  password: string
}

type MockSignupAction = (data: MockSignupPayload) => Promise<SafeCheckUser>

export function createMockSignupPayload(
  form: SignupFormData,
): MockSignupPayload {
  return {
    email: form.email.trim(),
    password: form.password,
    pseudo: form.pseudo.trim(),
    prenom: form.prenom.trim() || undefined,
    nom: form.nom.trim() || undefined,
    age: form.age.trim() || undefined,
    pays: form.pays,
  }
}

export function submitMockSignup(
  signup: MockSignupAction,
  form: SignupFormData,
): Promise<SafeCheckUser> {
  return signup(createMockSignupPayload(form))
}
