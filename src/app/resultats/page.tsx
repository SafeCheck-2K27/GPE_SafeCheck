"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Navbar from "@/components/safecheck/Navbar"
import Footer from "@/components/safecheck/Footer"
import { SignupModal } from "@/components/safecheck/SignupModal"
import { useAuth } from "@/components/safecheck/AuthProvider"
import { useI18n } from "@/components/safecheck/I18nProvider"
import { PageSuspenseFallback } from "@/components/safecheck/layout/PageSuspenseFallback"
import { PageShell } from "@/components/safecheck/layout/PageShell"
import { ResultsAssessment } from "@/features/results/components/ResultsAssessment"
import { ResultsAuditInfo } from "@/features/results/components/ResultsAuditInfo"
import { ResultsComparison } from "@/features/results/components/ResultsComparison"
import { ResultsNextSteps } from "@/features/results/components/ResultsNextSteps"
import { ResultsActionPlan } from "@/features/results/components/ResultsActionPlan"
import { ResultsScoreHero } from "@/features/results/components/ResultsScoreHero"
import { ResultsStats } from "@/features/results/components/ResultsStats"
import { ResultsSummary } from "@/features/results/components/ResultsSummary"
import { getResultLevel } from "@/features/results/logic"
import {
  getScoreRecommendationsForLevel,
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
  const scoreRecommendations = getScoreRecommendationsForLevel(level)
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
    <PageShell>
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
        <ResultsActionPlan
          recommendations={scoreRecommendations}
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
            scoreRecommendations[0]?.tutorielLink ?? "/tutoriels"
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
    </PageShell>
  )
}

export default function ResultatsPage() {
  return (
    <Suspense fallback={<PageSuspenseFallback label="Chargement des résultats" />}>
      <ResultatsContent />
    </Suspense>
  )
}
