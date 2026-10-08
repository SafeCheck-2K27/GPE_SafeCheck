"use client"

import React, { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { ScButton, SafeCheckMark } from "@/components/safecheck/primitives"
import { useAuth } from "@/components/safecheck/AuthProvider"
import { getLoginErrorKey } from "@/components/safecheck/auth-form"
import { useI18n } from "@/components/safecheck/I18nProvider"
import { AccessibleModal } from "./AccessibleModal"
import { getAuthDestination } from "../auth-navigation"
import { getAuthFormRecovery, submitAuthForm, type AuthFormRecovery } from "../auth-form-recovery"

/* Built-in login modal used by the Navbar */
export function NavbarLoginModal({
  onClose,
  onSwitchToSignup,
  pendingHref,
}: {
  onClose: () => void
  onSwitchToSignup: () => void
  pendingHref?: string
}) {
  const auth = useAuth()
  const router = useRouter()
  const { t } = useI18n()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)
  const recoveryRef = useRef<AuthFormRecovery | null>(null)
  const [recoveringSession, setRecoveringSession] = useState(false)
  const busy = submitting || auth.authChanging
  const handleClose = () => {
    if (!submittingRef.current && !auth.authChanging) onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submittingRef.current || auth.authChanging) return
    setError(null)
    if (!recoveryRef.current && (!email.trim() || !password)) {
      setError(t("login.errorEmpty"))
      return
    }
    submittingRef.current = true
    setSubmitting(true)
    try {
      await submitAuthForm(() => auth.login(email.trim(), password), recoveryRef.current)
      recoveryRef.current = null
      const destination = getAuthDestination(pendingHref, "login")
      onClose()
      router.push(destination)
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
      zIndex={60}
      aria-labelledby="navbar-login-title"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        aria-busy={busy}
        className="w-full max-w-sm max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl p-6 sc-fade-in bg-[color:var(--sc-surface)] border border-[color:var(--sc-border)] shadow-[0_30px_60px_-20px_rgb(var(--sc-ink-rgb)/0.30)]"
      >
        <div className="flex items-center gap-2 mb-1">
          <SafeCheckMark />
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
              disabled={recoveringSession}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("login.emailPh")}
              className="sc-focus w-full px-3 py-2.5 rounded-lg text-sm bg-[color:var(--sc-surface)] text-[color:var(--sc-text)] border border-[color:var(--sc-border-strong)] focus:border-[color:var(--sc-blue)] outline-none transition-colors"
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
                disabled={recoveringSession}
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="sc-focus w-full px-3 py-2.5 pr-10 rounded-lg text-sm bg-[color:var(--sc-surface)] text-[color:var(--sc-text)] border border-[color:var(--sc-border-strong)] focus:border-[color:var(--sc-blue)] outline-none transition-colors"
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
              className="text-xs font-medium text-[color:var(--sc-danger)]"
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
            disabled={busy}
          >
            {recoveringSession ? t(busy ? "session.retrying" : "session.verify") : submitting ? t("login.submitting") : t("login.submit")}
          </ScButton>
          <button
            type="button"
            disabled={busy || recoveringSession}
            onClick={() => {
              if (!submittingRef.current && !auth.authChanging && !recoveryRef.current) onSwitchToSignup()
            }}
            className="text-xs text-center text-[color:var(--sc-text-muted)] hover:text-[color:var(--sc-blue)] transition-colors mt-1 cursor-pointer"
          >
            {t("login.noAccount")}{" "}
            <span className="text-[color:var(--sc-blue)] font-medium">{t("login.createOne")}</span>
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handleClose}
            className="text-xs text-center text-[color:var(--sc-text-muted)] hover:text-[color:var(--sc-text)] transition-colors cursor-pointer"
          >
            {t("login.cancel")}
          </button>
        </div>
      </form>
    </AccessibleModal>
  )
}
