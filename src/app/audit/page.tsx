"use client"

import { Suspense, useEffect, useLayoutEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Navbar from "@/components/safecheck/Navbar"
import Footer from "@/components/safecheck/Footer"
import { useAuth } from "@/components/safecheck/AuthProvider"
import { PageSuspenseFallback } from "@/components/safecheck/layout/PageSuspenseFallback"
import { PageShell } from "@/components/safecheck/layout/PageShell"
import { ScButton } from "@/components/safecheck/primitives"
import { AuditProgressSidebar } from "@/features/audit/components/AuditProgressSidebar"
import { AuditQuestionPanel } from "@/features/audit/components/AuditQuestionPanel"
import { AuditTopBar } from "@/features/audit/components/AuditTopBar"
import {
  AuditApiError,
  answersFromAudit,
  getAudit,
  saveAnswer,
  submitAudit,
} from "@/features/audit/api"
import { auditQuestions } from "@/features/audit/data"
import { getAuditQuestions, isSupportedAuditVersion, UnsupportedAuditVersionError } from "@/features/audit/versions"
import type { AuditAnswers, AuditAnswerValue, AuditQuestion } from "@/features/audit/types"
import { useMediaQuery } from "@/lib/use-media-query"
import { auditSessionKey, createAuditRequestScope } from "./_request-scope"

function AuditPageContent({ auditId }: { auditId: string | null }) {
  const router = useRouter()
  const [requests] = useState(createAuditRequestScope)
  const [loadState, setLoadState] = useState<
    "loading" | "ready" | "error" | "inaccessible" | "completed" | "incompatible"
  >(auditId === "" ? "inaccessible" : "loading")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<AuditAnswers>({})
  const [questions, setQuestions] = useState(auditQuestions)
  const [pendingValue, setPendingValue] = useState<AuditAnswerValue | null>(null)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  // Stop continuations at commit, before passive cleanup on identity/URL replacement.
  useLayoutEffect(() => requests.activate(), [requests])

  useEffect(() => {
    if (auditId === null) {
      void requests.run(requests.create, {
        success: (created) => {
          window.history.replaceState(
            null,
            "",
            `/audit?auditId=${encodeURIComponent(created.id)}`,
          )
        },
        error: () => setLoadState("error"),
      })
    } else if (auditId !== "") {
      void requests.run((signal) => getAudit(auditId, signal), {
        success: (audit) => {
          if (!isSupportedAuditVersion(audit)) {
            setLoadState("incompatible")
            return
          }
          if (audit.status === "completed") {
            setLoadState("completed")
            return
          }

          const restored = answersFromAudit(audit)
          const storedQuestions = getAuditQuestions(audit)
          setQuestions(storedQuestions)
          const firstUnanswered = storedQuestions.findIndex(
            (question) => !restored[question.id],
          )
          setAnswers(restored)
          setCurrentQuestionIndex(
            firstUnanswered === -1
              ? storedQuestions.length - 1
              : firstUnanswered,
          )
          setLoadState("ready")
        },
        error: (loadError) => {
          setLoadState(
            loadError instanceof AuditApiError &&
              (loadError.status === 404 || loadError.code === "INVALID_AUDIT_ID")
              ? "inaccessible"
              : loadError instanceof UnsupportedAuditVersionError
                ? "incompatible"
              : "error",
          )
        },
      })
    }
  }, [auditId, requests])

  const question = questions[currentQuestionIndex]
  const isLast = currentQuestionIndex === questions.length - 1
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const busy = saving || submitting
  const selectedOption = pendingValue ?? answers[question.id] ?? null

  const handleSelect = (value: AuditAnswerValue) => {
    if (!requests.isCurrent() || !auditId || loadState !== "ready" || busy) return
    setError(null)
    setSaving(true)
    setPendingValue(value)

    void requests.run((signal) => saveAnswer(auditId, question.id, value, signal), {
      success: (saved) => setAnswers((previous) => ({ ...previous, [question.id]: saved.value })),
      error: (saveError) => {
        if (saveError instanceof AuditApiError && saveError.code === "AUDIT_VERSION_UNSUPPORTED") {
          setLoadState("incompatible")
        } else if (saveError instanceof AuditApiError && saveError.status === 404) {
          setLoadState("inaccessible")
        } else if (
          saveError instanceof AuditApiError &&
          saveError.code === "AUDIT_COMPLETED"
        ) {
          setLoadState("completed")
        } else {
          setError("La réponse n'a pas pu être enregistrée. Réessaie.")
        }
      },
      settled: () => {
        setPendingValue(null)
        setSaving(false)
      },
    })
  }

  const goNext = () => {
    if (!requests.isCurrent() || busy || !auditId || loadState !== "ready") return
    if (isLast) {
      setError(null)
      setSubmitting(true)
      void requests.run((signal) => submitAudit(auditId, signal), {
        success: () => router.push(`/personalisation?auditId=${encodeURIComponent(auditId)}`),
        error: (submitError) => {
          if (
            submitError instanceof AuditApiError &&
            submitError.code === "AUDIT_INCOMPLETE"
          ) {
            const firstMissing = questions.findIndex((item) =>
              submitError.missingQuestionIds.includes(item.id),
            )
            if (firstMissing >= 0) setCurrentQuestionIndex(firstMissing)
            setError("Réponds à toutes les questions avant de terminer l'audit.")
          } else if (submitError instanceof AuditApiError && submitError.code === "AUDIT_VERSION_UNSUPPORTED") {
            setLoadState("incompatible")
          } else if (
            submitError instanceof AuditApiError &&
            submitError.status === 404
          ) {
            setLoadState("inaccessible")
          } else {
            setError("L'audit n'a pas pu être finalisé. Réessaie.")
          }
          setSubmitting(false)
        },
      })
      return
    }

    const nextQuestionIndex = currentQuestionIndex + 1
    setCurrentQuestionIndex(nextQuestionIndex)
    setError(null)
  }

  const goPrevious = () => {
    if (!requests.isCurrent() || currentQuestionIndex === 0 || busy) return

    const previousQuestionIndex = currentQuestionIndex - 1
    setCurrentQuestionIndex(previousQuestionIndex)
    setError(null)
  }

  const goToQuestion = (index: number) => {
    if (!requests.isCurrent() || busy) return
    setCurrentQuestionIndex(index)
    setError(null)
  }

  if (loadState !== "ready") {
    const message =
      loadState === "loading"
        ? "Chargement de l'audit…"
        : loadState === "inaccessible"
          ? "Cet audit est introuvable ou inaccessible."
          : loadState === "incompatible"
            ? "La version de cet audit n'est pas prise en charge. Ses réponses sont conservées."
          : loadState === "completed"
            ? "Cet audit est terminé."
            : "L'audit n'a pas pu être chargé."

    return (
      <PageShell>
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center gap-4 px-4 text-center">
          <p role={loadState === "loading" ? "status" : "alert"}>{message}</p>
          {loadState === "error" && (
            <ScButton onClick={() => window.location.reload()}>Réessayer</ScButton>
          )}
          {loadState === "inaccessible" && (
            <ScButton onClick={() => router.push("/audit")}>Commencer un audit</ScButton>
          )}
          {loadState === "completed" && auditId && (
            <ScButton
              onClick={() =>
                router.push(`/resultats?auditId=${encodeURIComponent(auditId)}`)
              }
            >
              Voir mes résultats
            </ScButton>
          )}
        </main>
        <Footer />
      </PageShell>
    )
  }

  return (
    <PageShell>
      <Navbar />

      <AuditContent
        questions={questions}
        key={isDesktop ? "desktop" : "mobile"}
        initialSidebarOpen={isDesktop}
        currentQuestionIndex={currentQuestionIndex}
        answers={answers}
        selectedOption={selectedOption}
        busy={busy}
        busyMessage={submitting ? "Finalisation de l'audit…" : "Enregistrement de la réponse…"}
        error={error}
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

function AuditPageForUrl() {
  const auth = useAuth()
  const auditId = useSearchParams().get("auditId")
  const sessionKey = auditSessionKey(auth.isHydrated, auth.user?.id ?? null, auditId)
  if (sessionKey === null) return <PageSuspenseFallback label="Chargement de l'audit" />
  // A claim can recover an existing audit. It must never restart the creation POST.
  const revision = auditId ? auth.accountAuditsRevision : 0
  return <AuditPageContent key={`${sessionKey}:${revision}`} auditId={auditId} />
}

export default function AuditPage() {
  return (
    <Suspense fallback={<PageSuspenseFallback label="Chargement de l'audit" />}>
      <AuditPageForUrl />
    </Suspense>
  )
}

function AuditContent({
  questions,
  initialSidebarOpen,
  currentQuestionIndex,
  answers,
  selectedOption,
  busy,
  busyMessage,
  error,
  progress,
  onQuestionSelect,
  onSelect,
  onPrevious,
  onNext,
}: {
  questions: AuditQuestion[]
  initialSidebarOpen: boolean
  currentQuestionIndex: number
  answers: AuditAnswers
  selectedOption: AuditAnswerValue | null
  busy: boolean
  busyMessage: string
  error: string | null
  progress: number
  onQuestionSelect: (index: number) => void
  onSelect: (value: AuditAnswerValue) => void
  onPrevious: () => void
  onNext: () => void
}) {
  const [sidebarOpen, setSidebarOpen] = useState(initialSidebarOpen)
  const question = questions[currentQuestionIndex]
  const isLast = currentQuestionIndex === questions.length - 1

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
          questions={questions}
          currentQuestionIndex={currentQuestionIndex}
          answers={answers}
          busy={busy}
          progress={progress}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onQuestionSelect={onQuestionSelect}
        />

        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <AuditTopBar
            sidebarOpen={sidebarOpen}
            currentQuestionIndex={currentQuestionIndex}
            questionCount={questions.length}
            question={question}
            progress={progress}
            onToggleSidebar={() => setSidebarOpen((open) => !open)}
          />
          {error && (
            <p role="alert" className="px-4 pt-4 text-center text-sm text-[color:var(--sc-danger)]">
              {error}
            </p>
          )}
          {busy && (
            <p role="status" className="px-4 pt-4 text-center text-sm text-[color:var(--sc-text-muted)]">
              {busyMessage}
            </p>
          )}
          <AuditQuestionPanel
            question={question}
            selectedOption={selectedOption}
            currentQuestionIndex={currentQuestionIndex}
            isLast={isLast}
            busy={busy}
            onSelect={onSelect}
            onPrevious={onPrevious}
            onNext={onNext}
          />
        </div>
    </main>
  )
}
