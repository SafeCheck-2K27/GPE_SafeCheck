import { Suspense } from "react"
import Footer from "@/components/safecheck/Footer"
import Navbar from "@/components/safecheck/Navbar"
import { PageShell } from "@/components/safecheck/layout/PageShell"
import { PageSuspenseFallback } from "@/components/safecheck/layout/PageSuspenseFallback"
import { EssentialsCatalog } from "@/features/essentials/components/EssentialsCatalog"
import { EssentialsHero } from "@/features/essentials/components/EssentialsHero"

export default function EssentielsPage() {
  return (
    <Suspense fallback={<PageSuspenseFallback />}>
      <EssentielsPageContent />
    </Suspense>
  )
}

function EssentielsPageContent() {
  return (
    <PageShell className="bg-[color:var(--sc-surface)]">
      <Navbar signupHref="/compte/creer" />

      <main className="flex-1">
        <EssentialsHero />
        <EssentialsCatalog />
      </main>

      <Footer />
    </PageShell>
  )
}
