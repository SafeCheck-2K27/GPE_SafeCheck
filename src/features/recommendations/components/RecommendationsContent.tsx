"use client"

import { useRouter, useSearchParams } from "next/navigation"
import Footer from "@/components/safecheck/Footer"
import Navbar from "@/components/safecheck/Navbar"
import type { RecommendationView } from "../types"
import { HabitsView } from "./HabitsView"
import { RecommendationsHub } from "./RecommendationsHub"
import { TechnicalRecommendationsView } from "./TechnicalRecommendationsView"

export function RecommendationsContent() {
  const router = useRouter()
  const params = useSearchParams()
  const typeParam = params.get("type")

  // Keep the URL as the source of truth so direct links and navbar navigation agree.
  const view: RecommendationView =
    typeParam === "habitudes"
      ? "habitudes"
      : typeParam === "techniques"
        ? "techniques"
        : "hub"

  const setView = (nextView: Exclude<RecommendationView, "hub">) => {
    router.push(`/recommandations?type=${nextView}`)
  }

  const goHub = () => {
    router.push("/recommandations")
  }

  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--sc-surface)] font-sans">
      <Navbar onSignupClick={() => router.push("/compte/creer")} />

      <main className="flex-1">
        {view === "hub" && <RecommendationsHub onSelect={setView} />}
        {view === "habitudes" && <HabitsView onBack={goHub} />}
        {view === "techniques" && (
          <TechnicalRecommendationsView
            onBack={goHub}
            initialCat={params.get("cat")}
          />
        )}
      </main>

      <Footer />
    </div>
  )
}
