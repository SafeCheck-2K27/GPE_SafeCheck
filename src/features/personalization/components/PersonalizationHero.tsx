import { SlidersHorizontal, Sparkles } from "lucide-react"

export function PersonalizationHero() {
  return (
    <>
      <div className="flex flex-col items-center text-center gap-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[rgb(var(--sc-success-rgb)/0.10)] border border-[rgb(var(--sc-success-rgb)/0.25)] text-[color:var(--sc-success)]">
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0 bg-[color:var(--sc-success)]"
            aria-hidden
          />
          Votre audit est terminé. Cette étape facultative précède vos résultats.
        </div>

        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-[color:var(--sc-text-on-strong)] bg-[linear-gradient(135deg,var(--sc-blue-soft),var(--sc-blue),var(--sc-indigo))] shadow-[var(--sc-shadow-blue)]">
          <SlidersHorizontal className="w-6 h-6" />
        </div>

        <div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-[color:var(--sc-text)] text-balance leading-tight">
            Aperçu du questionnaire facultatif
          </h1>
          <p className="mt-2 text-sm md:text-base text-[color:var(--sc-text-2)] leading-relaxed text-pretty max-w-lg mx-auto">
            Vous pouvez essayer ces questions à titre de démonstration. Vos réponses
            restent temporaires dans cette page : elles ne sont ni enregistrées ni
            transmises, et ne modifient pas votre score ou vos recommandations.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[color:var(--sc-text-muted)]">
          <Sparkles className="w-3.5 h-3.5 text-[color:var(--sc-blue)]" />
          <span>6 questions · Toutes facultatives · Moins de 2 minutes</span>
        </div>
      </div>

      <div className="h-px bg-[color:var(--sc-border)]" />
    </>
  )
}
