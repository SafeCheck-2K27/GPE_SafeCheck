import Navbar from "@/components/safecheck/Navbar"
import { ScBadge } from "@/components/safecheck/primitives"
import Footer from "@/components/safecheck/Footer"
import { PageShell } from "@/components/safecheck/layout/PageShell"
import { Award, Brain, BookOpen, Coins, Sparkles } from "lucide-react"
import { ContributorCard } from "./_components/ContributorCard"
import { CONTRIBUTORS } from "./_data"

const CATEGORIES = [
  { icon: Brain, label: "Connaissances & expertise" },
  { icon: BookOpen, label: "Tutos & relecture" },
  { icon: Sparkles, label: "Idées & roadmap" },
  { icon: Coins, label: "Dons & soutien" },
]

export default function HallOfFamePage() {
  return (
    <PageShell className="bg-[color:var(--sc-surface)]">
      <Navbar signupHref="/compte/creer" />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-[color:var(--sc-bg-soft)] border-b border-[color:var(--sc-border)]">
          <div className="max-w-5xl mx-auto px-4 py-12 md:py-16 text-center">
            <ScBadge tone="info" className="mb-4">
              <Award className="w-3 h-3" />
              Hall of Fame · Démonstration
            </ScBadge>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[color:var(--sc-text)] mb-4 text-balance">
              Aperçu des profils de contribution.
            </h1>
            <p className="text-base md:text-lg text-[color:var(--sc-text)] max-w-3xl mx-auto leading-relaxed text-pretty">
              Cette maquette présente des profils fictifs pour illustrer différents types de contribution.
              Les noms, biographies et contributions ci-dessous sont des exemples de démonstration.
            </p>

            {/* Categories */}
            <div className="mt-8 flex flex-wrap gap-2 justify-center">
              {CATEGORIES.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[color:var(--sc-surface)] border border-[color:var(--sc-border)] text-[color:var(--sc-text)] font-medium"
                >
                  <Icon className="w-3.5 h-3.5 text-[color:var(--sc-blue)]" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Contributors grid */}
        <section className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {CONTRIBUTORS.map((contributor, idx) => (
              <ContributorCard key={contributor.name} contributor={contributor} delay={idx * 60} />
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </PageShell>
  )
}
