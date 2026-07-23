import { ScButton } from "@/components/safecheck/primitives"
import type { SignupFormData, SignupFormField } from "../types"
import { SignupPasswordField } from "./SignupPasswordField"

const inputClassName =
  "w-full px-3 py-2 rounded border border-[color:var(--sc-border)] text-sm bg-[color:var(--sc-surface)] focus:outline-none focus:border-[color:var(--sc-blue)]"

export function SignupCredentialsStep({
  form,
  canContinue,
  passwordVisible,
  onChange,
  onPasswordVisibilityToggle,
  onContinue,
}: {
  form: SignupFormData
  canContinue: boolean
  passwordVisible: boolean
  onChange: (field: SignupFormField, value: string) => void
  onPasswordVisibilityToggle: () => void
  onContinue: () => void
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-[color:var(--sc-text)] mb-1">
        Informations personnelles
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="signup-first-name" className="block text-xs font-medium text-[color:var(--sc-text)] mb-1">
            Prénom
          </label>
          <input
            id="signup-first-name"
            name="given-name"
            type="text"
            autoComplete="given-name"
            value={form.prenom}
            onChange={(event) => onChange("prenom", event.target.value)}
            placeholder="Alaan"
            className={inputClassName}
          />
        </div>
        <div>
          <label htmlFor="signup-last-name" className="block text-xs font-medium text-[color:var(--sc-text)] mb-1">
            Nom
          </label>
          <input
            id="signup-last-name"
            name="family-name"
            type="text"
            autoComplete="family-name"
            value={form.nom}
            onChange={(event) => onChange("nom", event.target.value)}
            placeholder="Smithe"
            className={inputClassName}
          />
        </div>
      </div>
      <div>
        <label htmlFor="signup-email" className="block text-xs font-medium text-[color:var(--sc-text)] mb-1">
          Adresse email
        </label>
        <input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(event) => onChange("email", event.target.value)}
          placeholder="exemple@mail.com"
          className={inputClassName}
        />
      </div>
      <SignupPasswordField
        value={form.password}
        isVisible={passwordVisible}
        onChange={(value) => onChange("password", value)}
        onVisibilityToggle={onPasswordVisibilityToggle}
      />
      <ScButton
        variant="primary"
        size="md"
        className="w-full mt-2"
        disabled={!canContinue}
        onClick={onContinue}
      >
        Continuer
      </ScButton>
    </div>
  )
}
