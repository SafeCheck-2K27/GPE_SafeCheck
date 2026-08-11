"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/safecheck/Navbar"
import Footer from "@/components/safecheck/Footer"
import { useAuth } from "@/components/safecheck/AuthProvider"
import { PreHomeHero } from "@/features/home/components/PreHomeHero"
import {
  AuditBenefitsSection,
  PreHomeFinalCta,
  ReassuranceBand,
} from "@/features/home/components/PreHomeSections"
import { PreHomeLoginModal } from "@/features/home/components/PreHomeLoginModal"
import { PageShell } from "@/components/safecheck/layout/PageShell"

export default function PreHomePage() {
  const router = useRouter()
  const auth = useAuth()
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    if (auth.isHydrated && auth.isLoggedIn) {
      router.replace("/accueil")
    }
  }, [auth.isHydrated, auth.isLoggedIn, router])

  const startAudit = () => router.push("/audit")
  const explorePlatform = () => router.push("/accueil")

  return (
    <PageShell>
      <Navbar
        onLoginClick={() => setShowLogin(true)}
        onSignupClick={() => router.push("/compte/creer")}
      />

      <main className="flex-1">
        <PreHomeHero
          onStartAudit={startAudit}
          onLogin={() => setShowLogin(true)}
          onExplore={explorePlatform}
        />
        <AuditBenefitsSection />
        <ReassuranceBand />
        <PreHomeFinalCta onStartAudit={startAudit} onExplore={explorePlatform} />
      </main>

      <Footer />

      {showLogin && (
        <PreHomeLoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={async (email, password) => {
            await auth.login(email, password)
            setShowLogin(false)
            router.push("/accueil")
          }}
        />
      )}
    </PageShell>
  )
}
