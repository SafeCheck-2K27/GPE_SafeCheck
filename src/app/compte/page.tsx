"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import type {
  AccountForm,
  AccountTabId,
  NotificationPreferences,
} from "@/features/account/types"
import { mockUser } from "@/lib/account-data"

const accountTabIds: AccountTabId[] = [
  "dashboard",
  "historique",
  "profil",
  "preferences",
]

function getAccountTab(tab: string | null): AccountTabId {
  return accountTabIds.includes(tab as AccountTabId)
    ? (tab as AccountTabId)
    : "dashboard"
}

function AccountTabSynchronizer({
  onTabChange,
}: {
  onTabChange: (tab: AccountTabId) => void
}) {
  const searchParams = useSearchParams()

  useEffect(() => {
    const requestedTab = getAccountTab(searchParams.get("tab"))
    queueMicrotask(() => onTabChange(requestedTab))
  }, [onTabChange, searchParams])

  return null
}

export default function MonComptePage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const auth = useAuth()

  const [activeTab, setActiveTab] = useState<AccountTabId>("dashboard")
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState<AccountForm>({
    ...mockUser,
    ...(auth.user
      ? {
          pseudo: auth.user.pseudo || mockUser.pseudo,
          email: auth.user.email || mockUser.email,
          prenom: auth.user.prenom || mockUser.prenom,
          nom: auth.user.nom || mockUser.nom,
          pays: auth.user.pays || mockUser.pays,
          age: auth.user.age || mockUser.age,
        }
      : {}),
  })
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
      setForm((previousForm) => ({
        ...previousForm,
        pseudo: user.pseudo || previousForm.pseudo,
        email: user.email || previousForm.email,
        prenom: user.prenom || previousForm.prenom,
        nom: user.nom || previousForm.nom,
        pays: user.pays || previousForm.pays,
        age: user.age || previousForm.age,
      }))
    })
  }, [auth.user])

  const deleteAccount = () => {
    auth.logout()
    router.push("/")
  }

  return (
    <PageShell>
      <Suspense fallback={null}>
        <AccountTabSynchronizer onTabChange={setActiveTab} />
      </Suspense>

      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-8">
        <AccountHero
          form={form}
          onAvatarClick={() => router.push("/wip?feature=avatar")}
        />

        <AccountTabs activeTab={activeTab} onTabChange={setActiveTab} />

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
