export type SignupStep = 1 | 2

export interface SignupFormData {
  email: string
  password: string
  pseudo: string
}

export type SignupFormField = keyof SignupFormData
