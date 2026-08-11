import Navbar from "@/components/safecheck/Navbar"
import { ScLinkButton, ScBadge } from "@/components/safecheck/primitives"
import Footer from "@/components/safecheck/Footer"
import { PageShell } from "@/components/safecheck/layout/PageShell"
import {
  ShieldAlert,
  FileText,
  ArrowRight,
} from "lucide-react"
import { VulnerabilityExamples } from "./_components/VulnerabilityExamples"
import { VulnerabilityFactors } from "./_components/VulnerabilityFactors"

export default function VulnerabilitePage() {
  return (
    <PageShell className="bg-[color:var(--sc-surface)]">
      <Navbar signupHref="/compte/creer" />

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
              <ScLinkButton variant="primary" size="lg" href="/wip?feature=test-vulnerabilite">
                Lancer le test
                <ArrowRight className="w-4 h-4 ml-1" />
              </ScLinkButton>
              <ScLinkButton variant="secondary" size="lg" href="/audits">
                Voir tous les audits
              </ScLinkButton>
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

          <VulnerabilityFactors />

          {/* Real examples */}
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[color:var(--sc-text)] mb-2">Quelques exemples concrets</h2>
            <p className="text-sm text-[color:var(--sc-text-2)] max-w-2xl mx-auto">
              Pour vous donner une idée, voici quelques profils types et le type de risques qui peuvent les concerner.
            </p>
          </div>

          <VulnerabilityExamples />
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
              <ScLinkButton variant="primary" href="/wip?feature=test-vulnerabilite">
                Lancer le test
                <ArrowRight className="w-4 h-4 ml-1" />
              </ScLinkButton>
              <ScLinkButton variant="secondary" href="/essentiels">
                Voir les essentiels
              </ScLinkButton>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </PageShell>
  )
}
