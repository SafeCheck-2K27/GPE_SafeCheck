import Navbar from "@/components/safecheck/Navbar"
import { ScLinkButton, ScBadge } from "@/components/safecheck/primitives"
import Footer from "@/components/safecheck/Footer"
import { PageShell } from "@/components/safecheck/layout/PageShell"
import { Heart, Award, Brain, BookOpen, Coins, Sparkles, Send } from "lucide-react"
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
              Hall of Fame
            </ScBadge>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[color:var(--sc-text)] mb-4 text-balance">
              Merci à toutes les personnes qui font vivre SafeCheck.
            </h1>
            <p className="text-base md:text-lg text-[color:var(--sc-text)] max-w-3xl mx-auto leading-relaxed text-pretty">
              SafeCheck existe grâce à la contribution de pentesters, de formateurs, de designers, d'auteurs et de
              mécènes. Cette page est leur place d'honneur - ils ont donné de leur temps, de leur expertise ou de
              leurs ressources pour que la cybersécurité reste accessible à tous.
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

        {/* Call to action */}
        <section className="max-w-4xl mx-auto px-4 pb-14">
          <div
            className="rounded-xl p-6 md:p-8 bg-[color:var(--sc-surface)] text-center"
            style={{ border: "1px solid var(--sc-border)", boxShadow: "var(--sc-shadow-md)" }}
          >
            <Heart className="w-8 h-8 text-[color:var(--sc-blue)] mx-auto mb-3" />
            <h2 className="text-xl md:text-2xl font-extrabold text-[color:var(--sc-text)] mb-2">Vous voulez contribuer ?</h2>
            <p className="text-sm text-[color:var(--sc-text-2)] max-w-xl mx-auto leading-relaxed mb-5">
              Tutoriels, relecture, traductions, illustrations, dons&nbsp;: toutes les bonnes volontés sont
              bienvenues. Écrivez-nous, nous mettons à jour cette page régulièrement.
            </p>
            <ScLinkButton variant="primary" href="/wip?feature=qui-sommes-nous">
              <Send className="w-4 h-4 mr-1" />
              Nous contacter
            </ScLinkButton>
          </div>
        </section>
      </main>

      <Footer />
    </PageShell>
  )
}
