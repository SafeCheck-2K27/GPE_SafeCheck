"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import Footer from "@/components/safecheck/Footer"
import Navbar from "@/components/safecheck/Navbar"
import { PageShell } from "@/components/safecheck/layout/PageShell"
import { TutorialCatalogView } from "@/features/tutorials/components/TutorialCatalogView"
import { TutorialLevelView } from "@/features/tutorials/components/TutorialLevelView"
import { TutorialModal } from "@/features/tutorials/components/TutorialModal"
import { TutorialPersonalizedView } from "@/features/tutorials/components/TutorialPersonalizedView"
import { TutorialPrecisionModal } from "@/features/tutorials/components/TutorialPrecisionModal"
import type { Niveau, Tutoriel } from "@/features/tutorials/data/catalog"

export default function TutorielsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[color:var(--sc-bg)]">
          <div className="w-8 h-8 border-2 border-[color:var(--sc-blue)] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <TutorielsContent />
    </Suspense>
  )
}

function TutorielsContent() {
  const params = useSearchParams()
  const niveauParam = params.get("niveau")
  const vueParam = params.get("vue")

  const view: "personalized" | "all" | "level" = niveauParam
    ? "level"
    : vueParam === "tous"
      ? "all"
      : "personalized"

  const [selectedTuto, setSelectedTuto] = useState<Tutoriel | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const [precisionOpen, setPrecisionOpen] = useState(false)
  const [precisionStepTitle, setPrecisionStepTitle] = useState<
    string | undefined
  >(undefined)

  const openPrecision = (stepTitle?: string) => {
    setPrecisionStepTitle(stepTitle)
    setPrecisionOpen(true)
  }

  const openTuto = (tuto: Tutoriel) => {
    setSelectedTuto(tuto)
    setCurrentStep(0)
    setCompletedSteps(new Set())
  }

  const markStep = (stepIndex: number) => {
    setCompletedSteps((previousSteps) => {
      const nextSteps = new Set(previousSteps)
      if (nextSteps.has(stepIndex)) nextSteps.delete(stepIndex)
      else nextSteps.add(stepIndex)
      return nextSteps
    })
  }

  const level: Niveau =
    niveauParam === "intermediaire"
      ? "Intermediaire"
      : niveauParam === "avance"
        ? "Avance"
        : "Debutant"

  return (
    <PageShell>
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {view === "personalized" && (
          <TutorialPersonalizedView openTuto={openTuto} />
        )}

        {view === "level" && niveauParam && (
          <TutorialLevelView niveau={level} openTuto={openTuto} />
        )}

        {view === "all" && (
          <TutorialCatalogView openTuto={openTuto} />
        )}
      </main>

      <Footer />

      {selectedTuto && (
        <TutorialModal
          tuto={selectedTuto}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepChange={setCurrentStep}
          onMarkStep={markStep}
          onClose={() => setSelectedTuto(null)}
          onOpenPrecision={openPrecision}
        />
      )}

      {precisionOpen && (
        <TutorialPrecisionModal
          onClose={() => setPrecisionOpen(false)}
          stepTitle={precisionStepTitle}
        />
      )}
    </PageShell>
  )
}
