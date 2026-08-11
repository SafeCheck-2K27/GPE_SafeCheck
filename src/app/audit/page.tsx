"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/safecheck/Navbar"
import Footer from "@/components/safecheck/Footer"
import { PageShell } from "@/components/safecheck/layout/PageShell"
import { AuditProgressSidebar } from "@/features/audit/components/AuditProgressSidebar"
import { AuditQuestionPanel } from "@/features/audit/components/AuditQuestionPanel"
import { AuditTopBar } from "@/features/audit/components/AuditTopBar"
import { auditQuestions } from "@/features/audit/data"
import { calculateAuditScore } from "@/features/audit/scoring"
import type { AuditAnswers, AuditAnswerValue } from "@/features/audit/types"
import { serializeAuditAnswers } from "@/features/audit/url-payload"
import { useMediaQuery } from "@/lib/use-media-query"

export default function AuditPage() {
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<AuditAnswers>({})
  const [selectedOption, setSelectedOption] = useState<AuditAnswerValue | null>(null)
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  const question = auditQuestions[currentQuestionIndex]
  const isLast = currentQuestionIndex === auditQuestions.length - 1
  const progress = ((currentQuestionIndex + 1) / auditQuestions.length) * 100

  const handleSelect = (value: AuditAnswerValue) => {
    setSelectedOption(value)
    setAnswers((previous) => ({ ...previous, [question.id]: value }))
  }

  const goNext = () => {
    if (isLast) {
      const score = calculateAuditScore(auditQuestions, answers)
      router.push(
        `/personalisation?score=${score}&answers=${encodeURIComponent(serializeAuditAnswers(answers))}`,
      )
      return
    }

    const nextQuestionIndex = currentQuestionIndex + 1
    setCurrentQuestionIndex(nextQuestionIndex)
    setSelectedOption(answers[auditQuestions[nextQuestionIndex]?.id] || null)
  }

  const goPrevious = () => {
    if (currentQuestionIndex === 0) return

    const previousQuestionIndex = currentQuestionIndex - 1
    setCurrentQuestionIndex(previousQuestionIndex)
    setSelectedOption(answers[auditQuestions[previousQuestionIndex]?.id] || null)
  }

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
    setSelectedOption(answers[auditQuestions[index].id] || null)
  }

  return (
    <PageShell>
      <Navbar />

      <AuditContent
        key={isDesktop ? "desktop" : "mobile"}
        initialSidebarOpen={isDesktop}
        currentQuestionIndex={currentQuestionIndex}
        answers={answers}
        selectedOption={selectedOption}
        progress={progress}
        onQuestionSelect={goToQuestion}
        onSelect={handleSelect}
        onPrevious={goPrevious}
        onNext={goNext}
      />

      <Footer />
    </PageShell>
  )
}

function AuditContent({
  initialSidebarOpen,
  currentQuestionIndex,
  answers,
  selectedOption,
  progress,
  onQuestionSelect,
  onSelect,
  onPrevious,
  onNext,
}: {
  initialSidebarOpen: boolean
  currentQuestionIndex: number
  answers: AuditAnswers
  selectedOption: AuditAnswerValue | null
  progress: number
  onQuestionSelect: (index: number) => void
  onSelect: (value: AuditAnswerValue) => void
  onPrevious: () => void
  onNext: () => void
}) {
  const [sidebarOpen, setSidebarOpen] = useState(initialSidebarOpen)
  const question = auditQuestions[currentQuestionIndex]
  const isLast = currentQuestionIndex === auditQuestions.length - 1

  return (
    <main className="flex-1 flex relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-90"
          style={{
            backgroundImage:
              "radial-gradient(at 18% 12%, rgb(var(--sc-blue-rgb)/0.10) 0px, transparent 45%), radial-gradient(at 82% 88%, rgb(var(--sc-indigo-rgb)/0.10) 0px, transparent 45%)",
          }}
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 sc-grid-overlay opacity-30" />

        {sidebarOpen && (
          <button
            type="button"
            aria-label="Fermer la barre de progression"
            className="fixed inset-x-0 bottom-0 top-16 z-30 bg-[color:var(--sc-backdrop-soft)] lg:hidden"
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
          onQuestionSelect={onQuestionSelect}
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
            onSelect={onSelect}
            onPrevious={onPrevious}
            onNext={onNext}
          />
        </div>
    </main>
  )
}
