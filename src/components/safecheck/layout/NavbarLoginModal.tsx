"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, Eye, EyeOff } from "lucide-react"
import { ScButton, GoogleAuthButton, AuthDivider } from "@/components/safecheck/primitives"
import { useAuth } from "@/components/safecheck/AuthProvider"
import { useI18n } from "@/components/safecheck/I18nProvider"

/* Built-in login modal used by the Navbar */
export function NavbarLoginModal({
  onClose,
  onSwitchToSignup,
}: {
  onClose: () => void
  onSwitchToSignup: () => void
}) {
  const auth = useAuth()
  const router = useRouter()
  const { t } = useI18n()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !password) {
      setError(t("login.errorEmpty"))
      return
    }
    setSubmitting(true)
    try {
      await auth.login(email.trim(), password)
      onClose()
      router.push("/accueil")
    } catch {
      setError(t("login.errorGeneric"))
    } finally {
      setSubmitting(false)
    }
  }

  // Mock Google sign-in - in the frontend prototype we just create a fake
  // session keyed on a Google-flavoured email so the rest of the app behaves
  // exactly like a real OAuth callback.
  const handleGoogle = async () => {
    if (submitting) return
    setError(null)
    setSubmitting(true)
    try {
      await auth.login("demo.google@safecheck.app", "google-mock")
      onClose()
      router.push("/accueil")
    } catch {
      setError(t("login.errorGeneric"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[color:var(--sc-text)]/40 backdrop-blur-sm px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="navbar-login-title"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl p-6 sc-fade-in bg-[color:var(--sc-surface)]
          border border-[color:var(--sc-border)]
          shadow-[0_30px_60px_-20px_rgba(15,23,42,0.30)]"
      >
        <div className="flex items-center gap-2 mb-1">
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white
              bg-[linear-gradient(135deg,#3B82F6,#2563EB_60%,#6366F1)]
              shadow-[0_6px_16px_-6px_rgba(37,99,235,0.55)]"
          >
            <Shield className="w-4 h-4" strokeWidth={2.5} />
          </span>
          <h2
            id="navbar-login-title"
            className="font-display text-xl font-semibold text-[color:var(--sc-text)]"
          >
            {t("login.title")}
          </h2>
        </div>
        <p className="text-xs text-[color:var(--sc-text-muted)] mb-5">
          {t("login.subtitle")}
        </p>

        <GoogleAuthButton label={t("auth.googleConnect")} onClick={handleGoogle} disabled={submitting} />
        <AuthDivider label={t("auth.or")} />

        <div className="space-y-4">
          <div>
            <label
              htmlFor="navbar-login-email"
              className="block text-sm font-medium text-[color:var(--sc-text)] mb-1.5"
            >
              {t("login.email")}
            </label>
            <input
              id="navbar-login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("login.emailPh")}
              className="sc-focus w-full px-3 py-2.5 rounded-lg text-sm
                bg-[color:var(--sc-surface)] text-[color:var(--sc-text)]
                border border-[color:var(--sc-border-strong)]
                focus:border-[color:var(--sc-blue)] outline-none transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="navbar-login-password"
              className="block text-sm font-medium text-[color:var(--sc-text)] mb-1.5"
            >
              {t("login.password")}
            </label>
            <div className="relative">
              <input
                id="navbar-login-password"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="sc-focus w-full px-3 py-2.5 pr-10 rounded-lg text-sm
                  bg-[color:var(--sc-surface)] text-[color:var(--sc-text)]
                  border border-[color:var(--sc-border-strong)]
                  focus:border-[color:var(--sc-blue)] outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? t("login.hide") : t("login.show")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-[color:var(--sc-text-muted)] hover:text-[color:var(--sc-blue)]"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {error && (
            <p
              role="alert"
              className="text-xs font-medium text-[color:var(--sc-danger,#DC2626)]"
            >
              {error}
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <ScButton
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? t("login.submitting") : t("login.submit")}
          </ScButton>
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-xs text-center text-[color:var(--sc-text-muted)] hover:text-[color:var(--sc-blue)] transition-colors mt-1 cursor-pointer"
          >
            {t("login.noAccount")}{" "}
            <span className="text-[color:var(--sc-blue)] font-medium">{t("login.createOne")}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-center text-[color:var(--sc-text-muted)] hover:text-[color:var(--sc-text)] transition-colors cursor-pointer"
          >
            {t("login.cancel")}
          </button>
        </div>
      </form>
    </div>
  )
}
