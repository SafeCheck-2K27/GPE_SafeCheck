"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Navbar from "@/components/safecheck/Navbar"
import Footer from "@/components/safecheck/Footer"
import { SignupModal } from "@/components/safecheck/SignupModal"
import { NavbarLoginModal } from "@/components/safecheck/layout/NavbarLoginModal"
import { internalAuthHref } from "@/components/safecheck/auth-navigation"
import { useAuth } from "@/components/safecheck/AuthProvider"
import { useI18n } from "@/components/safecheck/I18nProvider"
import { PageSuspenseFallback } from "@/components/safecheck/layout/PageSuspenseFallback"
import { PageShell } from "@/components/safecheck/layout/PageShell"
import { ScButton } from "@/components/safecheck/primitives"
import { AuditApiError, answersFromAudit, getAudit } from "@/features/audit/api"
import { calculateVersionedAuditScore } from "@/features/audit/scoring"
import { assertSupportedAuditVersion, UnsupportedAuditVersionError } from "@/features/audit/versions"
import { ResultsAuditInfo } from "@/features/results/components/ResultsAuditInfo"
import { ResultsNextSteps } from "@/features/results/components/ResultsNextSteps"
import { ResultsActionPlan } from "@/features/results/components/ResultsActionPlan"
import { ResultsScoreHero } from "@/features/results/components/ResultsScoreHero"
import { ResultsSummary } from "@/features/results/components/ResultsSummary"
import { getResultLevel } from "@/features/results/logic"
import { getScoreRecommendationsForLevel } from "@/features/results/utils"

function ResultatsContent() {
  const auth = useAuth()
  const { t } = useI18n()
  const [authMode, setAuthMode] = useState<"signup" | "login" | null>(null)
  const [pendingHref, setPendingHref] = useState<string | undefined>(undefined)
  const closeAuth = () => {
    setAuthMode(null)
    setPendingHref(undefined)
  }
  const openAuth = (href: string) => {
    setPendingHref(internalAuthHref(href))
    setAuthMode("signup")
  }

  // The auth gate survives hydration and identity changes; loaded audits do not.
  return (
    <>
      {auth.sessionError ? (
        <PageShell>
          <Navbar />
          <main className="flex-1 flex flex-col items-center justify-center gap-4 px-4 text-center">
            <p role="alert">La session n&apos;a pas pu être vérifiée. Réessaie.</p>
            <ScButton disabled={auth.authChanging} onClick={() => void auth.retrySession()}>Réessayer</ScButton>
          </main>
          <Footer />
        </PageShell>
      ) : !auth.isHydrated ? (
        <PageSuspenseFallback label="Chargement des résultats" />
      ) : (
        <ResultatsForSession key={auth.user?.id ?? "guest"} onOpenAuth={openAuth} />
      )}
      <SignupModal
        open={authMode === "signup"}
        onClose={closeAuth}
        onSwitchToLogin={() => setAuthMode("login")}
        pendingHref={pendingHref}
        reason={pendingHref === "/compte" ? undefined : t("signup.reasonTutorial")}
      />
      {authMode === "login" && (
        <NavbarLoginModal
          onClose={closeAuth}
          onSwitchToSignup={() => setAuthMode("signup")}
          pendingHref={pendingHref}
        />
      )}
    </>
  )
}

function ResultatsForSession({ onOpenAuth }: { onOpenAuth: (href: string) => void }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, lang } = useI18n()
  const auth = useAuth()
  const auditId = searchParams.get("auditId")
  const [result, setResult] = useState<
    | { auditId: string; kind: "ready"; score: number }
    | { auditId: string; kind: "inaccessible" | "incomplete" | "error" | "incompatible" }
    | null
  >(null)

  useEffect(() => {
    if (!auditId) return
    let active = true
    const controller = new AbortController()

    void getAudit(auditId, controller.signal)
      .then((audit) => {
        if (!active) return
        assertSupportedAuditVersion(audit)
        if (audit.status !== "completed") {
          setResult({ auditId, kind: "incomplete" })
          return
        }

        const answers = answersFromAudit(audit)
        setResult({
          auditId,
          kind: "ready",
          score: calculateVersionedAuditScore(audit, answers),
        })
      })
      .catch((loadError: unknown) => {
        if (!active) return
        setResult({
          auditId,
          kind:
            loadError instanceof AuditApiError &&
              (loadError.status === 404 || loadError.code === "INVALID_AUDIT_ID")
              ? "inaccessible"
              : loadError instanceof UnsupportedAuditVersionError ||
                  (loadError instanceof AuditApiError && loadError.code === "AUDIT_VERSION_UNSUPPORTED")
                ? "incompatible"
              : "error",
        })
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [auditId, auth.accountAuditsRevision])

  const handleTutorialClick = (href: string) => {
    const destination = internalAuthHref(href)
    if (!destination) return
    if (auth.isLoggedIn) {
      router.push(destination)
      return
    }
    onOpenAuth(destination)
  }

  const handleOpenSignup = () => {
    onOpenAuth("/compte")
  }

  if (!auditId || !result || result.auditId !== auditId || result.kind !== "ready") {
    const kind = !auditId
      ? "missing"
      : result?.auditId !== auditId
        ? "loading"
        : result.kind
    const message =
      kind === "loading"
        ? "Chargement des résultats…"
        : kind === "incomplete"
          ? "Cet audit n'est pas encore terminé."
          : kind === "inaccessible"
            ? "Cet audit est introuvable ou inaccessible."
            : kind === "incompatible"
              ? "La version de cet audit n'est pas prise en charge. Ses réponses sont conservées."
            : kind === "missing"
              ? "Aucun audit à afficher."
              : "Les résultats n'ont pas pu être chargés."

    return (
      <PageShell>
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center gap-4 px-4 text-center">
          <p role={kind === "loading" ? "status" : "alert"}>{message}</p>
          {kind === "incomplete" && (
            <ScButton
              onClick={() =>
                router.push(`/audit?auditId=${encodeURIComponent(auditId!)}`)
              }
            >
              Reprendre l&apos;audit
            </ScButton>
          )}
          {(kind === "missing" || kind === "inaccessible") && (
            <ScButton onClick={() => router.push("/audit")}>
              Commencer un audit
            </ScButton>
          )}
          {kind === "error" && (
            <ScButton onClick={() => window.location.reload()}>Réessayer</ScButton>
          )}
        </main>
        <Footer />
      </PageShell>
    )
  }

  const score = result.score
  const level = getResultLevel(score)
  const recommendationResolution = getScoreRecommendationsForLevel(level)
  const scoreRecommendations = recommendationResolution.recommendations

  return (
    <PageShell>
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 md:py-12 flex flex-col gap-6">
        {process.env.NODE_ENV === "development" &&
          recommendationResolution.missingIds.length > 0 && (
            <aside
              role="status"
              className="rounded-lg border border-[color:var(--sc-warn-border)] bg-[color:var(--sc-warn-soft)] px-4 py-3 text-sm text-[color:var(--sc-warn-text)]"
            >
              Configuration Résultats incomplète : recommandations introuvables (
              {recommendationResolution.missingIds.join(", ")}).
            </aside>
          )}
        <ResultsScoreHero
          score={score}
          level={level}
          riskStyle={level.riskStyle}
          riskLabel={level.riskLabel}
          t={t}
        />
        <ResultsSummary score={score} level={level} />
        <ResultsActionPlan
          recommendations={scoreRecommendations}
          lang={lang}
          t={t}
          onTutorialClick={handleTutorialClick}
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
