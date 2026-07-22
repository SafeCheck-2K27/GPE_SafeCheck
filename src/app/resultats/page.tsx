"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Navbar from "@/components/safecheck/Navbar"
import Footer from "@/components/safecheck/Footer"
import { SignupModal } from "@/components/safecheck/SignupModal"
import { useAuth } from "@/components/safecheck/AuthProvider"
import { useI18n } from "@/components/safecheck/I18nProvider"
import { PageShell } from "@/components/safecheck/layout/PageShell"
import { AuditProgressProvider, useAuditProgress } from "@/features/audit/AuditProgressProvider"
import { auditQuestions } from "@/features/audit/data"
import {
  calculerScoreGlobal,
  calculerScoresParCategorie,
  compterReponses,
  extrairePointsFaibles,
  extrairePointsForts,
} from "@/features/results/categoryScoring"
import { ResultsAssessment } from "@/features/results/components/ResultsAssessment"
import { ResultsAuditInfo } from "@/features/results/components/ResultsAuditInfo"
import { ResultsCategories } from "@/features/results/components/ResultsCategories"
import { ResultsComparison } from "@/features/results/components/ResultsComparison"
import { ResultsEssentielsCta } from "@/features/results/components/ResultsEssentielsCta"
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
  const { answers, isHydrated } = useAuditProgress()

  /*
     Les réponses persistées font foi : elles permettent de recalculer le
     score et surtout de le ventiler par thème. Le paramètre d'URL reste
     un repli pour les arrivées directes sur la page (lien partagé,
     résultat consulté sans avoir repassé l'audit).
   */
  const aRepondu = compterReponses(answers) > 0
  const scoresParCategorie = aRepondu
    ? calculerScoresParCategorie(auditQuestions, answers)
    : []
  const pointsForts = extrairePointsForts(scoresParCategorie)
  const pointsFaibles = extrairePointsFaibles(scoresParCategorie)

  const score = aRepondu
    ? calculerScoreGlobal(auditQuestions, answers)
    : getResultScore(searchParams.get("score"))
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

  /*
     Tant que le localStorage n'est pas lu, on ne rend rien de définitif :
     afficher le score de repli puis le remplacer par le vrai produirait
     un clignotement trompeur sur une page de diagnostic.
     Ce retour est placé après tous les hooks, pour que leur ordre
     d'appel reste identique à chaque rendu.
   */
  if (!isHydrated) return <ResultatsLoading />

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
        <ResultsCategories scores={scoresParCategorie} />
        <ResultsAssessment
          score={score}
          level={level}
          t={t}
          pointsForts={pointsForts}
          pointsFaibles={pointsFaibles}
        />
        <ResultsEssentielsCta
          pointsFaibles={pointsFaibles}
          onOpenEssentiels={() => router.push("/essentiels")}
        />
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
    </PageShell>
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
      <AuditProgressProvider>
        <ResultatsContent />
      </AuditProgressProvider>
    </Suspense>
  )
}
