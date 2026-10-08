"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Shield } from "lucide-react"
import { useAuth } from "@/components/safecheck/AuthProvider"
import { getSignupErrorKey } from "@/components/safecheck/auth-form"
import { useI18n } from "@/components/safecheck/I18nProvider"
import { getAuthFormRecovery, submitAuthForm, type AuthFormRecovery } from "@/components/safecheck/auth-form-recovery"
import { INITIAL_SIGNUP_FORM, updateSignupForm } from "../form"
import type { SignupFormField, SignupStep } from "../types"
import {
  canContinueSignup,
  canSubmitSignupProfile,
} from "../validation"
import { SignupCredentialsStep } from "./SignupCredentialsStep"
import { SignupProfileStep } from "./SignupProfileStep"
import { SignupStepIndicator } from "./SignupStepIndicator"

export function SignupFlow() {
  const router = useRouter()
  const auth = useAuth()
  const { t } = useI18n()
  const [step, setStep] = useState<SignupStep>(1)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(INITIAL_SIGNUP_FORM)
  const submittingRef = useRef(false)
  const recoveryRef = useRef<AuthFormRecovery | null>(null)
  const [recoveringSession, setRecoveringSession] = useState(false)
  const busy = submitting || auth.authChanging

  const update = (field: SignupFormField, value: string) => {
    setForm((current) => updateSignupForm(current, field, value))
  }

  const canContinue = canContinueSignup(form)
  const canSubmit = canSubmitSignupProfile(form)

  const handleCreateAccount = async () => {
    if ((!canSubmit && !recoveryRef.current) || submittingRef.current || auth.authChanging) return
    setError(null)
    submittingRef.current = true
    setSubmitting(true)
    try {
      await submitAuthForm(() => auth.signup({
        email: form.email.trim(),
        password: form.password,
        pseudo: form.pseudo.trim(),
      }), recoveryRef.current)
      recoveryRef.current = null
      router.push("/compte")
    } catch (failure) {
      recoveryRef.current = getAuthFormRecovery(failure, recoveryRef.current)
      setRecoveringSession(!!recoveryRef.current)
      setError(
        recoveryRef.current
          ? t("session.failed")
          : getSignupErrorKey(failure) === "signup.errorNetwork"
          ? "Connexion au serveur impossible. Réessaie."
          : "Création impossible. Vérifie les informations saisies et réessaie.",
      )
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <div
      className="w-full max-w-md rounded-xl p-7"
      style={{
        background: "var(--sc-surface-2)",
        border: "1px solid var(--sc-border)",
        boxShadow: "var(--sc-shadow-md)",
      }}
    >
      <div className="flex items-center gap-2 mb-5">
        <Shield className="w-5 h-5 text-[color:var(--sc-blue)]" />
        <h1 className="text-xl font-extrabold text-[color:var(--sc-text)]">
          Créer un compte SafeCheck
        </h1>
      </div>

      <SignupStepIndicator step={step} />

      {step === 1 && (
        <SignupCredentialsStep
          form={form}
          canContinue={canContinue}
          passwordVisible={passwordVisible}
          onChange={update}
          onPasswordVisibilityToggle={() =>
            setPasswordVisible((visible) => !visible)
          }
          onContinue={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <SignupProfileStep
          form={form}
          canSubmit={canSubmit || recoveringSession}
          submitting={busy}
          recoveringSession={recoveringSession}
          submitLabel={recoveringSession ? t(busy ? "session.retrying" : "session.verify") : undefined}
          onChange={update}
          onBack={() => {
            if (!submittingRef.current && !auth.authChanging && !recoveryRef.current) {
              setError(null)
              setStep(1)
            }
          }}
          onSubmit={handleCreateAccount}
        />
      )}

      {error && <p role="alert" className="mt-3 text-sm text-[color:var(--sc-danger)]">{error}</p>}

      <p className="text-xs text-center mt-4 text-[color:var(--sc-text)]">
        Déjà un compte ?{" "}
        <Link
          href="/"
          aria-disabled={busy || recoveringSession}
          onClick={(event) => {
            if (submittingRef.current || auth.authChanging || recoveryRef.current) event.preventDefault()
          }}
          className="text-[color:var(--sc-blue)] hover:underline font-medium"
        >
          Se connecter
        </Link>
      </p>
    </div>
  )
}
