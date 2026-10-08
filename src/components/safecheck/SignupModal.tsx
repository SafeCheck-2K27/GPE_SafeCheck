"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, BookmarkPlus, Check } from "lucide-react"
import {
  ScButton,
  SafeCheckMark,
} from "@/components/safecheck/primitives"
import { useAuth } from "@/components/safecheck/AuthProvider"
import {
  getSignupErrorKey,
  hasValidSignupCredentials,
  hasValidSignupProfile,
} from "@/components/safecheck/auth-form"
import { useI18n } from "@/components/safecheck/I18nProvider"
import { AccessibleModal } from "@/components/safecheck/layout/AccessibleModal"
import { getAuthDestination } from "./auth-navigation"
import { getAuthFormRecovery, submitAuthForm, type AuthFormRecovery } from "./auth-form-recovery"

/**
 * SignupModal - frictionless account creation overlay used whenever a logged
 * out user tries to perform an action that needs a saved profile (e.g. opening
 * a tutorial from the audit results page).
 *
 * After signup, optionally navigates to `pendingHref`.
 */
type SignupModalProps = {
  open: boolean
  onClose: () => void
  onSwitchToLogin?: () => void
  /**
   * Optional href to navigate to after a successful signup. Lets us send the
   * user straight to the tutorial they originally clicked on.
   */
  pendingHref?: string
  /**
   * Optional context string ("Save your tutorials and progress…") shown in
   * the modal header so the user understands why they're being asked.
   */
  reason?: string
}

export function SignupModal(props: SignupModalProps) {
  if (!props.open) return null
  return <SignupModalContent {...props} />
}

function SignupModalContent({
  open,
  onClose,
  onSwitchToLogin,
  pendingHref,
  reason,
}: SignupModalProps) {
  const auth = useAuth()
  const router = useRouter()
  const { t } = useI18n()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [pseudo, setPseudo] = React.useState("")
  const [showPw, setShowPw] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)
  const submittingRef = React.useRef(false)
  const recoveryRef = React.useRef<AuthFormRecovery | null>(null)
  const [recoveringSession, setRecoveringSession] = React.useState(false)
  const busy = submitting || auth.authChanging
  const handleClose = () => {
    if (!submittingRef.current && !auth.authChanging) onClose()
  }

  const finishAndRoute = () => {
    const destination = getAuthDestination(pendingHref, "signup")
    onClose()
    router.push(destination)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submittingRef.current || auth.authChanging) return
    setError(null)
    if (!recoveryRef.current && (!hasValidSignupCredentials(email, password) || !hasValidSignupProfile(pseudo))) {
      setError(t("signup.errorMissing"))
      return
    }
    submittingRef.current = true
    setSubmitting(true)
    try {
      await submitAuthForm(() => auth.signup({
        email: email.trim(),
        password,
        pseudo: pseudo.trim(),
      }), recoveryRef.current)
      recoveryRef.current = null
      finishAndRoute()
    } catch (failure) {
      recoveryRef.current = getAuthFormRecovery(failure, recoveryRef.current)
      setRecoveringSession(!!recoveryRef.current)
      setError(t(recoveryRef.current ? "session.failed" : getSignupErrorKey(failure)))
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <AccessibleModal
      open={open}
      onClose={handleClose}
      closeOnBackdrop={!busy}
      closeOnEscape={!busy}
      zIndex={70}
      aria-labelledby="signup-modal-title"
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
            id="signup-modal-title"
            className="font-display text-xl font-semibold text-[color:var(--sc-text)]"
          >
            {t("signup.title")}
          </h2>
        </div>
        <p className="text-xs text-[color:var(--sc-text-muted)] mb-3">
          {reason || t("signup.subtitle")}
        </p>

        {/* Save-progress callout - reassures users about *why* an account is
            needed before they even look at the form. */}
        <div
          className="flex items-start gap-2 rounded-lg px-3 py-2 mb-4 text-xs leading-relaxed bg-[color:var(--sc-bg-soft)] border border-[color:var(--sc-blue)]/20 text-[color:var(--sc-text-2)]"
        >
          <BookmarkPlus className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[color:var(--sc-blue)]" />
          <span>{t("signup.savePerk")}</span>
        </div>

        <div className="space-y-3.5">
          <div>
            <label
              htmlFor="signup-modal-pseudo"
              className="block text-sm font-medium text-[color:var(--sc-text)] mb-1.5"
            >
              {t("signup.pseudo")}
            </label>
            <input
              id="signup-modal-pseudo"
              disabled={recoveringSession}
              type="text"
              autoComplete="nickname"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              placeholder={t("signup.pseudoPh")}
              className="sc-focus w-full px-3 py-2.5 rounded-lg text-sm bg-[color:var(--sc-surface)] text-[color:var(--sc-text)] border border-[color:var(--sc-border-strong)] focus:border-[color:var(--sc-blue)] outline-none transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="signup-modal-email"
              className="block text-sm font-medium text-[color:var(--sc-text)] mb-1.5"
            >
              {t("login.email")}
            </label>
            <input
              id="signup-modal-email"
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
              htmlFor="signup-modal-password"
              className="block text-sm font-medium text-[color:var(--sc-text)] mb-1.5"
            >
              {t("login.password")}
            </label>
            <div className="relative">
              <input
                id="signup-modal-password"
                disabled={recoveringSession}
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("signup.passwordPh")}
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

        <div className="mt-5 flex flex-col gap-2">
          <ScButton
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            disabled={busy}
          >
            <Check className="w-3.5 h-3.5" />
            {recoveringSession ? t(busy ? "session.retrying" : "session.verify") : submitting ? t("signup.submitting") : t("signup.submit")}
          </ScButton>
          {onSwitchToLogin && (
            <button
              type="button"
              disabled={busy || recoveringSession}
              onClick={() => {
                if (!submittingRef.current && !auth.authChanging && !recoveryRef.current) onSwitchToLogin()
              }}
              className="text-xs text-center text-[color:var(--sc-text-muted)] hover:text-[color:var(--sc-blue)] transition-colors mt-1 cursor-pointer"
            >
              {t("signup.haveAccount")}{" "}
              <span className="text-[color:var(--sc-blue)] font-medium">
                {t("signup.signInInstead")}
              </span>
            </button>
          )}
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
