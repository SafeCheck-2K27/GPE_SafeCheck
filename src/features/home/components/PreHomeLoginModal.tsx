"use client"

import { useRef, useState, type FormEvent } from "react"
import { useAuth } from "@/components/safecheck/AuthProvider"
import { getLoginErrorKey } from "@/components/safecheck/auth-form"
import { useI18n } from "@/components/safecheck/I18nProvider"
import { SafeCheckMark, ScButton } from "@/components/safecheck/primitives"
import { AccessibleModal } from "@/components/safecheck/layout/AccessibleModal"
import { getAuthFormRecovery, submitAuthForm, type AuthFormRecovery } from "@/components/safecheck/auth-form-recovery"

const loginCardClassName =
  "w-full max-w-sm max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl p-6 sc-fade-in bg-[color:var(--sc-surface)] border border-[color:var(--sc-border)] shadow-[0_30px_60px_-20px_rgb(var(--sc-ink-rgb)/0.30)]"

const loginInputClassName =
  "sc-focus w-full px-3 py-2.5 rounded-lg text-sm bg-[color:var(--sc-surface)] text-[color:var(--sc-text)] border border-[color:var(--sc-border-strong)] focus:border-[color:var(--sc-blue)] outline-none transition-colors"

export function PreHomeLoginModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: (email: string, password: string) => void | Promise<void>
}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const auth = useAuth()
  const submittingRef = useRef(false)
  const recoveryRef = useRef<AuthFormRecovery | null>(null)
  const [recoveringSession, setRecoveringSession] = useState(false)
  const busy = submitting || auth.authChanging
  const handleClose = () => {
    if (!submittingRef.current && !auth.authChanging) onClose()
  }
  const { t } = useI18n()
  const canSubmit = (recoveringSession || (email.trim().length > 0 && password.length > 0)) && !busy

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit || submittingRef.current) return
    setError(null)
    submittingRef.current = true
    setSubmitting(true)
    try {
      await submitAuthForm(async () => onSuccess(email.trim(), password), recoveryRef.current)
      recoveryRef.current = null
      onClose()
    } catch (failure) {
      recoveryRef.current = getAuthFormRecovery(failure, recoveryRef.current)
      setRecoveringSession(!!recoveryRef.current)
      setError(t(recoveryRef.current ? "session.failed" : getLoginErrorKey(failure)))
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <AccessibleModal
      open
      onClose={handleClose}
      closeOnBackdrop={!busy}
      closeOnEscape={!busy}
      aria-labelledby="prehome-login-title"
    >
      <form onSubmit={handleSubmit} aria-busy={busy} className={loginCardClassName} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-1">
          <SafeCheckMark />
          <h2
            id="prehome-login-title"
            className="font-display text-xl font-semibold text-[color:var(--sc-text)]"
          >
            Connexion
          </h2>
        </div>
        <p className="text-xs text-[color:var(--sc-text-muted)] mb-5">
          Heureux de vous retrouver sur SafeCheck.
        </p>
        <div className="space-y-4">
          <div>
            <label htmlFor="prehome-login-email" className="block text-sm font-medium text-[color:var(--sc-text)] mb-1.5">
              Adresse email
            </label>
            <input
              id="prehome-login-email"
              disabled={recoveringSession}
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@mail.com"
              className={loginInputClassName}
            />
          </div>
          <div>
            <label htmlFor="prehome-login-password" className="block text-sm font-medium text-[color:var(--sc-text)] mb-1.5">
              Mot de passe
            </label>
            <input
              id="prehome-login-password"
              disabled={recoveringSession}
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={loginInputClassName}
            />
          </div>
        </div>
        {error && <p role="alert" className="mt-3 text-sm text-[color:var(--sc-danger)]">{error}</p>}
        <div className="mt-6 flex flex-col gap-2">
          <ScButton
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            disabled={!canSubmit}
          >
            {recoveringSession ? t(busy ? "session.retrying" : "session.verify") : submitting ? "Connexion…" : "Se connecter"}
          </ScButton>
          <button
            type="button"
            disabled={busy}
            onClick={handleClose}
            className="text-sm text-center text-[color:var(--sc-text-muted)] hover:text-[color:var(--sc-blue)] transition-colors mt-1"
          >
            Annuler
          </button>
        </div>
      </form>
    </AccessibleModal>
  )
}
