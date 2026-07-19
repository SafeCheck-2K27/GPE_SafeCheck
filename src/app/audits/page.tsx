"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/safecheck/Navbar"
import { ScButton, ScBadge } from "@/components/safecheck/primitives"
import Footer from "@/components/safecheck/Footer"
import { PageShell } from "@/components/safecheck/layout/PageShell"
import {
  Clock,
  Target,
  Layers,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Pause,
  Save,
  ShieldCheck,
  Zap,
  Microscope,
  Crown,
} from "lucide-react"

interface AuditLevel {
  id: string
  level: string
  title: string
  duration: string
  durationShort: string
  goal: string
  outputs: string[]
  audience: string
  status: "available" | "coming" | "premium"
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  accent: string
}

const AUDIT_LEVELS: AuditLevel[] = [
  {
    id: "qualification",
    level: "Niveau 1",
    title: "Audit de qualification rapide",
    duration: "Moins de 10 minutes",
    durationShort: "≈ 10 min",
    goal:
      "Qualifier votre profil en quelques minutes et déterminer votre niveau (néophyte, intermédiaire ou avancé) pour vous orienter vers les bons contenus.",
    outputs: [
      "Premier score de sécurité",
      "Profil utilisateur",
      "Recommandations initiales",
      "Onboarding personnalisé",
    ],
    audience: "Recommandé à toutes les nouvelles personnes inscrites.",
    status: "available",
    href: "/audit",
    icon: Zap,
    accent: "var(--sc-blue)",
  },
  {
    id: "standard",
    level: "Niveau 2",
    title: "Audit standard",
    duration: "30 à 45 minutes",
    durationShort: "30-45 min",
    goal:
      "Produire un véritable score de sécurité en couvrant plusieurs dimensions : système, réseau, mots de passe, sauvegardes, confidentialité, usages et habitudes.",
    outputs: [
      "Score de sécurité détaillé",
      "Recommandations priorisées",
      "Plan d'action sur 30 jours",
      "Projection d'amélioration",
    ],
    audience: "Pour les utilisateurs qui veulent un vrai diagnostic.",
    status: "coming",
    href: "/wip?feature=audit-standard",
    icon: ShieldCheck,
    accent: "var(--sc-info)",
  },
  {
    id: "complet",
    level: "Niveau 3",
    title: "Audit complet",
    duration: "1h30 à 2h",
    durationShort: "1h30-2h",
    goal:
      "Diagnostic large par domaine : OS, réseau, données, confidentialité, architecture personnelle et hygiène numérique. Adapté aux usages plus avancés ou semi-pro.",
    outputs: [
      "Diagnostic par domaine",
      "Cartographie des risques",
      "Plan de remédiation détaillé",
      "Suivi sur 90 jours",
    ],
    audience: "Pour utilisateurs impliqués ou usages semi-professionnels.",
    status: "coming",
    href: "/wip?feature=audit-complet",
    icon: Microscope,
    accent: "var(--sc-teal)",
  },
  {
    id: "expert",
    level: "Niveau 4",
    title: "Audit expert",
    duration: "4 à 5 heures",
    durationShort: "4-5h",
    goal:
      "Audit extrêmement détaillé, potentiellement avec manipulations sur machine, accompagnement et restitution personnalisée. Réservé aux utilisateurs très engagés.",
    outputs: [
      "Audit guidé et accompagné",
      "Manipulations sur machine",
      "Rapport personnalisé",
      "Session de restitution",
    ],
    audience: "Pour profils expérimentés ou exigences fortes.",
    status: "premium",
    href: "/wip?feature=audit-expert",
    icon: Crown,
    accent: "var(--sc-orange)",
  },
]

export default function AuditsPage() {
  const router = useRouter()
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <PageShell className="bg-[color:var(--sc-surface)]">
      <Navbar onSignupClick={() => router.push("/compte/creer")} />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-[color:var(--sc-bg-soft)] border-b border-[color:var(--sc-border)]">
          <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
            <ScBadge tone="info" className="mb-4">
              <ShieldCheck className="w-3 h-3" />
              Choisissez votre niveau d'audit
            </ScBadge>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[color:var(--sc-text)] mb-4 text-balance">
              Quatre niveaux d'audit, un seul objectif&nbsp;: vous protéger.
            </h1>
            <p className="text-base md:text-lg text-[color:var(--sc-text)] max-w-3xl leading-relaxed text-pretty">
              Chaque niveau d'audit SafeCheck explore en profondeur un aspect différent de votre sécurité numérique.
              Commencez par l'audit de qualification pour obtenir votre profil en quelques minutes, puis montez en
              puissance à votre rythme.
            </p>

            {/* Pause/save banner */}
            <div
              className="mt-6 flex items-start gap-3 p-4 rounded-lg bg-[color:var(--sc-surface)]"
              style={{ border: "1px solid var(--sc-border)", boxShadow: "var(--sc-shadow-sm)" }}
            >
              <div className="shrink-0 w-9 h-9 rounded-full bg-[color:var(--sc-bg-soft)] flex items-center justify-center">
                <Save className="w-4 h-4 text-[color:var(--sc-blue)]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[color:var(--sc-text)]">
                  Tous les audits peuvent être interrompus, sauvegardés et repris plus tard.
                </p>
                <p className="text-xs text-[color:var(--sc-text-2)] mt-0.5">
                  Vous reprenez exactement à la même question, sans rien perdre.
                </p>
              </div>
              <Pause className="w-4 h-4 text-[color:var(--sc-blue)] mt-2 hidden md:block" />
            </div>
          </div>
        </section>

        {/* Audit cards */}
        <section className="max-w-5xl mx-auto px-4 py-10 md:py-14">
          <div className="flex flex-col gap-5">
            {AUDIT_LEVELS.map((audit, idx) => (
              <AuditCard
                key={audit.id}
                audit={audit}
                index={idx}
                hovered={hovered === audit.id}
                onHover={() => setHovered(audit.id)}
                onLeave={() => setHovered(null)}
                onClick={() => router.push(audit.href)}
              />
            ))}
          </div>

          {/* Footer info */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoCard
              icon={<Clock className="w-5 h-5 text-[color:var(--sc-blue)]" />}
              title="À votre rythme"
              text="Chaque audit s'adapte à votre disponibilité. Lancez, mettez en pause, reprenez."
            />
            <InfoCard
              icon={<Target className="w-5 h-5 text-[color:var(--sc-blue)]" />}
              title="Un plan d'action"
              text="Chaque audit débouche sur des recommandations concrètes et priorisées."
            />
            <InfoCard
              icon={<Layers className="w-5 h-5 text-[color:var(--sc-blue)]" />}
              title="Évolutif"
              text="Refaites un audit régulièrement pour suivre vos progrès."
            />
          </div>
        </section>
      </main>

      <Footer />
    </PageShell>
  )
}

function AuditCard({
  audit,
  index,
  hovered,
  onHover,
  onLeave,
  onClick,
}: {
  audit: AuditLevel
  index: number
  hovered: boolean
  onHover: () => void
  onLeave: () => void
  onClick: () => void
}) {
  const Icon = audit.icon

  const statusBadge = {
    available: <ScBadge tone="success"><CheckCircle2 className="w-3 h-3" />Disponible</ScBadge>,
    coming: <ScBadge tone="warn">Bientôt disponible</ScBadge>,
    premium: <ScBadge tone="premium"><Sparkles className="w-3 h-3" />Expert · Long terme</ScBadge>,
  }[audit.status]

  return (
    <article
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className="rounded-xl bg-[color:var(--sc-surface)] sc-fade-in cursor-pointer group transition-all duration-200"
      style={{
        animationDelay: `${index * 60}ms`,
        border: "1px solid var(--sc-border)",
        boxShadow: hovered ? "var(--sc-shadow-lg)" : "var(--sc-shadow)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}
      onClick={onClick}
    >
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-5 p-5 md:p-6 items-center">
        {/* Icon column */}
        <div
          className="w-14 h-14 md:w-16 md:h-16 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
          style={{ background: `${audit.accent}15`, border: `1px solid ${audit.accent}40` }}
        >
          <Icon className="w-7 h-7 md:w-8 md:h-8" style={{ color: audit.accent }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <LevelTag level={audit.level} />
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[color:var(--sc-text-2)]">
              <Clock className="w-3 h-3" />
              {audit.durationShort}
            </span>
            <span className="ml-auto md:hidden">{statusBadge}</span>
          </div>
          <h2 className="text-lg md:text-xl font-extrabold text-[color:var(--sc-text)] mb-1.5 text-balance">
            {audit.title}
          </h2>
          <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed mb-3 text-pretty">{audit.goal}</p>

          {/* Outputs */}
          <div className="flex flex-wrap gap-1.5">
            {audit.outputs.map((out) => (
              <span
                key={out}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-[color:var(--sc-surface-2)] border border-[color:var(--sc-border)] text-[color:var(--sc-text)]"
              >
                <CheckCircle2 className="w-3 h-3 text-[color:var(--sc-blue)]" />
                {out}
              </span>
            ))}
          </div>

          <p className="text-xs text-[color:var(--sc-text-muted)] mt-3 italic">{audit.audience}</p>
        </div>

        {/* CTA + status */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          <div className="hidden md:block">{statusBadge}</div>
          {audit.status === "available" ? (
            <ScButton variant="primary" size="md" onClick={onClick}>
              Lancer
              <ArrowRight className="w-4 h-4 ml-1" />
            </ScButton>
          ) : (
            <ScButton variant="secondary" size="md" onClick={onClick}>
              En savoir plus
              <ArrowRight className="w-4 h-4 ml-1" />
            </ScButton>
          )}
        </div>
      </div>
    </article>
  )
}

/**
 * Single source of truth for the "Niveau X" tag rendered on every audit card.
 * Pure text content (no nested HTML inside the level value), uniform shape,
 * uniform colour, uniform typography across the whole catalogue.
 */
function LevelTag({ level }: { level: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider text-[color:var(--sc-blue)] bg-[color:var(--sc-blue)]/10 border border-[color:var(--sc-blue)]/25"
    >
      {level}
    </span>
  )
}

function InfoCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div
      className="rounded-lg p-4 bg-[color:var(--sc-surface)]"
      style={{ border: "1px solid var(--sc-border)", boxShadow: "var(--sc-shadow-sm)" }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        {icon}
        <span className="font-semibold text-sm text-[color:var(--sc-text)]">{title}</span>
      </div>
      <p className="text-xs text-[color:var(--sc-text-2)] leading-relaxed">{text}</p>
    </div>
  )
}
