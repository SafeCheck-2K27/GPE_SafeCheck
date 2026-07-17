"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
import { AccountTabSynchronizer } from "@/features/account/components/AccountTabSynchronizer"
import { AccountTabs } from "@/features/account/components/AccountTabs"
import {
  createInitialAccountForm,
  mergeUserIntoAccountForm,
} from "@/features/account/profile-form"
import { getAccountTabHref } from "@/features/account/tabs"
import type {
  AccountForm,
  AccountTabId,
  NotificationPreferences,
} from "@/features/account/types"

export default function MonComptePage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const auth = useAuth()

  const [activeTab, setActiveTab] = useState<AccountTabId>("dashboard")
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState<AccountForm>(createInitialAccountForm)
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
    if (auth.isHydrated && !auth.isLoggedIn) {
      router.replace("/")
    }
  }, [auth.isHydrated, auth.isLoggedIn, router])

  useEffect(() => {
    if (!auth.user) return
    const user = auth.user

    queueMicrotask(() => {
      setForm((previousForm) => mergeUserIntoAccountForm(previousForm, user))
    })
  }, [auth.user])

  const deleteAccount = () => {
    auth.logout()
    router.push("/")
  }

  const handleTabChange = (tab: AccountTabId) => {
    if (tab === activeTab) return

    const queryString = window.location.search.slice(1)
    const href = getAccountTabHref(
      window.location.pathname,
      queryString,
      tab,
    )

    window.history.pushState(null, "", href)
    setActiveTab(tab)
  }

  return (
    <PageShell>
      <Suspense fallback={null}>
        <AccountTabSynchronizer
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </Suspense>

      <Navbar />

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

      <Footer />

      {showDeleteConfirm && (
        <AccountDeleteModal
          onConfirm={deleteAccount}
          onClose={() => setShowDeleteConfirm(false)}
        />
      )}
    </PageShell>
  )
}
