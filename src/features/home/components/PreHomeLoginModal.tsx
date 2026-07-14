"use client"

import { useState } from "react"
import { Shield } from "lucide-react"
import { ScButton } from "@/components/safecheck/primitives"

const loginCardClassName =
  "w-full max-w-sm rounded-2xl p-6 sc-fade-in bg-[color:var(--sc-surface)] border border-[color:var(--sc-border)] shadow-[0_30px_60px_-20px_rgba(15,23,42,0.30)]"

const loginLogoClassName =
  "inline-flex items-center justify-center w-8 h-8 rounded-lg text-white bg-[linear-gradient(135deg,#3B82F6,#2563EB_60%,#6366F1)] shadow-[0_6px_16px_-6px_rgba(37,99,235,0.55)]"

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--sc-text)]/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div className={loginCardClassName} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-1">
          <span className={loginLogoClassName}>
            <Shield className="w-4 h-4" strokeWidth={2.5} />
          </span>
          <h2 className="font-display text-xl font-semibold text-[color:var(--sc-text)]">
            Connexion
          </h2>
        </div>
        <p className="text-xs text-[color:var(--sc-text-muted)] mb-5">
          Heureux de vous retrouver sur SafeCheck.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[color:var(--sc-text)] mb-1.5">
              Adresse email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@mail.com"
              className={loginInputClassName}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[color:var(--sc-text)] mb-1.5">
              Mot de passe
            </label>
            <input
              type="password"
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
    </div>
  )
}
