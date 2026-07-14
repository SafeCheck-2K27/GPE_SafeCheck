"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Footer from "@/components/safecheck/Footer"
import Navbar from "@/components/safecheck/Navbar"
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

  const scoreParam = searchParams.get("score") ?? ""
  const answersParam = searchParams.get("answers") ?? ""

  const buildResultsUrl = () => {
    const params = new URLSearchParams()
    if (scoreParam) params.set("score", scoreParam)
    if (answersParam) params.set("answers", answersParam)
    return `/resultats?${params.toString()}`
  }

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

  const handleSubmit = () => {
    // Answers are mocked frontend-only as requested
    // Could be persisted to localStorage or a profile endpoint here
    router.push(buildResultsUrl())
  }

  const handleSkip = () => {
    router.push(buildResultsUrl())
  }

  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--sc-bg)] font-sans">
      <Navbar />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 md:py-12 flex flex-col gap-6">
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
          onSubmit={handleSubmit}
          onSkip={handleSkip}
        />

        <div className="h-4" />
      </main>

      <Footer />
    </div>
  )
}

export default function PersonalisationPage() {
  return (
    <Suspense>
      <PersonalisationContent />
    </Suspense>
  )
}
