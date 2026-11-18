"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Footer from "@/components/safecheck/Footer"
import Navbar from "@/components/safecheck/Navbar"
import { PageShell } from "@/components/safecheck/layout/PageShell"
import { TutorialModal } from "@/features/tutorials/components/TutorialModal"
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
  resolveTutorialRoute,
} from "@/features/tutorials/detail/utils"
import { tutoriels } from "@/features/tutorials/data/catalog"
import { useTutorialProgress } from "@/features/tutorials/useTutorialProgress"
import { TutorialProgressSyncStatus } from "@/features/tutorials/components/TutorialProgressSyncStatus"
import { completeTutorial, getTutorialProgressPercent, getTutorialStatus } from "@/features/tutorials/progress"

export default function TutorielDetailPage() {
  const params = useParams()
  const router = useRouter()
  const routeParam = Array.isArray(params.id) ? params.id[0] : params.id
  const tutorial = resolveTutorialRoute(tutoriels, routeParam)

  const [readerOpen, setReaderOpen] = useState(false)
  const { progressById, updateProgress, state, canInteract, sessionKey, retryHydration, retrySaves } = useTutorialProgress()
  const [readerSessionKey, setReaderSessionKey] = useState<string | null>(null)
  const syncStatus = <TutorialProgressSyncStatus state={state} retryHydration={retryHydration} retrySaves={retrySaves} />

  const openReader = () => {
    if (!tutorial || !updateProgress(tutorial)) return
    setReaderSessionKey(sessionKey)
    setReaderOpen(true)
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

  const progress = progressById[tutorial.id] ?? null
  const progressPercent = getTutorialProgressPercent(progress, tutorial.steps.length)
  const tutorialState = getTutorialStatus(progress, tutorial.steps.length)
  const relatedTutorials = getRelatedTutorials(
    tutoriels,
    tutorial,
  )

  return (
    <PageShell>
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        <TutorialDetailBreadcrumb title={tutorial.title} />
        {syncStatus}

        {canInteract && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          <div className="min-w-0">
            <TutorialDetailHero
              tutorial={tutorial}
              tutorialState={tutorialState}
              progressPercent={progressPercent}
              completedStepCount={progress?.completedSteps.length ?? 0}
              onOpenReader={openReader}
              onComplete={() => updateProgress(tutorial, (previous) => completeTutorial(previous, tutorial.steps.length))}
            />

            <TutorialDetailOverview
              tutorial={tutorial}
              progress={progress}
              tutorialState={tutorialState}
              onOpenReader={openReader}
            />
          </div>

          <TutorialDetailSidebar
            tutorial={tutorial}
            relatedTutorials={relatedTutorials}
          />
        </div>
        )}
      </main>

      <Footer />

      {canInteract && readerSessionKey === sessionKey && readerOpen && progress && (
        <TutorialModal
          tuto={tutorial}
          progress={progress}
          onProgressChange={(update) => updateProgress(tutorial, update)}
          onClose={() => setReaderOpen(false)}
          renderStepDescription={(description) => (
            <TutorialTextWithLexicon text={description} />
          )}
          syncStatus={syncStatus}
        />
      )}
    </PageShell>
  )
}
