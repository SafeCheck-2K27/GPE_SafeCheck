"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/components/safecheck/AuthProvider"
import { ScBadge, ScButton } from "@/components/safecheck/primitives"
import {
  ArrowRight,
  BarChart2,
  BookMarked,
  Brain,
  ClipboardList,
  Clock,
  Cog,
  Monitor,
  Star,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react"
import { HABITUDES, TECH } from "../data"
import type { RecommendationView } from "../types"

export function RecommendationsHub({ onSelect }: { onSelect: (view: Exclude<RecommendationView, "hub">) => void }) {
  const { isLoggedIn } = useAuth()
  const router = useRouter()

  return (
    <>
      {/* Hero */}
      <section className="bg-[color:var(--sc-bg-soft)] border-b border-[color:var(--sc-border)]">
        <div className="max-w-5xl mx-auto px-4 py-12 md:py-16 text-center">
          <ScBadge tone="info" className="mb-4">
            Centre d&apos;action SafeCheck
          </ScBadge>
          <h1 className="text-3xl md:text-5xl font-extrabold text-[color:var(--sc-text)] mb-4 text-balance">
            Des recommandations concrètes, priorisées selon votre profil.
          </h1>
          <p className="text-base md:text-lg text-[color:var(--sc-text)] max-w-3xl mx-auto leading-relaxed text-pretty">
            Ces recommandations sont utiles à tous. Mais c&apos;est l&apos;audit SafeCheck qui vous indique lesquelles
            appliquer en priorité, selon votre situation réelle.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            {isLoggedIn ? (
              <ScButton variant="primary" onClick={() => router.push("/compte")}>
                <BarChart2 className="w-4 h-4" />
                Voir mon plan d&apos;action personnalisé
              </ScButton>
            ) : (
              <ScButton variant="primary" onClick={() => router.push("/audits")}>
                <TrendingUp className="w-4 h-4" />
                Passer l&apos;audit pour mes recommandations personnalisées
              </ScButton>
            )}
            <ScButton variant="secondary" onClick={() => onSelect("habitudes")}>
              Explorer les recommandations
            </ScButton>
          </div>
        </div>
      </section>

      {/* Comment utiliser les recommandations */}
      <section className="border-b border-[color:var(--sc-border)] bg-[color:var(--sc-surface-2)]">
        <div className="max-w-5xl mx-auto px-4 py-10 md:py-12">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-extrabold text-[color:var(--sc-text)] text-balance">
              Comment utiliser les recommandations ?
            </h2>
            <p className="text-sm text-[color:var(--sc-text-muted)] mt-2 max-w-xl mx-auto">
              Un parcours simple pour progresser de façon structurée, sans se noyer dans les détails.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                step: "1",
                icon: Brain,
                title: "Comprendre les bons réflexes",
                desc: "Commencez par les habitudes du quotidien. Pas d\u2019installation, pas de technique : juste les attitudes qui éliminent 80\u00a0% des risques.",
                tone: "success" as const,
                label: "Bonnes habitudes",
              },
              {
                step: "2",
                icon: Cog,
                title: "Appliquer les configurations techniques",
                desc: "Renforcez votre posture avec des outils et paramètres concrets\u00a0: gestionnaire de mots de passe, chiffrement, VPN, pare-feu.",
                tone: "info" as const,
                label: "Recommandations techniques",
              },
              {
                step: "3",
                icon: Target,
                title: "Prioriser avec l\u2019audit SafeCheck",
                desc: "L\u2019audit analyse votre profil et génère un plan d\u2019action personnalisé. Vous savez exactement quoi faire en premier.",
                tone: "premium" as const,
                label: "Audit SafeCheck",
              },
            ].map(({ step, icon: Icon, title, desc, tone, label }) => (
              <div
                key={step}
                className="relative flex flex-col gap-3 rounded-xl p-5 bg-[color:var(--sc-surface)]"
                style={{ border: "1px solid var(--sc-border)", boxShadow: "var(--sc-shadow-sm)" }}
              >
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[color:var(--sc-blue)] text-[color:var(--sc-text-on-strong)] text-sm font-extrabold flex items-center justify-center">
                    {step}
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-[color:var(--sc-bg-soft)] flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5 text-[color:var(--sc-blue)]" />
                  </div>
                </div>
                <h3 className="font-bold text-[color:var(--sc-text)] text-sm leading-snug">{title}</h3>
                <p className="text-xs text-[color:var(--sc-text-muted)] leading-relaxed">{desc}</p>
                <ScBadge tone={tone} className="self-start mt-auto">{label}</ScBadge>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two family cards */}
      <section className="max-w-5xl mx-auto px-4 py-10 md:py-14 grid grid-cols-1 md:grid-cols-2 gap-5">
        <button
          onClick={() => onSelect("habitudes")}
          className="text-left rounded-xl p-6 md:p-8 bg-[color:var(--sc-surface)] flex flex-col gap-3 transition-all hover:-translate-y-1 cursor-pointer group"
          style={{ border: "1px solid var(--sc-border)", boxShadow: "var(--sc-shadow-md)" }}
        >
          <div className="w-14 h-14 rounded-lg bg-[color:var(--sc-bg-soft)] flex items-center justify-center transition-transform group-hover:scale-110">
            <Brain className="w-7 h-7 text-[color:var(--sc-blue)]" />
          </div>
          <ScBadge tone="success" className="self-start">
            Bonnes habitudes &amp; réflexes
          </ScBadge>
          <h2 className="text-xl md:text-2xl font-extrabold text-[color:var(--sc-text)] text-balance">
            Les réflexes qui changent tout, sans jargon.
          </h2>
          <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">
            Adoptez les bons gestes au quotidien. Pas besoin d&apos;être technique, juste les bonnes attitudes au bon
            moment.
          </p>

          {/* Metadata row */}
          <div className="mt-1 grid grid-cols-2 gap-2">
            {[
              { icon: BookMarked, label: `${HABITUDES.length} réflexes` },
              { icon: Zap, label: "Sans installation" },
              { icon: Clock, label: "5 min pour commencer" },
              { icon: Star, label: "Idéal pour débuter" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-[color:var(--sc-text-2)]">
                <Icon className="w-3.5 h-3.5 text-[color:var(--sc-blue)] shrink-0" />
                {label}
              </div>
            ))}
          </div>

          <div className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--sc-blue)]">
            Voir les bonnes habitudes <ArrowRight className="w-4 h-4" />
          </div>
        </button>

        <button
          onClick={() => onSelect("techniques")}
          className="text-left rounded-xl p-6 md:p-8 bg-[color:var(--sc-surface)] flex flex-col gap-3 transition-all hover:-translate-y-1 cursor-pointer group"
          style={{ border: "1px solid var(--sc-border)", boxShadow: "var(--sc-shadow-md)" }}
        >
          <div className="w-14 h-14 rounded-lg bg-[color:var(--sc-bg-soft)] flex items-center justify-center transition-transform group-hover:scale-110">
            <Cog className="w-7 h-7 text-[color:var(--sc-blue)]" />
          </div>
          <ScBadge tone="info" className="self-start">
            Recommandations techniques
          </ScBadge>
          <h2 className="text-xl md:text-2xl font-extrabold text-[color:var(--sc-text)] text-balance">
            Les configurations qui renforcent durablement votre posture.
          </h2>
          <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">
            Logiciels, OS, hardware, navigateurs, confidentialité, sauvegarde, réseau\u00a0: les actions concrètes à
            appliquer pour un impact durable.
          </p>

          {/* Metadata row */}
          <div className="mt-1 grid grid-cols-2 gap-2">
            {[
              { icon: ClipboardList, label: `${TECH.length} configurations` },
              { icon: Monitor, label: "Logiciels, OS, réseau" },
              { icon: BarChart2, label: "Débutant à avancé" },
              { icon: TrendingUp, label: "Impact durable" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-[color:var(--sc-text-2)]">
                <Icon className="w-3.5 h-3.5 text-[color:var(--sc-blue)] shrink-0" />
                {label}
              </div>
            ))}
          </div>

          <div className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--sc-blue)]">
            Voir les recommandations techniques <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </section>
    </>
  )
}
