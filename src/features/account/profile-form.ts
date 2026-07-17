import type { SafeCheckUser } from "@/components/safecheck/AuthProvider"
import { mockUser } from "@/lib/account-data"
import type { AccountForm } from "./types"

export function createInitialAccountForm(): AccountForm {
  return { ...mockUser }
}

export function mergeUserIntoAccountForm(
  form: AccountForm,
  user: SafeCheckUser,
): AccountForm {
  return {
    ...form,
    pseudo: user.pseudo || form.pseudo,
    email: user.email || form.email,
    prenom: user.prenom || form.prenom,
    nom: user.nom || form.nom,
    pays: user.pays || form.pays,
    age: user.age || form.age,
  }
}
