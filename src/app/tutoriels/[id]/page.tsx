"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Footer from "@/components/safecheck/Footer"
import Navbar from "@/components/safecheck/Navbar"
import { PageShell } from "@/components/safecheck/layout/PageShell"
import { TutorialModal } from "@/features/tutorials/components/TutorialModal"
import { TutorialPrecisionModal } from "@/features/tutorials/components/TutorialPrecisionModal"
import { TutorialDetailFeedback } from "@/features/tutorials/detail/components/TutorialDetailFeedback"
import { TutorialDetailHero } from "@/features/tutorials/detail/components/TutorialDetailHero"
import { TutorialTextWithLexicon } from "@/features/tutorials/detail/components/TutorialDetailLexicon"
import {
  TutorialDetailBreadcrumb,
  TutorialDetailNotFound,
} from "@/features/tutorials/detail/components/TutorialDetailNavigation"
import { TutorialDetailOverview } from "@/features/tutorials/detail/components/TutorialDetailOverview"
import { TutorialDetailSidebar } from "@/features/tutorials/detail/components/TutorialDetailSidebar"
import {
  getRelatedTutorials,
  getTutorialDetailState,
  getTutorialProgressPercent,
  resolveTutorialRoute,
} from "@/features/tutorials/detail/utils"
import { tutoriels } from "@/features/tutorials/data/catalog"
import { Send } from "lucide-react"

export default function TutorielDetailPage() {
  const params = useParams()
  const router = useRouter()
  const routeParam = Array.isArray(params.id) ? params.id[0] : params.id
  const tutorial = resolveTutorialRoute(tutoriels, routeParam)

  const [readerOpen, setReaderOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [saved, setSaved] = useState(false)
  const [markedDone, setMarkedDone] = useState(false)
  const [precisionOpen, setPrecisionOpen] = useState(false)
  const [precisionStepTitle, setPrecisionStepTitle] = useState<
    string | undefined
  >(undefined)

  const openPrecision = (stepTitle?: string) => {
    setPrecisionStepTitle(stepTitle)
    setPrecisionOpen(true)
  }

  const markStep = (stepIndex: number) => {
    setCompletedSteps((previousSteps) => {
      const nextSteps = new Set(previousSteps)
      if (nextSteps.has(stepIndex)) nextSteps.delete(stepIndex)
      else nextSteps.add(stepIndex)
      return nextSteps
    })
  }

  const openReader = () => {
    setReaderOpen(true)
    setCurrentStep(0)
    if (!markedDone) setCompletedSteps(new Set())
  }

  if (!tutorial) {
    return (
      <PageShell>
        <Navbar />
        <TutorialDetailNotFound
          onBack={() => router.push("/tutoriels")}
        />
        <Footer />
      </PageShell>
    )
  }

  const progressPercent = getTutorialProgressPercent(
    completedSteps.size,
    tutorial.steps.length,
  )
  const tutorialState = getTutorialDetailState(
    markedDone,
    completedSteps.size,
  )
  const relatedTutorials = getRelatedTutorials(
    tutoriels,
    tutorial,
  )

  return (
    <PageShell>
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        <TutorialDetailBreadcrumb title={tutorial.title} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          <div className="min-w-0">
            <TutorialDetailHero
              tutorial={tutorial}
              tutorialState={tutorialState}
              progressPercent={progressPercent}
              completedStepCount={completedSteps.size}
              saved={saved}
              markedDone={markedDone}
              onOpenReader={openReader}
              onToggleSaved={() => setSaved(!saved)}
              onToggleMarkedDone={() => setMarkedDone(!markedDone)}
            />

            <TutorialDetailOverview
              tutorial={tutorial}
              completedSteps={completedSteps}
              tutorialState={tutorialState}
              onOpenReader={openReader}
            />

            <TutorialDetailFeedback
              tutorial={tutorial}
              onOpenPrecision={openPrecision}
            />
          </div>

          <TutorialDetailSidebar
            tutorial={tutorial}
            relatedTutorials={relatedTutorials}
          />
        </div>
      </main>

      <Footer />

      {readerOpen && (
        <TutorialModal
          tuto={tutorial}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepChange={setCurrentStep}
          onMarkStep={markStep}
          onClose={() => setReaderOpen(false)}
          onOpenPrecision={openPrecision}
          renderStepDescription={(description) => (
            <TutorialTextWithLexicon text={description} />
          )}
          precisionLinkPosition="after-completion"
        />
      )}

      {precisionOpen && (
        <TutorialPrecisionModal
          onClose={() => setPrecisionOpen(false)}
          stepTitle={precisionStepTitle}
          submitIcon={<Send className="w-3.5 h-3.5" />}
        />
      )}
    </PageShell>
  )
}
