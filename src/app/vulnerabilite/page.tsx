"use client"

import { useRouter } from "next/navigation"
import Navbar from "@/components/safecheck/Navbar"
import { ScButton, ScBadge } from "@/components/safecheck/primitives"
import Footer from "@/components/safecheck/Footer"
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
    accent: "#0EA5E9",
  },
  {
    icon: Stethoscope,
    title: "Secteur sensible",
    quote:
      "Une personne travaillant dans un environnement sensible - médical, industriel, énergétique - peut être davantage exposée aux tentatives d'intrusion ou d'ingénierie sociale.",
    risk: "Ingénierie sociale",
    accent: "#0F766E",
  },
  {
    icon: Cpu,
    title: "Logiciels obsolètes",
    quote:
      "Un poste qui n'est pas à jour augmente significativement le risque d'être touché par une exploitation de vulnérabilité connue.",
    risk: "Exploits CVE",
    accent: "#9A3412",
  },
]

export default function VulnerabilitePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] font-sans">
      <Navbar onSignupClick={() => router.push("/compte/creer")} />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-[#C3E8FF] border-b border-[#B3DBEF]">
          <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
            <ScBadge tone="warn" className="mb-4">
              <ShieldAlert className="w-3 h-3" />
              Test pédagogique d'exposition
            </ScBadge>

            <h1 className="text-3xl md:text-5xl font-extrabold text-[#000] mb-4 text-balance">
              Tester ma vulnérabilité&nbsp;: comprendre votre niveau d'exposition.
            </h1>
            <p className="text-base md:text-lg text-[#000]/80 max-w-3xl leading-relaxed text-pretty">
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
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#000] mb-2">Comment fonctionne ce test ?</h2>
            <p className="text-sm text-[#000]/70 max-w-2xl mx-auto">
              Le calcul d'exposition combine plusieurs critères, croisés avec des rapports publics et des données
              sectorielles, pour produire une estimation lisible de votre profil de risque.
            </p>
          </div>

          {/* Factors grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-12">
            {FACTORS.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="rounded-lg p-4 bg-[#FFFFFF] flex items-start gap-3 transition-all hover:scale-[1.02]"
                style={{ border: "1px solid #B3DBEF", boxShadow: "2px 2px 0px #C0DDF8" }}
              >
                <Icon className="w-5 h-5 text-[#157FE2] mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-[#000]">{label}</span>
              </div>
            ))}
          </div>

          {/* Real examples */}
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#000] mb-2">Quelques exemples concrets</h2>
            <p className="text-sm text-[#000]/70 max-w-2xl mx-auto">
              Pour vous donner une idée, voici quelques profils types et le type de risques qui peuvent les concerner.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {EXAMPLES.map((ex) => {
              const Icon = ex.icon
              return (
                <div
                  key={ex.title}
                  className="rounded-xl p-5 bg-[#FFFFFF] flex flex-col"
                  style={{ border: "1px solid #B3DBEF", boxShadow: "3px 3px 0px #C0DDF8" }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: `${ex.accent}15`, border: `1px solid ${ex.accent}40` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: ex.accent }} />
                    </div>
                    <span className="font-bold text-sm text-[#000]">{ex.title}</span>
                  </div>
                  <p className="text-sm text-[#000]/80 leading-relaxed mb-4 italic">«&nbsp;{ex.quote}&nbsp;»</p>
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
            className="rounded-xl p-6 bg-[#F6F6F6]"
            style={{ border: "1px solid #AEAEAE", boxShadow: "3px 3px 0px #C0DDF8" }}
          >
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-[#157FE2] mt-0.5 shrink-0" />
              <div>
                <h3 className="font-bold text-[#000] mb-1">Sources & méthodologie</h3>
                <p className="text-sm text-[#000]/75 leading-relaxed">
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
    </div>
  )
}
