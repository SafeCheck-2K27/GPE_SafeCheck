import { Pause, Save, ShieldCheck } from "lucide-react"
import { ScBadge } from "@/components/safecheck/primitives"

export function AuditsHero() {
  return (
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
          Chaque niveau d'audit SafeCheck explore en profondeur un aspect
          différent de votre sécurité numérique. Commencez par l'audit de
          qualification pour obtenir votre profil en quelques minutes, puis
          montez en puissance à votre rythme.
        </p>

        <div
          className="mt-6 flex items-start gap-3 p-4 rounded-lg bg-[color:var(--sc-surface)]"
          style={{
            border: "1px solid var(--sc-border)",
            boxShadow: "var(--sc-shadow-sm)",
          }}
        >
          <div className="shrink-0 w-9 h-9 rounded-full bg-[color:var(--sc-bg-soft)] flex items-center justify-center">
            <Save className="w-4 h-4 text-[color:var(--sc-blue)]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[color:var(--sc-text)]">
              Tous les audits peuvent être interrompus, sauvegardés et repris
              plus tard.
            </p>
            <p className="text-xs text-[color:var(--sc-text-2)] mt-0.5">
              Vous reprenez exactement à la même question, sans rien perdre.
            </p>
          </div>
          <Pause className="w-4 h-4 text-[color:var(--sc-blue)] mt-2 hidden md:block" />
        </div>
      </div>
    </section>
  )
}
