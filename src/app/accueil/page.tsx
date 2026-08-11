"use client"

import { useRouter } from "next/navigation"
import Navbar from "@/components/safecheck/Navbar"
import Footer from "@/components/safecheck/Footer"
import { useAuth } from "@/components/safecheck/AuthProvider"
import { AccueilHero } from "@/features/home/components/AccueilHero"
import { AccueilJourney } from "@/features/home/components/AccueilJourney"
import { AccueilDiscovery } from "@/features/home/components/AccueilDiscovery"
import { AccueilAccountBanner } from "@/features/home/components/AccueilAccountBanner"
import { AccueilTestimonials } from "@/features/home/components/AccueilTestimonials"
import { PageShell } from "@/components/safecheck/layout/PageShell"

export default function AccueilPage() {
  const router = useRouter()
  const { isLoggedIn, user, isHydrated } = useAuth()

  return (
    <PageShell>
      <Navbar />

      <main className="flex-1">
        <AccueilHero
          onStartAudit={() => router.push("/audit")}
          onViewAudits={() => router.push("/audits")}
        />
        <AccueilJourney
          onStartAudit={() => router.push("/audit")}
          onViewTutorials={() => router.push("/tutoriels")}
        />
        <AccueilDiscovery
          onSearch={(query) =>
            router.push(`/essentiels?q=${encodeURIComponent(query)}`)
          }
          onNavigate={(href) => router.push(href)}
        />
        {isHydrated && (
          <AccueilAccountBanner
            isLoggedIn={isLoggedIn}
            firstName={user?.prenom}
            onDashboard={() => router.push("/compte")}
            onProfile={() => router.push("/compte")}
            onSignup={() => router.push("/compte/creer")}
          />
        )}
        <AccueilTestimonials />
      </main>

      <Footer />
    </PageShell>
  )
}
