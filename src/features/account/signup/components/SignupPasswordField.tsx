import { Eye, EyeOff } from "lucide-react"
import { getPasswordStrengthColor } from "../validation"

export function SignupPasswordField({
  value,
  isVisible,
  onChange,
  onVisibilityToggle,
}: {
  value: string
  isVisible: boolean
  onChange: (value: string) => void
  onVisibilityToggle: () => void
}) {
  return (
    <div>
      <label htmlFor="signup-password" className="block text-xs font-medium text-[color:var(--sc-text)] mb-1">
        Mot de passe
      </label>
      <div className="relative">
        <input
          id="signup-password"
          name="new-password"
          type={isVisible ? "text" : "password"}
          autoComplete="new-password"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="12 caractères minimum"
          className="w-full px-3 py-2 rounded border border-[color:var(--sc-border)] text-sm bg-[color:var(--sc-surface)] focus:outline-none focus:border-[color:var(--sc-blue)] pr-9"
        />
        <button
          type="button"
          onClick={onVisibilityToggle}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[color:var(--sc-text-muted)]"
          aria-label={
            isVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"
          }
        >
          {isVisible ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>
      <div className="mt-1.5 flex gap-1">
        {[1, 2, 3].map((segment) => (
          <div
            key={segment}
            className="flex-1 h-1 rounded-full transition-colors"
            style={{
              background: getPasswordStrengthColor(value.length, segment),
            }}
          />
        ))}
      </div>
    </div>
  )
}
