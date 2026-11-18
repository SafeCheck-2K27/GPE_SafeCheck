"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Footer from "@/components/safecheck/Footer"
import Navbar from "@/components/safecheck/Navbar"
import { PageSuspenseFallback } from "@/components/safecheck/layout/PageSuspenseFallback"
import { PageShell } from "@/components/safecheck/layout/PageShell"
import { ScButton } from "@/components/safecheck/primitives"
import { PersonalizationActions } from "@/features/personalization/components/PersonalizationActions"
import { PersonalizationHero } from "@/features/personalization/components/PersonalizationHero"
import { PersonalizationQuestionnaire } from "@/features/personalization/components/PersonalizationQuestionnaire"
import { INITIAL_PERSONALIZATION_ANSWERS } from "@/features/personalization/data"
import type {
  MultiSelectField,
  PersonalizationAnswers,
  SingleSelectField,
} from "@/features/personalization/types"

function PersonalisationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const auditId = searchParams.get("auditId")

  const [form, setForm] = useState<PersonalizationAnswers>(
    INITIAL_PERSONALIZATION_ANSWERS,
  )

  const toggleMulti = (field: MultiSelectField) => (value: string) => {
    setForm((previousForm) => {
      const current = previousForm[field]
      return {
        ...previousForm,
        [field]: current.includes(value)
          ? current.filter((currentValue) => currentValue !== value)
          : [...current, value],
      }
    })
  }

  const setSingle = (field: SingleSelectField) => (value: string) => {
    setForm((previousForm) => ({ ...previousForm, [field]: value }))
  }

  const goToResults = () => {
    if (auditId) {
      router.push(`/resultats?auditId=${encodeURIComponent(auditId)}`)
    }
  }

  return (
    <PageShell>
      <Navbar />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 md:py-12 flex flex-col gap-6">
        {!auditId ? (
          <div className="flex flex-col items-start gap-4">
            <p role="alert" className="text-sm text-[color:var(--sc-danger)]">
              Aucun audit à afficher. Lance un nouvel audit pour voir tes résultats.
            </p>
            <ScButton onClick={() => router.push("/audit")}>Commencer un audit</ScButton>
          </div>
        ) : (
          <>
            <PersonalizationHero />
            <PersonalizationQuestionnaire
              form={form}
              toggleMulti={toggleMulti}
              setSingle={setSingle}
              setTechLevel={(techLevel) =>
                setForm((previousForm) => ({ ...previousForm, techLevel }))
              }
            />

            <PersonalizationActions
              onSubmit={goToResults}
              onSkip={goToResults}
            />
          </>
        )}

        <div className="h-4" />
      </main>

      <Footer />
    </PageShell>
  )
}

export default function PersonalisationPage() {
  return (
    <Suspense fallback={<PageSuspenseFallback />}>
      <PersonalisationContent />
    </Suspense>
  )
}
