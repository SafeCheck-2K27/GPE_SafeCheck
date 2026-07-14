"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Navbar from "@/components/safecheck/Navbar"
import Footer from "@/components/safecheck/Footer"
import { SignupModal } from "@/components/safecheck/SignupModal"
import { useAuth } from "@/components/safecheck/AuthProvider"
import { useI18n } from "@/components/safecheck/I18nProvider"
import { ResultsAssessment } from "@/features/results/components/ResultsAssessment"
import { ResultsAuditInfo } from "@/features/results/components/ResultsAuditInfo"
import { ResultsComparison } from "@/features/results/components/ResultsComparison"
import { ResultsNextSteps } from "@/features/results/components/ResultsNextSteps"
import { ResultsRecommendations } from "@/features/results/components/ResultsRecommendations"
import { ResultsScoreHero } from "@/features/results/components/ResultsScoreHero"
import { ResultsStats } from "@/features/results/components/ResultsStats"
import { ResultsSummary } from "@/features/results/components/ResultsSummary"
import { getResultLevel } from "@/features/results/logic"
import {
  getDisplayedRecommendations,
  getResultMetrics,
  getResultScore,
} from "@/features/results/utils"

function ResultatsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, lang } = useI18n()
  const auth = useAuth()

  const score = getResultScore(searchParams.get("score"))
  const level = getResultLevel(score)
  const displayedRecommendations = getDisplayedRecommendations(level)
  const metrics = getResultMetrics(score, level)

  const [signupOpen, setSignupOpen] = useState(false)
  const [pendingHref, setPendingHref] = useState<string | undefined>(undefined)

  const handleTutorialClick = (href: string) => {
    if (auth.isLoggedIn) {
      router.push(href)
      return
    }
    setPendingHref(href)
    setSignupOpen(true)
  }

  const handleOpenSignup = () => {
    setPendingHref("/compte")
    setSignupOpen(true)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--sc-bg)] font-sans">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 md:py-12 flex flex-col gap-6">
        <ResultsScoreHero
          score={score}
          level={level}
          riskStyle={level.riskStyle}
          riskLabel={level.riskLabel}
          t={t}
        />
        <ResultsSummary score={score} level={level} />
        <ResultsStats metrics={metrics} />
        <ResultsAssessment score={score} level={level} t={t} />
        <ResultsRecommendations
          recommendations={displayedRecommendations}
          lang={lang}
          t={t}
          onTutorialClick={handleTutorialClick}
        />
        <ResultsComparison
          score={score}
          scoreColor={level.colorVar}
          metrics={metrics}
        />
        <ResultsAuditInfo onBrowseAudits={() => router.push("/audits")} />
        <ResultsNextSteps
          isLoggedIn={auth.isLoggedIn}
          firstTutorialHref={
            displayedRecommendations[0]?.tutorielLink ?? "/tutoriels"
          }
          t={t}
          onOpenSignup={handleOpenSignup}
          onDashboard={() => router.push("/compte")}
          onTutorialClick={handleTutorialClick}
          onExploreTutorials={() => router.push("/tutoriels")}
          onRestartAudit={() => router.push("/audit")}
        />
      </main>

      <Footer />

      <SignupModal
        open={signupOpen}
        onClose={() => setSignupOpen(false)}
        pendingHref={pendingHref}
        reason={t("signup.reasonTutorial")}
      />
    </div>
  )
}

function ResultatsLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen text-[color:var(--sc-blue)] font-bold bg-[color:var(--sc-bg)]">
      Chargement…
    </div>
  )
}

export default function ResultatsPage() {
  return (
    <Suspense fallback={<ResultatsLoading />}>
      <ResultatsContent />
    </Suspense>
  )
}
