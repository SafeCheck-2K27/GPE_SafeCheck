"use client"

import Link from "next/link"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Wrench } from "lucide-react"
import Navbar from "@/components/safecheck/Navbar"
import { ScBadge } from "@/components/safecheck/primitives"
import Footer from "@/components/safecheck/Footer"
import { PageSuspenseFallback } from "@/components/safecheck/layout/PageSuspenseFallback"
import { PageShell } from "@/components/safecheck/layout/PageShell"
import { ConstructionScene } from "./_components/ConstructionScene"
import { WipActions } from "./_components/WipActions"
import { WipReassurance } from "./_components/WipReassurance"
import { getWipFeature } from "./_data"

function WipContent() {
  const params = useSearchParams()
  const meta = getWipFeature(params.get("feature") ?? "")

  return (
    <PageShell className="bg-[color:var(--sc-surface)]">
      <Navbar signupHref="/compte/creer" />

      <main className="flex-1 px-4 py-10 md:py-16">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-2xl p-8 md:p-12 text-center sc-fade-in overflow-hidden border border-[color:var(--sc-border)] sc-mesh-soft shadow-[var(--sc-shadow-md)]">
            <div
              className="pointer-events-none absolute left-1/2 top-24 -translate-x-1/2 w-[420px] h-[260px] sc-halo opacity-40"
              aria-hidden
            />
            <div className="pointer-events-none absolute inset-0 sc-dot-texture opacity-60" aria-hidden />

            <div className="relative inline-flex items-center justify-center mb-6">
              <ConstructionScene />
            </div>

            <ScBadge tone="warn" className="relative mb-3">
              <Wrench className="w-3 h-3" />
              Chantier en cours
            </ScBadge>

            <h1 className="relative font-display text-2xl md:text-4xl font-bold text-[color:var(--sc-text)] mb-3 text-balance">
              {meta.title}
            </h1>
            <p className="relative text-sm md:text-base text-[color:var(--sc-text-2)] max-w-xl mx-auto leading-relaxed text-pretty">
              {meta.subtitle}
            </p>

            <WipActions />
          </div>

          <WipReassurance />

          <p className="text-center text-xs text-[color:var(--sc-text-muted)] mt-6">
            Pendant que nous construisons, explorez l'
            <Link href="/audit" className="text-[color:var(--sc-blue)] underline hover:no-underline">
              audit de qualification
            </Link>{" "}
            ou les{" "}
            <Link href="/essentiels" className="text-[color:var(--sc-blue)] underline hover:no-underline">
              essentiels
            </Link>
            .
          </p>
        </div>
      </main>

      <Footer />
    </PageShell>
  )
}

export default function WipPage() {
  return (
    <Suspense fallback={<PageSuspenseFallback />}>
      <WipContent />
    </Suspense>
  )
}
