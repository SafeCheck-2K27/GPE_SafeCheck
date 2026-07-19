"use client"

import { useRouter } from "next/navigation"
import Navbar from "@/components/safecheck/Navbar"
import { ScButton, ScBadge } from "@/components/safecheck/primitives"
import Footer from "@/components/safecheck/Footer"
import { PageShell } from "@/components/safecheck/layout/PageShell"
import {
  ShieldAlert,
  Activity,
  FileText,
  ArrowRight,
  Stethoscope,
  Briefcase,
  Globe,
  Cpu,
  Users,
  AlertTriangle,
  Eye,
} from "lucide-react"

const FACTORS = [
  { icon: Users, label: "Âge & profil démographique" },
  { icon: Briefcase, label: "Métier & secteur d'activité" },
  { icon: Cpu, label: "OS et applications utilisées" },
  { icon: Globe, label: "Environnement de travail" },
  { icon: Activity, label: "Habitudes en ligne" },
  { icon: AlertTriangle, label: "Comportements à risque" },
]

const EXAMPLES = [
  {
    icon: Eye,
    title: "Profil senior",
    quote:
      "Un utilisateur de plus de 50 ans peut avoir un risque plus élevé d'être ciblé par des attaques de phishing ciblées sur des services bancaires et administratifs.",
    risk: "Phishing ciblé",
    accent: "var(--sc-info)",
  },
  {
    icon: Stethoscope,
    title: "Secteur sensible",
    quote:
      "Une personne travaillant dans un environnement sensible - médical, industriel, énergétique - peut être davantage exposée aux tentatives d'intrusion ou d'ingénierie sociale.",
    risk: "Ingénierie sociale",
    accent: "var(--sc-teal)",
  },
  {
    icon: Cpu,
    title: "Logiciels obsolètes",
    quote:
      "Un poste qui n'est pas à jour augmente significativement le risque d'être touché par une exploitation de vulnérabilité connue.",
    risk: "Exploits CVE",
    accent: "var(--sc-orange)",
  },
]

export default function VulnerabilitePage() {
  const router = useRouter()

  return (
    <PageShell className="bg-[color:var(--sc-surface)]">
      <Navbar onSignupClick={() => router.push("/compte/creer")} />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-[color:var(--sc-bg-soft)] border-b border-[color:var(--sc-border)]">
          <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
            <ScBadge tone="warn" className="mb-4">
              <ShieldAlert className="w-3 h-3" />
              Test pédagogique d'exposition
            </ScBadge>

            <h1 className="text-3xl md:text-5xl font-extrabold text-[color:var(--sc-text)] mb-4 text-balance">
              Tester ma vulnérabilité&nbsp;: comprendre votre niveau d'exposition.
            </h1>
            <p className="text-base md:text-lg text-[color:var(--sc-text)] max-w-3xl leading-relaxed text-pretty">
              Ce test s'appuie sur des rapports officiels, des statistiques publiques et plusieurs critères pour
              estimer votre niveau d'exposition potentiel à différents types d'attaques numériques. Il ne s'agit pas
              d'un diagnostic technique, mais d'un repère personnalisé&nbsp;: comprendre où vous vous situez et
              pourquoi.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <ScButton variant="primary" size="lg" onClick={() => router.push("/wip?feature=test-vulnerabilite")}>
                Lancer le test
                <ArrowRight className="w-4 h-4 ml-1" />
              </ScButton>
              <ScButton variant="secondary" size="lg" onClick={() => router.push("/audits")}>
                Voir tous les audits
              </ScButton>
            </div>
          </div>
        </section>

        {/* Comment ça marche */}
        <section className="max-w-5xl mx-auto px-4 py-10 md:py-14">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[color:var(--sc-text)] mb-2">Comment fonctionne ce test ?</h2>
            <p className="text-sm text-[color:var(--sc-text-2)] max-w-2xl mx-auto">
              Le calcul d'exposition combine plusieurs critères, croisés avec des rapports publics et des données
              sectorielles, pour produire une estimation lisible de votre profil de risque.
            </p>
          </div>

          {/* Factors grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-12">
            {FACTORS.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="rounded-lg p-4 bg-[color:var(--sc-surface)] flex items-start gap-3 transition-all hover:scale-[1.02]"
                style={{ border: "1px solid var(--sc-border)", boxShadow: "var(--sc-shadow-sm)" }}
              >
                <Icon className="w-5 h-5 text-[color:var(--sc-blue)] mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-[color:var(--sc-text)]">{label}</span>
              </div>
            ))}
          </div>

          {/* Real examples */}
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[color:var(--sc-text)] mb-2">Quelques exemples concrets</h2>
            <p className="text-sm text-[color:var(--sc-text-2)] max-w-2xl mx-auto">
              Pour vous donner une idée, voici quelques profils types et le type de risques qui peuvent les concerner.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {EXAMPLES.map((ex) => {
              const Icon = ex.icon
              return (
                <div
                  key={ex.title}
                  className="rounded-xl p-5 bg-[color:var(--sc-surface)] flex flex-col"
                  style={{ border: "1px solid var(--sc-border)", boxShadow: "var(--sc-shadow)" }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: `${ex.accent}15`, border: `1px solid ${ex.accent}40` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: ex.accent }} />
                    </div>
                    <span className="font-bold text-sm text-[color:var(--sc-text)]">{ex.title}</span>
                  </div>
                  <p className="text-sm text-[color:var(--sc-text)] leading-relaxed mb-4 italic">«&nbsp;{ex.quote}&nbsp;»</p>
                  <div className="mt-auto">
                    <ScBadge tone="warn">{ex.risk}</ScBadge>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Disclaimer */}
        <section className="max-w-5xl mx-auto px-4 pb-12">
          <div
            className="rounded-xl p-6 bg-[color:var(--sc-surface-2)]"
            style={{ border: "1px solid var(--sc-border)", boxShadow: "var(--sc-shadow)" }}
          >
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-[color:var(--sc-blue)] mt-0.5 shrink-0" />
              <div>
                <h3 className="font-bold text-[color:var(--sc-text)] mb-1">Sources & méthodologie</h3>
                <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">
                  Le test s'appuie notamment sur des rapports publics&nbsp;:
                  ANSSI (panorama de la menace), ENISA (Threat Landscape), Verizon (Data Breach Investigations Report),
                  CERT-FR. Les estimations sont fournies à titre pédagogique pour vous aider à mieux vous protéger.
                  Elles ne constituent pas un audit de sécurité professionnel.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3 justify-center">
              <ScButton variant="primary" onClick={() => router.push("/wip?feature=test-vulnerabilite")}>
                Lancer le test
                <ArrowRight className="w-4 h-4 ml-1" />
              </ScButton>
              <ScButton variant="secondary" onClick={() => router.push("/essentiels")}>
                Voir les essentiels
              </ScButton>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </PageShell>
  )
}
