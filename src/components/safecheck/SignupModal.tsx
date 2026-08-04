"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Shield, Eye, EyeOff, BookmarkPlus, Check } from "lucide-react"
import {
  ScButton,
  GoogleAuthButton,
  AuthDivider,
} from "@/components/safecheck/primitives"
import { useAuth } from "@/components/safecheck/AuthProvider"
import { useI18n } from "@/components/safecheck/I18nProvider"

/**
 * SignupModal - frictionless account creation overlay used whenever a logged
 * out user tries to perform an action that needs a saved profile (e.g. opening
 * a tutorial from the audit results page).
 *
 * UX:
 *   1. Mock "Sign up with Google" button at the top (one-click path).
 *   2. "ou" / "or" divider.
 *   3. Compact email + password + pseudo form (single step - we keep the long
 *      multi-step flow on /compte/creer for users who want to fill everything).
 *   4. After signup, optionally navigates to `pendingHref` (e.g. the tutorial
 *      the user was trying to open) so the flow feels seamless.
 *
 * The component is fully self-contained: it owns its own `useState`, traps
 * Escape to close, and locks the page scroll while open.
 */
export function SignupModal({
  open,
  onClose,
  onSwitchToLogin,
  pendingHref,
  reason,
}: {
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
}) {
  const auth = useAuth()
  const router = useRouter()
  const { t } = useI18n()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [pseudo, setPseudo] = React.useState("")
  const [showPw, setShowPw] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  // Close on Escape + lock body scroll while open.
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  // Reset state whenever the modal is freshly opened so it never reopens
  // with leftover input from a previous attempt.
  React.useEffect(() => {
    if (open) {
      setEmail("")
      setPassword("")
      setPseudo("")
      setShowPw(false)
      setError(null)
      setSubmitting(false)
    }
  }, [open])

  if (!open) return null

  const finishAndRoute = () => {
    onClose()
    if (pendingHref) {
      router.push(pendingHref)
    } else {
      router.push("/compte")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email.trim() || password.length < 8) {
      setError(t("signup.errorMissing"))
      return
    }
    setSubmitting(true)
    try {
      await auth.signup({
        email: email.trim(),
        password,
        pseudo: pseudo.trim() || email.split("@")[0] || "Utilisateur",
      })
      finishAndRoute()
    } catch {
      setError(t("signup.errorGeneric"))
    } finally {
      setSubmitting(false)
    }
  }

  // Mock Google sign-up: same shortcut as the login modal but creates an
  // account record so the rest of the app sees a fresh user.
  const handleGoogle = async () => {
    if (submitting) return
    setError(null)
    setSubmitting(true)
    try {
      await auth.signup({
        email: "demo.google@safecheck.app",
        password: "google-mock",
        pseudo: "Demo Google",
      })
      finishAndRoute()
    } catch {
      setError(t("signup.errorGeneric"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[color:var(--sc-text)]/40 backdrop-blur-sm px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="signup-modal-title"
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
          className="flex items-start gap-2 rounded-lg px-3 py-2 mb-4 text-xs leading-relaxed
            bg-[color:var(--sc-bg-soft)] border border-[color:var(--sc-blue)]/20
            text-[color:var(--sc-text-2)]"
        >
          <BookmarkPlus className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[color:var(--sc-blue)]" />
          <span>{t("signup.savePerk")}</span>
        </div>

        <GoogleAuthButton
          label={t("auth.googleSignup")}
          onClick={handleGoogle}
          disabled={submitting}
        />
        <AuthDivider label={t("auth.or")} />

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
              type="text"
              autoComplete="nickname"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              placeholder={t("signup.pseudoPh")}
              className="sc-focus w-full px-3 py-2.5 rounded-lg text-sm
                bg-[color:var(--sc-surface)] text-[color:var(--sc-text)]
                border border-[color:var(--sc-border-strong)]
                focus:border-[color:var(--sc-blue)] outline-none transition-colors"
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
              htmlFor="signup-modal-password"
              className="block text-sm font-medium text-[color:var(--sc-text)] mb-1.5"
            >
              {t("login.password")}
            </label>
            <div className="relative">
              <input
                id="signup-modal-password"
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("signup.passwordPh")}
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

        <div className="mt-5 flex flex-col gap-2">
          <ScButton
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            disabled={submitting}
          >
            <Check className="w-3.5 h-3.5" />
            {submitting ? t("signup.submitting") : t("signup.submit")}
          </ScButton>
          {onSwitchToLogin && (
            <button
              type="button"
              onClick={onSwitchToLogin}
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
