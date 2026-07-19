import Footer from "@/components/safecheck/Footer"
import Navbar from "@/components/safecheck/Navbar"
import { PageShell } from "@/components/safecheck/layout/PageShell"
import { AuditsCatalog } from "@/features/audits/components/AuditsCatalog"
import { AuditsHero } from "@/features/audits/components/AuditsHero"

export default function AuditsPage() {
  return (
    <PageShell className="bg-[color:var(--sc-surface)]">
      <Navbar signupHref="/compte/creer" />

      <main className="flex-1">
        <AuditsHero />
        <AuditsCatalog />
      </main>

      <Footer />
    </PageShell>
  )
}
