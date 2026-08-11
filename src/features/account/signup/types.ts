export type SignupStep = 1 | 2

export interface SignupFormData {
  prenom: string
  nom: string
  email: string
  password: string
  pseudo: string
  age: string
  pays: string
}

export type SignupFormField = keyof SignupFormData
