import type { SignupFormData, SignupFormField } from "./types"

export const INITIAL_SIGNUP_FORM: SignupFormData = {
  email: "",
  password: "",
  pseudo: "",
}

export function updateSignupForm(
  form: SignupFormData,
  field: SignupFormField,
  value: string,
): SignupFormData {
  return { ...form, [field]: value }
}
