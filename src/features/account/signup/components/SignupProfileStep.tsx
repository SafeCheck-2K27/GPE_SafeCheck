import { Check } from "lucide-react"
import { ScButton } from "@/components/safecheck/primitives"
import type { SignupFormData, SignupFormField } from "../types"

const inputClassName =
  "w-full px-3 py-2 rounded border border-[color:var(--sc-border)] text-sm bg-[color:var(--sc-surface)] focus:outline-none focus:border-[color:var(--sc-blue)]"

export function SignupProfileStep({
  form,
  canSubmit,
  submitting,
  onChange,
  onBack,
  onSubmit,
}: {
  form: SignupFormData
  canSubmit: boolean
  submitting: boolean
  onChange: (field: SignupFormField, value: string) => void
  onBack: () => void
  onSubmit: () => void
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-[color:var(--sc-text)] mb-1">
        Personnalisation du profil
      </p>
      <div>
        <label htmlFor="signup-pseudo" className="block text-xs font-medium text-[color:var(--sc-text)] mb-1">
          Pseudo (nom d&apos;affichage)
        </label>
        <input
          id="signup-pseudo"
          name="nickname"
          type="text"
          autoComplete="nickname"
          value={form.pseudo}
          onChange={(event) => onChange("pseudo", event.target.value)}
          placeholder="TheAliasMan"
          className={inputClassName}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="signup-age"
            className="block text-xs font-medium text-[color:var(--sc-text)] mb-1"
          >
            Tranche d&apos;âge
          </label>
          <select
            id="signup-age"
            value={form.age}
            onChange={(event) => onChange("age", event.target.value)}
            className={inputClassName}
          >
            <option value="">Choisir une tranche…</option>
            <option value="moins-18">Moins de 18 ans</option>
            <option value="18-24">18 - 24 ans</option>
            <option value="25-34">25 - 34 ans</option>
            <option value="35-44">35 - 44 ans</option>
            <option value="45-54">45 - 54 ans</option>
            <option value="55-64">55 - 64 ans</option>
            <option value="65-plus">65 ans et plus</option>
            <option value="non-renseigne">Préfère ne pas répondre</option>
          </select>
        </div>
        <div>
          <label htmlFor="signup-country" className="block text-xs font-medium text-[color:var(--sc-text)] mb-1">
            Pays
          </label>
          <select
            id="signup-country"
            name="country-name"
            autoComplete="country-name"
            value={form.pays}
            onChange={(event) => onChange("pays", event.target.value)}
            className={inputClassName}
          >
            <option>France</option>
            <option>Belgique</option>
            <option>Suisse</option>
            <option>Canada</option>
            <option>Autre</option>
          </select>
        </div>
      </div>
      <div
        className="rounded-lg p-3 text-xs text-[color:var(--sc-text)] leading-relaxed"
        style={{
          background: "var(--sc-bg-soft)",
          border: "1px solid var(--sc-border)",
        }}
      >
        En créant un compte, tu acceptes les Conditions générales d&apos;utilisation et la Politique de protection des données personnelles de SafeCheck.
      </div>
      <div className="flex gap-3">
        <ScButton variant="secondary" size="md" onClick={onBack}>
          Retour
        </ScButton>
        <ScButton
          variant="primary"
          size="md"
          className="flex-1"
          disabled={!canSubmit || submitting}
          onClick={onSubmit}
        >
          <Check className="w-3.5 h-3.5 mr-1" />
          {submitting ? "Création…" : "Créer mon compte"}
        </ScButton>
      </div>
    </div>
  )
}
