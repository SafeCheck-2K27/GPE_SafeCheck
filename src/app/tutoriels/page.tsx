"use client"

import { Suspense, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import Footer from "@/components/safecheck/Footer"
import Navbar from "@/components/safecheck/Navbar"
import { PageSuspenseFallback } from "@/components/safecheck/layout/PageSuspenseFallback"
import { PageShell } from "@/components/safecheck/layout/PageShell"
import { TutorialCatalogView } from "@/features/tutorials/components/TutorialCatalogView"
import { TutorialLevelView } from "@/features/tutorials/components/TutorialLevelView"
import { TutorialModal } from "@/features/tutorials/components/TutorialModal"
import { TutorialPersonalizedView } from "@/features/tutorials/components/TutorialPersonalizedView"
import type { Niveau, Tutoriel } from "@/features/tutorials/data/catalog"
import { useTutorialProgress } from "@/features/tutorials/useTutorialProgress"
import { TutorialProgressSyncStatus } from "@/features/tutorials/components/TutorialProgressSyncStatus"

export default function TutorielsPage() {
  return (
    <Suspense fallback={<PageSuspenseFallback />}>
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
  const { progressById, updateProgress, state, canInteract, sessionKey, retryHydration, retrySaves } = useTutorialProgress()
  const [readerSessionKey, setReaderSessionKey] = useState<string | null>(null)
  const syncStatus = <TutorialProgressSyncStatus state={state} retryHydration={retryHydration} retrySaves={retrySaves} />
  const catalogRef = useRef<HTMLElement>(null)
  const readerTriggerRef = useRef<HTMLElement | null>(null)


  const openTuto = (tuto: Tutoriel) => {
    if (!updateProgress(tuto)) return
    setReaderSessionKey(sessionKey)
    readerTriggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setSelectedTuto(tuto)
  }

  const closeReader = () => {
    setSelectedTuto(null)
    // A status filter or the resume section can remove the original trigger.
    requestAnimationFrame(() => {
      const trigger = readerTriggerRef.current
      if (!trigger?.isConnected || trigger.getClientRects().length === 0 || trigger.closest("[hidden]")) {
        catalogRef.current?.focus({ preventScroll: true })
      }
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

      <main ref={catalogRef} tabIndex={-1} aria-label="Catalogue des tutoriels" className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 focus-visible:outline-2 focus-visible:outline-[color:var(--sc-blue)]">
        {syncStatus}
        {canInteract && view === "personalized" && (
          <TutorialPersonalizedView openTuto={openTuto} progressById={progressById} />
        )}

        {canInteract && view === "level" && niveauParam && (
          <TutorialLevelView niveau={level} openTuto={openTuto} progressById={progressById} />
        )}

        {canInteract && view === "all" && (
          <TutorialCatalogView openTuto={openTuto} progressById={progressById} />
        )}
      </main>

      <Footer />

      {canInteract && readerSessionKey === sessionKey && selectedTuto && progressById[selectedTuto.id] && (
        <TutorialModal
          tuto={selectedTuto}
          progress={progressById[selectedTuto.id]!}
          onProgressChange={(update) => updateProgress(selectedTuto, update)}
          onClose={closeReader}
          syncStatus={syncStatus}
        />
      )}
    </PageShell>
  )
}
