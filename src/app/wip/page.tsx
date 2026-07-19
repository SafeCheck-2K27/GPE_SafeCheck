"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Navbar from "@/components/safecheck/Navbar"
import { ScButton, ScBadge } from "@/components/safecheck/primitives"
import Footer from "@/components/safecheck/Footer"
import { PageSuspenseFallback } from "@/components/safecheck/layout/PageSuspenseFallback"
import { PageShell } from "@/components/safecheck/layout/PageShell"
import { ArrowLeft, Bell, Hammer, HardHat, Wrench, Cone, CheckCircle2 } from "lucide-react"

const FEATURE_LABELS: Record<string, { title: string; subtitle: string }> = {
  "audit-standard": {
    title: "Audit standard de sécurité",
    subtitle: "Un audit complet de 30 à 45 minutes couvrant système, réseau, mots de passe, sauvegardes et habitudes.",
  },
  "audit-complet": {
    title: "Audit complet",
    subtitle: "Diagnostic large par domaine : OS, réseau, données, confidentialité, hygiène numérique.",
  },
  "audit-expert": {
    title: "Audit expert",
    subtitle: "Audit approfondi de 4 à 5 heures avec manipulations détaillées, pour les utilisateurs très engagés.",
  },
  simulations: {
    title: "Simulations, CTF & jeux",
    subtitle: "Espace ludique pour mettre en pratique vos réflexes : phishing simulé, mini-CTF, défis interactifs.",
  },
  "culture-cyber": {
    title: "Culture cyber",
    subtitle: "Articles, débunks et actualités pour comprendre les menaces et les enjeux du numérique.",
  },
  "test-vulnerabilite": {
    title: "Test de vulnérabilité",
    subtitle: "Estimation personnalisée de votre exposition aux principales menaces, basée sur des rapports officiels.",
  },
  "qui-sommes-nous": {
    title: "Qui sommes-nous ?",
    subtitle: "La présentation de l'équipe et de la mission SafeCheck arrive très vite.",
  },
  "patch-notes": {
    title: "Notes de mise à jour",
    subtitle: "L'historique détaillé des évolutions de la plateforme sera bientôt disponible ici.",
  },
  legal: {
    title: "Pages légales",
    subtitle: "Mentions légales, CGU, politique de cookies et accessibilité - pages en cours de rédaction.",
  },
}

function WipContent() {
  const router = useRouter()
  const params = useSearchParams()
  const feature = params.get("feature") ?? ""
  const meta = FEATURE_LABELS[feature] ?? {
    title: "Fonctionnalité en cours de construction",
    subtitle: "Cette section arrive bientôt. Notre équipe y travaille activement.",
  }

  const [notified, setNotified] = useState(false)

  return (
    <PageShell className="bg-[color:var(--sc-surface)]">
      <Navbar onSignupClick={() => router.push("/compte/creer")} />

      <main className="flex-1 px-4 py-10 md:py-16">
        <div className="max-w-3xl mx-auto">
          {/* Hero card - premium glass + mesh (V2) */}
          <div className="relative rounded-2xl p-8 md:p-12 text-center sc-fade-in overflow-hidden border border-[color:var(--sc-border)] sc-mesh-soft shadow-[var(--sc-shadow-md)]">
            {/* Soft halo behind the illustration */}
            <div
              className="pointer-events-none absolute left-1/2 top-24 -translate-x-1/2 w-[420px] h-[260px] sc-halo opacity-40"
              aria-hidden
            />
            {/* Faint dot texture for premium feel */}
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

            <div className="relative mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center">
              <ScButton variant="secondary" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Retour
              </ScButton>
              {notified ? (
                <ScButton variant="primary" disabled>
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Vous serez prévenu·e
                </ScButton>
              ) : (
                <ScButton variant="primary" onClick={() => setNotified(true)}>
                  <Bell className="w-4 h-4 mr-1" />
                  M&apos;avertir au lancement
                </ScButton>
              )}
            </div>
          </div>

          {/* Reassurance row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            <ReassureCard
              icon={<HardHat className="w-5 h-5 text-[color:var(--sc-blue)]" />}
              title="Conçu sérieusement"
              text="Cette fonctionnalité est priorisée sur la roadmap produit."
            />
            <ReassureCard
              icon={<Hammer className="w-5 h-5 text-[color:var(--sc-blue)]" />}
              title="Bientôt disponible"
              text="Une version beta sera ouverte aux comptes inscrits en premier."
            />
            <ReassureCard
              icon={<Cone className="w-5 h-5 text-[color:var(--sc-blue)]" />}
              title="Pas de blocage"
              text="Vous pouvez continuer à utiliser tout le reste du site sans interruption."
            />
          </div>

          <p className="text-center text-xs text-[color:var(--sc-text-muted)] mt-6">
            Pendant que nous construisons, explorez l'<button onClick={() => router.push("/audit")} className="text-[color:var(--sc-blue)] underline hover:no-underline">audit de qualification</button>{" "}
            ou les <button onClick={() => router.push("/essentiels")} className="text-[color:var(--sc-blue)] underline hover:no-underline">essentiels</button>.
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

function ReassureCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="sc-tile rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="font-semibold text-sm text-[color:var(--sc-text)]">{title}</span>
      </div>
      <p className="text-xs text-[color:var(--sc-text-2)] leading-relaxed">{text}</p>
    </div>
  )
}

/* Hand-drawn-style construction illustration using inline SVG */
function ConstructionScene() {
  return (
    <svg
      viewBox="0 0 240 200"
      className="w-48 h-48 md:w-56 md:h-56 relative"
      aria-hidden="true"
    >
      {/* Ground */}
      <ellipse cx="120" cy="180" rx="100" ry="8" fill="var(--sc-illustration-ink)" opacity="0.08" />
      {/* Worker body */}
      <g>
        {/* Helmet */}
        <path d="M 90 70 Q 90 50, 120 50 Q 150 50, 150 70 L 150 78 L 90 78 Z" fill="var(--sc-warn)" stroke="var(--sc-illustration-ink)" strokeWidth="2" />
        <rect x="88" y="76" width="64" height="4" fill="var(--sc-illustration-ink)" />
        <circle cx="120" cy="60" r="2.5" fill="var(--sc-illustration-ink)" />
        {/* Face */}
        <circle cx="120" cy="92" r="14" fill="var(--sc-illustration-skin)" stroke="var(--sc-illustration-ink)" strokeWidth="2" />
        <circle cx="115" cy="90" r="1.5" fill="var(--sc-illustration-ink)" />
        <circle cx="125" cy="90" r="1.5" fill="var(--sc-illustration-ink)" />
        <path d="M 115 96 Q 120 99, 125 96" stroke="var(--sc-illustration-ink)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Body / vest */}
        <path d="M 95 108 L 145 108 L 150 160 L 90 160 Z" fill="var(--sc-blue)" stroke="var(--sc-illustration-ink)" strokeWidth="2" />
        <rect x="100" y="124" width="40" height="3" fill="var(--sc-illustration-yellow)" />
        <rect x="100" y="135" width="40" height="3" fill="var(--sc-illustration-yellow)" />
        {/* Arms */}
        <path d="M 95 110 L 70 140 L 76 148 L 100 122 Z" fill="var(--sc-blue)" stroke="var(--sc-illustration-ink)" strokeWidth="2" />
        <path d="M 145 110 L 175 138 L 168 145 L 142 122 Z" fill="var(--sc-blue)" stroke="var(--sc-illustration-ink)" strokeWidth="2" />
        {/* Hands */}
        <circle cx="73" cy="144" r="5" fill="var(--sc-illustration-skin)" stroke="var(--sc-illustration-ink)" strokeWidth="1.5" />
        <circle cx="172" cy="142" r="5" fill="var(--sc-illustration-skin)" stroke="var(--sc-illustration-ink)" strokeWidth="1.5" />
        {/* Shovel */}
        <line x1="172" y1="142" x2="200" y2="100" stroke="var(--sc-illustration-ink)" strokeWidth="3" strokeLinecap="round" />
        <path d="M 195 95 L 215 80 L 210 105 L 200 110 Z" fill="var(--sc-illustration-shovel)" stroke="var(--sc-illustration-ink)" strokeWidth="2" />
        {/* Legs */}
        <rect x="100" y="158" width="14" height="20" fill="var(--sc-blue-deep)" stroke="var(--sc-illustration-ink)" strokeWidth="2" />
        <rect x="126" y="158" width="14" height="20" fill="var(--sc-blue-deep)" stroke="var(--sc-illustration-ink)" strokeWidth="2" />
        <rect x="98" y="176" width="18" height="5" fill="var(--sc-illustration-ink)" />
        <rect x="124" y="176" width="18" height="5" fill="var(--sc-illustration-ink)" />
      </g>
      {/* Bricks */}
      <g>
        <rect x="20" y="170" width="20" height="10" fill="var(--sc-danger-deep)" stroke="var(--sc-illustration-ink)" strokeWidth="1.5" />
        <rect x="42" y="170" width="20" height="10" fill="var(--sc-danger-strong)" stroke="var(--sc-illustration-ink)" strokeWidth="1.5" />
        <rect x="30" y="158" width="20" height="10" fill="var(--sc-danger-deep)" stroke="var(--sc-illustration-ink)" strokeWidth="1.5" />
      </g>
      {/* Tool box */}
      <g>
        <rect x="195" y="160" width="32" height="20" fill="var(--sc-blue)" stroke="var(--sc-illustration-ink)" strokeWidth="1.5" />
        <rect x="200" y="155" width="22" height="6" fill="var(--sc-illustration-toolbox)" stroke="var(--sc-illustration-ink)" strokeWidth="1.5" />
      </g>
    </svg>
  )
}
