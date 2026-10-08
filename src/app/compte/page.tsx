"use client"

import { Suspense, useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTheme } from "next-themes"
import { useAuth } from "@/components/safecheck/AuthProvider"
import Footer from "@/components/safecheck/Footer"
import Navbar from "@/components/safecheck/Navbar"
import { PageShell } from "@/components/safecheck/layout/PageShell"
import { ScButton } from "@/components/safecheck/primitives"
import { AccountDashboard } from "@/features/account/components/AccountDashboard"
import { AccountHero } from "@/features/account/components/AccountHero"
import { AccountHistory } from "@/features/account/components/AccountHistory"
import { AccountPreferences } from "@/features/account/components/AccountPreferences"
import { AccountProfile } from "@/features/account/components/AccountProfile"
import { AccountTabs } from "@/features/account/components/AccountTabs"
import { AccountTutorials } from "@/features/account/components/AccountTutorials"
import { type AccountTutorial } from "@/features/account/tutorial-summary"
import { loadAccountTutorials } from "@/features/account/tutorial-loading"
import { getTutorialProgressSnapshots } from "@/features/tutorials/api"
import { tutorialSaveQueue } from "@/features/tutorials/transport"
import { listAccountAudits, type AccountAudit } from "@/features/account/api"
import { getAccountSessionView } from "./_session-state"
import {
  getAccountTab,
  getAccountTabHref,
  isAccountTabId,
} from "@/features/account/tabs"

export default function MonComptePage() {
  const router = useRouter()
  const auth = useAuth()
  const sessionView = getAccountSessionView({
    isHydrated: auth.isHydrated,
    sessionError: auth.sessionError,
    authChanging: auth.authChanging,
    isLoggedIn: auth.isLoggedIn,
    hasUser: auth.user !== null,
  })

  useEffect(() => {
    if (sessionView === "guest") router.replace("/")
  }, [router, sessionView])

  const sessionKey = sessionView === "authenticated" ? auth.user?.id ?? "pending" : "pending"

  let accountContent
  if (sessionView === "error") {
    accountContent = (
      <main className="flex-1 flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p role="alert" className="text-[color:var(--sc-text)]">La session n’a pas pu être vérifiée.</p>
        <ScButton disabled={auth.authChanging} onClick={() => void auth.retrySession()}>
          {auth.authChanging ? "Vérification…" : "Réessayer"}
        </ScButton>
      </main>
    )
  } else if (sessionView === "loading") {
    accountContent = (
      <main className="flex-1 flex items-center justify-center px-4" role="status" aria-live="polite">
        <span className="text-sm text-[color:var(--sc-text-muted)]">Chargement du compte…</span>
      </main>
    )
  } else if (sessionView === "authenticated" && auth.user) {
    accountContent = <AccountPageContent key={sessionKey} />
  } else {
    accountContent = <main className="flex-1" aria-hidden="true" />
  }

  return (
    <PageShell>
      <Navbar />

      <Suspense
        fallback={
          <main className="flex-1 flex items-center justify-center px-4" role="status" aria-live="polite">
            <span className="text-sm text-[color:var(--sc-text-muted)]">Chargement du compte…</span>
          </main>
        }
      >
        {accountContent}
      </Suspense>

      <Footer />
    </PageShell>
  )
}

function AccountPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { theme, setTheme } = useTheme()
  const auth = useAuth()
  const queryString = searchParams.toString()
  const tabParam = searchParams.get("tab")
  const activeTab = getAccountTab(tabParam)

  const [audits, setAudits] = useState<AccountAudit[] | null>(null)
  const [auditError, setAuditError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const [tutorials, setTutorials] = useState<AccountTutorial[] | null>(null)
  const [tutorialError, setTutorialError] = useState(false)
  const [tutorialSaveError, setTutorialSaveError] = useState(false)
  const [tutorialRetryKey, setTutorialRetryKey] = useState(0)
  const userId = auth.user?.id

  useEffect(() => {
    if (!userId) return
    const controller = new AbortController()
    async function loadTutorials() {
      const result = await loadAccountTutorials(tutorialSaveQueue(userId!), getTutorialProgressSnapshots,
        controller.signal, tutorialRetryKey > 0)
      if (controller.signal.aborted || result.kind === "cancelled") return
      setTutorialSaveError(result.kind === "save-error")
      setTutorialError(false)
      setTutorials(result.kind === "ready" ? result.items : null)
    }
    void loadTutorials().catch(() => {
      if (!controller.signal.aborted) setTutorialError(true)
    })
    return () => controller.abort()
  }, [tutorialRetryKey, userId])

  useEffect(() => {
    const controller = new AbortController()
    listAccountAudits(controller.signal)
      .then((items) => {
        if (controller.signal.aborted) return
        setAudits(items)
        setAuditError(false)
      })
      .catch(() => {
        if (!controller.signal.aborted) setAuditError(true)
      })
    return () => controller.abort()
  }, [retryKey, auth.accountAuditsRevision])

  useEffect(() => {
    if (tabParam !== null && !isAccountTabId(tabParam)) {
      router.replace(getAccountTabHref(pathname, queryString, activeTab), {
        scroll: false,
      })
    }
  }, [activeTab, pathname, queryString, router, tabParam])

  const retryAudits = () => {
    setAudits(null)
    setAuditError(false)
    setRetryKey((key) => key + 1)
  }

  return (
    <>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-8">
        {auth.user && <AccountHero user={auth.user} audits={audits} />}

        <AccountTabs
          activeTab={activeTab}
          pathname={pathname}
          queryString={queryString}
        />

        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <AccountDashboard audits={audits} error={auditError} onRetry={retryAudits} />
            <AccountTutorials items={tutorials} error={tutorialError} saveError={tutorialSaveError} onRetry={() => {
              setTutorials(null)
              setTutorialError(false)
              setTutorialSaveError(false)
              setTutorialRetryKey((key) => key + 1)
            }} />
          </div>
        )}

        {activeTab === "historique" && (
          <AccountHistory audits={audits} error={auditError} onRetry={retryAudits} />
        )}

        {activeTab === "profil" && auth.user && <AccountProfile user={auth.user} />}

        {activeTab === "preferences" && (
          <AccountPreferences
            theme={theme}
            setTheme={setTheme}
          />
        )}
      </main>
    </>
  )
}
