"use client"

import { useState } from "react"
import { SafeCheckMark, ScButton } from "@/components/safecheck/primitives"
import { AccessibleModal } from "@/components/safecheck/layout/AccessibleModal"

const loginCardClassName =
  "w-full max-w-sm rounded-2xl p-6 sc-fade-in bg-[color:var(--sc-surface)] border border-[color:var(--sc-border)] shadow-[0_30px_60px_-20px_rgb(var(--sc-ink-rgb)/0.30)]"

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
  const canSubmit = email.trim().length > 0 && password.length > 0 && !submitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      await onSuccess(email.trim(), password)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AccessibleModal
      open
      onClose={onClose}
      aria-labelledby="prehome-login-title"
    >
      <div className={loginCardClassName} onClick={(e) => e.stopPropagation()}>
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
        <div className="mt-6 flex flex-col gap-2">
          <ScButton
            variant="primary"
            size="md"
            className="w-full"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {submitting ? "Connexion…" : "Se connecter"}
          </ScButton>
          <button
            onClick={onClose}
            className="text-sm text-center text-[color:var(--sc-text-muted)] hover:text-[color:var(--sc-blue)] transition-colors mt-1"
          >
            Annuler
          </button>
        </div>
      </div>
    </AccessibleModal>
  )
}
