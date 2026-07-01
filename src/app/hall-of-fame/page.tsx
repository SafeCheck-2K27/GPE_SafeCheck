"use client"

import { useRouter } from "next/navigation"
import Navbar from "@/components/safecheck/Navbar"
import { ScButton, ScBadge } from "@/components/safecheck/primitives"
import Footer from "@/components/safecheck/Footer"
import { Heart, Award, Brain, BookOpen, Coins, Sparkles, Send } from "lucide-react"

/* Brand icons were removed from lucide-react core, so we keep small inline
   SVGs here to preserve the exact GitHub / LinkedIn look. */
function Github({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.92 1.23 3.23 0 4.62-2.8 5.64-5.48 5.94.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.21.7.82.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z" />
    </svg>
  )
}
function Linkedin({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  )
}

interface Contributor {
  name: string
  role: string
  bio: string
  contribution: string[]
  github?: string
  linkedin?: string
  initials: string
  accent: string
}

const CONTRIBUTORS: Contributor[] = [
  {
    name: "Élise Marchand",
    role: "Pentester · Conseil cybersécurité",
    bio: "Auteure des fiches mots de passe et 2FA, relectrice technique des essentiels.",
    contribution: ["Tutos", "Relecture", "Expertise"],
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    initials: "EM",
    accent: "#157FE2",
  },
  {
    name: "Karim Benali",
    role: "DevSecOps · Open source",
    bio: "Contributeur sur les recommandations OS et navigateurs, mainteneur de la base de connaissances.",
    contribution: ["Recommandations", "OSS"],
    github: "https://github.com",
    initials: "KB",
    accent: "#0F766E",
  },
  {
    name: "Maëlle Tournier",
    role: "Designer produit",
    bio: "Direction artistique de la maquette, charte graphique SafeCheck et système de composants.",
    contribution: ["Design", "UX"],
    linkedin: "https://linkedin.com",
    initials: "MT",
    accent: "#9A3412",
  },
  {
    name: "Lucas Petit",
    role: "Lead pédagogie",
    bio: "Conception du parcours d'audit de qualification et des progressions par niveau (Petit Scarabée à Sentinelle).",
    contribution: ["Pédagogie", "Audit"],
    linkedin: "https://linkedin.com",
    initials: "LP",
    accent: "#7C3AED",
  },
  {
    name: "Sofia Reyes",
    role: "Journaliste tech",
    bio: "Rédige la section Culture cyber et les débunks d'arnaques courantes en s'appuyant sur des sources publiques.",
    contribution: ["Culture cyber", "Débunk"],
    github: "https://github.com",
    initials: "SR",
    accent: "#0EA5E9",
  },
  {
    name: "Thomas Lavigne",
    role: "Mécène & soutien",
    bio: "A financé l'illustration mascotte et le développement du module d'audit standard.",
    contribution: ["Don financier"],
    initials: "TL",
    accent: "#B45309",
  },
  {
    name: "Jin-Wo Park",
    role: "Chercheur & analyste",
    bio: "Expertise sur le test de vulnérabilité et les corrélations entre profils utilisateurs et menaces.",
    contribution: ["Recherche", "Idées"],
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    initials: "JP",
    accent: "#DC2626",
  },
  {
    name: "Amina Diallo",
    role: "Formatrice cybersécurité",
    bio: "A relu et structuré les essentiels destinés aux publics non techniques.",
    contribution: ["Pédagogie", "Relecture"],
    linkedin: "https://linkedin.com",
    initials: "AD",
    accent: "#0F766E",
  },
]

const CATEGORIES = [
  { icon: Brain, label: "Connaissances & expertise" },
  { icon: BookOpen, label: "Tutos & relecture" },
  { icon: Sparkles, label: "Idées & roadmap" },
  { icon: Coins, label: "Dons & soutien" },
]

export default function HallOfFamePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] font-sans">
      <Navbar onSignupClick={() => router.push("/compte/creer")} />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-[#C3E8FF] border-b border-[#B3DBEF]">
          <div className="max-w-5xl mx-auto px-4 py-12 md:py-16 text-center">
            <ScBadge tone="info" className="mb-4">
              <Award className="w-3 h-3" />
              Hall of Fame
            </ScBadge>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#000] mb-4 text-balance">
              Merci à toutes les personnes qui font vivre SafeCheck.
            </h1>
            <p className="text-base md:text-lg text-[#000]/80 max-w-3xl mx-auto leading-relaxed text-pretty">
              SafeCheck existe grâce à la contribution de pentesters, de formateurs, de designers, d'auteurs et de
              mécènes. Cette page est leur place d'honneur - ils ont donné de leur temps, de leur expertise ou de
              leurs ressources pour que la cybersécurité reste accessible à tous.
            </p>

            {/* Categories */}
            <div className="mt-8 flex flex-wrap gap-2 justify-center">
              {CATEGORIES.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[#FFFFFF] border border-[#B3DBEF] text-[#000] font-medium"
                >
                  <Icon className="w-3.5 h-3.5 text-[#157FE2]" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Contributors grid */}
        <section className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {CONTRIBUTORS.map((c, idx) => (
              <ContributorCard key={c.name} c={c} delay={idx * 60} />
            ))}
          </div>
        </section>

        {/* Call to action */}
        <section className="max-w-4xl mx-auto px-4 pb-14">
          <div
            className="rounded-xl p-6 md:p-8 bg-[#FFFFFF] text-center"
            style={{ border: "1px solid #B3DBEF", boxShadow: "4px 4px 0px #C0DDF8" }}
          >
            <Heart className="w-8 h-8 text-[#157FE2] mx-auto mb-3" />
            <h2 className="text-xl md:text-2xl font-extrabold text-[#000] mb-2">Vous voulez contribuer ?</h2>
            <p className="text-sm text-[#000]/75 max-w-xl mx-auto leading-relaxed mb-5">
              Tutoriels, relecture, traductions, illustrations, dons&nbsp;: toutes les bonnes volontés sont
              bienvenues. Écrivez-nous, nous mettons à jour cette page régulièrement.
            </p>
            <ScButton variant="primary" onClick={() => router.push("/wip?feature=qui-sommes-nous")}>
              <Send className="w-4 h-4 mr-1" />
              Nous contacter
            </ScButton>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function ContributorCard({ c, delay }: { c: Contributor; delay: number }) {
  return (
    <article
      className="rounded-xl p-5 bg-[#FFFFFF] flex flex-col gap-3 sc-fade-in transition-all hover:-translate-y-1"
      style={{
        animationDelay: `${delay}ms`,
        border: "1px solid #B3DBEF",
        boxShadow: "3px 3px 0px #C0DDF8",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-white shrink-0"
          style={{ background: `linear-gradient(135deg, ${c.accent}, ${c.accent}aa)` }}
          aria-hidden
        >
          {c.initials}
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-sm text-[#000] truncate">{c.name}</h3>
          <p className="text-xs text-[#000]/60 truncate">{c.role}</p>
        </div>
      </div>
      <p className="text-xs text-[#000]/75 leading-relaxed">{c.bio}</p>

      <div className="flex flex-wrap gap-1.5">
        {c.contribution.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center text-[10px] px-2 py-0.5 rounded bg-[#C3E8FF] text-[#0F4F8F] font-semibold"
          >
            {tag}
          </span>
        ))}
      </div>

      {(c.github || c.linkedin) && (
        <div className="flex items-center gap-2 pt-2 border-t border-[#AEAEAE]/30">
          {c.github && (
            <a
              href={c.github}
              target="_blank"
              rel="noreferrer noopener"
              className="p-1.5 rounded hover:bg-[#C3E8FF] transition-colors"
              aria-label={`GitHub de ${c.name}`}
            >
              <Github className="w-4 h-4 text-[#000]" />
            </a>
          )}
          {c.linkedin && (
            <a
              href={c.linkedin}
              target="_blank"
              rel="noreferrer noopener"
              className="p-1.5 rounded hover:bg-[#C3E8FF] transition-colors"
              aria-label={`LinkedIn de ${c.name}`}
            >
              <Linkedin className="w-4 h-4 text-[#157FE2]" />
            </a>
          )}
        </div>
      )}
    </article>
  )
}
