"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/safecheck/Navbar"
import Footer from "@/components/safecheck/Footer"
import { PageShell } from "@/components/safecheck/layout/PageShell"
import { AuditProgressProvider, useAuditProgress } from "@/features/audit/AuditProgressProvider"
import { AuditProgressSidebar } from "@/features/audit/components/AuditProgressSidebar"
import { AuditQuestionPanel } from "@/features/audit/components/AuditQuestionPanel"
import { AuditTopBar } from "@/features/audit/components/AuditTopBar"
import { auditQuestions } from "@/features/audit/data"
import { calculateAuditScore } from "@/features/audit/scoring"
import type { AuditAnswerValue } from "@/features/audit/types"

export default function AuditPage() {
  return (
    <AuditProgressProvider>
      <AuditPageContent />
    </AuditProgressProvider>
  )
}

function AuditPageContent() {
  const router = useRouter()
  const {
    answers,
    currentQuestionIndex: storedQuestionIndex,
    setAnswer,
    setCurrentQuestionIndex,
  } = useAuditProgress()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  /*
     L'index vient du localStorage : si la liste des questions a change
     depuis la derniere visite, il peut pointer hors du tableau. On le
     borne avant toute indexation pour ne jamais rendre une question
     `undefined`.
   */
  const currentQuestionIndex = Math.min(storedQuestionIndex, auditQuestions.length - 1)

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)")
    const syncSidebarWithViewport = () => setSidebarOpen(desktop.matches)

    queueMicrotask(syncSidebarWithViewport)
    desktop.addEventListener("change", syncSidebarWithViewport)
    return () => desktop.removeEventListener("change", syncSidebarWithViewport)
  }, [])

  const question = auditQuestions[currentQuestionIndex]
  const isLast = currentQuestionIndex === auditQuestions.length - 1
  const progress = ((currentQuestionIndex + 1) / auditQuestions.length) * 100
  const selectedOption: AuditAnswerValue | null = answers[question.id] || null

  const handleSelect = (value: AuditAnswerValue) => {
    setAnswer(question.id, value)
  }

  const goNext = () => {
    if (isLast) {
      const score = calculateAuditScore(auditQuestions, answers)
      router.push(
        `/personalisation?score=${score}&answers=${encodeURIComponent(JSON.stringify(answers))}`,
      )
      return
    }

    setCurrentQuestionIndex(currentQuestionIndex + 1)
  }

  const goPrevious = () => {
    if (currentQuestionIndex === 0) return

    setCurrentQuestionIndex(currentQuestionIndex - 1)
  }

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
  }

  return (
    <PageShell>
      <Navbar />

      <main className="flex-1 flex relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-90"
          style={{
            backgroundImage:
              "radial-gradient(at 18% 12%, rgba(37,99,235,0.10) 0px, transparent 45%), radial-gradient(at 82% 88%, rgba(99,102,241,0.10) 0px, transparent 45%)",
          }}
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 sc-grid-overlay opacity-30" />

        {sidebarOpen && (
          <button
            type="button"
            aria-label="Fermer la barre de progression"
            className="fixed inset-x-0 bottom-0 top-16 z-30 bg-black/35 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <AuditProgressSidebar
          questions={auditQuestions}
          currentQuestionIndex={currentQuestionIndex}
          answers={answers}
          progress={progress}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onQuestionSelect={goToQuestion}
        />

        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <AuditTopBar
            sidebarOpen={sidebarOpen}
            currentQuestionIndex={currentQuestionIndex}
            questionCount={auditQuestions.length}
            question={question}
            progress={progress}
            onToggleSidebar={() => setSidebarOpen((open) => !open)}
          />
          <AuditQuestionPanel
            question={question}
            selectedOption={selectedOption}
            currentQuestionIndex={currentQuestionIndex}
            isLast={isLast}
            onSelect={handleSelect}
            onPrevious={goPrevious}
            onNext={goNext}
          />
        </div>
      </main>

      <Footer />
    </PageShell>
  )
}
