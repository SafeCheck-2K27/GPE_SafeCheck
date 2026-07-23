"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Shield } from "lucide-react"
import { useAuth } from "@/components/safecheck/AuthProvider"
import { INITIAL_SIGNUP_FORM, updateSignupForm } from "../form"
import { submitMockSignup } from "../mock-signup"
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
  const [step, setStep] = useState<SignupStep>(1)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(INITIAL_SIGNUP_FORM)

  const update = (field: SignupFormField, value: string) => {
    setForm((current) => updateSignupForm(current, field, value))
  }

  const canContinue = canContinueSignup(form)
  const canSubmit = canSubmitSignupProfile(form)

  const handleCreateAccount = async () => {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    try {
      await submitMockSignup(auth.signup, form)
      router.push("/compte")
    } finally {
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
          canSubmit={canSubmit}
          submitting={submitting}
          onChange={update}
          onBack={() => setStep(1)}
          onSubmit={handleCreateAccount}
        />
      )}

      <p className="text-xs text-center mt-4 text-[color:var(--sc-text)]">
        Déjà un compte ?{" "}
        <Link
          href="/"
          className="text-[color:var(--sc-blue)] hover:underline font-medium"
        >
          Se connecter
        </Link>
      </p>
    </div>
  )
}
