"use client"

import { Suspense, useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTheme } from "next-themes"
import { useAuth } from "@/components/safecheck/AuthProvider"
import Footer from "@/components/safecheck/Footer"
import Navbar from "@/components/safecheck/Navbar"
import { PageShell } from "@/components/safecheck/layout/PageShell"
import { AccountDashboard } from "@/features/account/components/AccountDashboard"
import { AccountDeleteModal } from "@/features/account/components/AccountDeleteModal"
import { AccountHero } from "@/features/account/components/AccountHero"
import { AccountHistory } from "@/features/account/components/AccountHistory"
import { AccountPreferences } from "@/features/account/components/AccountPreferences"
import { AccountProfile } from "@/features/account/components/AccountProfile"
import { AccountTabs } from "@/features/account/components/AccountTabs"
import { createInitialAccountForm } from "@/features/account/profile-form"
import {
  getAccountTab,
  getAccountTabHref,
  isAccountTabId,
} from "@/features/account/tabs"
import type {
  AccountForm,
  AccountTabId,
  NotificationPreferences,
} from "@/features/account/types"

export default function MonComptePage() {
  const router = useRouter()
  const auth = useAuth()

  useEffect(() => {
    if (auth.isHydrated && !auth.isLoggedIn) {
      router.replace("/")
    }
  }, [auth.isHydrated, auth.isLoggedIn, router])

  const sessionKey = auth.isHydrated
    ? auth.user?.email ?? "guest"
    : "pending"

  return (
    <PageShell>
      <Navbar />

      <Suspense
        fallback={
          <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-8" />
        }
      >
        <AccountPageContent key={sessionKey} />
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

  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState<AccountForm>(() =>
    createInitialAccountForm(auth.user),
  )
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [notifs, setNotifs] = useState<NotificationPreferences>({
    alertesSecurite: true,
    actualitesCyber: true,
    progressionRappels: false,
    nouveautesProduit: true,
    emailHebdo: false,
  })

  useEffect(() => {
    if (tabParam !== null && !isAccountTabId(tabParam)) {
      router.replace(getAccountTabHref(pathname, queryString, activeTab), {
        scroll: false,
      })
    }
  }, [activeTab, pathname, queryString, router, tabParam])

  const deleteAccount = () => {
    auth.logout()
    router.push("/")
  }

  const handleTabChange = (tab: AccountTabId) => {
    if (tab === activeTab) return
    window.history.pushState(
      null,
      "",
      getAccountTabHref(pathname, queryString, tab),
    )
  }

  return (
    <>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-8">
        <AccountHero
          form={form}
          onAvatarClick={() => router.push("/wip?feature=avatar")}
        />

        <AccountTabs activeTab={activeTab} onTabChange={handleTabChange} />

        {activeTab === "dashboard" && <AccountDashboard form={form} />}

        {activeTab === "historique" && <AccountHistory />}

        {activeTab === "profil" && (
          <AccountProfile
            form={form}
            setForm={setForm}
            editMode={editMode}
            setEditMode={setEditMode}
            showPasswordChange={showPasswordChange}
            setShowPasswordChange={setShowPasswordChange}
            onDeleteRequest={() => setShowDeleteConfirm(true)}
          />
        )}

        {activeTab === "preferences" && (
          <AccountPreferences
            theme={theme}
            setTheme={setTheme}
            notifs={notifs}
            setNotifs={setNotifs}
            langue={form.langue}
          />
        )}
      </main>

      {showDeleteConfirm && (
        <AccountDeleteModal
          onConfirm={deleteAccount}
          onClose={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  )
}
