import { Check } from "lucide-react"
import { ScButton } from "@/components/safecheck/primitives"
import type { SignupFormData, SignupFormField } from "../types"

const inputClassName =
  "w-full px-3 py-2 rounded border border-[color:var(--sc-border)] text-sm bg-[color:var(--sc-surface)] focus:outline-none focus:border-[color:var(--sc-blue)]"

export function SignupProfileStep({
  form,
  canSubmit,
  submitting,
  recoveringSession = false,
  submitLabel,
  onChange,
  onBack,
  onSubmit,
}: {
  form: SignupFormData
  canSubmit: boolean
  submitting: boolean
  recoveringSession?: boolean
  submitLabel?: string
  onChange: (field: SignupFormField, value: string) => void
  onBack: () => void
  onSubmit: () => void
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-[color:var(--sc-text)] mb-1">
        Nom d&apos;affichage
      </p>
      <div>
        <label htmlFor="signup-pseudo" className="block text-xs font-medium text-[color:var(--sc-text)] mb-1">
          Pseudo (nom d&apos;affichage)
        </label>
        <input
          id="signup-pseudo"
          disabled={recoveringSession}
          name="nickname"
          type="text"
          autoComplete="nickname"
          value={form.pseudo}
          onChange={(event) => onChange("pseudo", event.target.value)}
          placeholder="TheAliasMan"
          className={inputClassName}
        />
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
        <ScButton variant="secondary" size="md" disabled={submitting || recoveringSession} onClick={onBack}>
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
          {submitLabel ?? (submitting ? "Création…" : "Créer mon compte")}
        </ScButton>
      </div>
    </div>
  )
}
