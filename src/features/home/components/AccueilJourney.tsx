import { ArrowRight, GraduationCap, Sparkles } from "lucide-react"
import { ScBadge, ScButton } from "@/components/safecheck/primitives"
import { homeJourneySteps } from "../data"

export function AccueilJourney({
  onStartAudit,
  onViewTutorials,
}: {
  onStartAudit: () => void
  onViewTutorials: () => void
}) {
  return (
    <section className="max-w-7xl mx-auto px-4 pt-10 pb-2">
      <div className="mb-6">
        <ScBadge tone="info" className="mb-2">
          <Sparkles className="w-3 h-3" />
          Par où commencer&nbsp;?
        </ScBadge>
        <h2 className="font-display text-xl md:text-2xl font-semibold text-[color:var(--sc-text)] text-balance">
          Votre parcours SafeCheck en 3 étapes
        </h2>
        <p className="mt-1.5 text-sm text-[color:var(--sc-text-2)] max-w-xl text-pretty">
          Pas besoin d'être expert. Commencez par le questionnaire&nbsp;: il suffit de 5 minutes
          pour que SafeCheck adapte tout le reste à votre profil.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
        <div className="relative rounded-2xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] shadow-[0_2px_6px_-2px_rgb(var(--sc-ink-rgb)/0.06)] overflow-hidden">
          <div
            className="absolute inset-x-0 top-0 h-0.5"
            style={{
              background: "linear-gradient(90deg, var(--sc-blue-soft), var(--sc-blue) 40%, var(--sc-indigo) 70%, var(--sc-cyan))",
            }}
            aria-hidden
          />

          <div className="p-5 md:p-7">
            <div className="flex flex-col sm:flex-row gap-0">
              {homeJourneySteps.map((step, index) => (
                <div key={step.number} className="flex sm:flex-col flex-1 relative">
                  {index < homeJourneySteps.length - 1 && (
                    <div
                      className="hidden sm:block absolute top-[18px] left-[calc(50%+20px)] right-[calc(-50%+20px)] h-px"
                      style={{ background: "linear-gradient(90deg, var(--sc-blue-soft) 0%, var(--sc-indigo) 100%)" }}
                      aria-hidden
                    />
                  )}
                  {index < homeJourneySteps.length - 1 && (
                    <div
                      className="sm:hidden absolute top-[44px] left-[17px] bottom-[-12px] w-px"
                      style={{ background: "linear-gradient(180deg, var(--sc-blue-soft), var(--sc-indigo))" }}
                      aria-hidden
                    />
                  )}

                  <div className="flex sm:flex-col gap-3 sm:gap-0 flex-1 pb-8 sm:pb-0 sm:px-4 last:pb-0">
                    <div className="flex items-center gap-2.5 sm:justify-center sm:mb-4 shrink-0">
                      <div className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0 text-[color:var(--sc-text-on-strong)] text-sm font-bold relative z-10 bg-[linear-gradient(135deg,var(--sc-blue-soft),var(--sc-blue))] shadow-[0_4px_12px_-4px_rgb(var(--sc-blue-rgb)/0.55)]">
                        {step.number}
                      </div>
                    </div>
                    <div className="sm:text-center">
                      <p className="font-display font-semibold text-sm text-[color:var(--sc-text)] mb-1 text-balance">
                        {step.title}
                      </p>
                      <p className="text-xs text-[color:var(--sc-text-muted)] leading-relaxed text-pretty">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-5 border-t border-[color:var(--sc-border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="text-xs text-[color:var(--sc-text-muted)]">
                Gratuit · Sans inscription obligatoire · Résultats immédiats
              </p>
              <ScButton variant="primary" size="md" onClick={onStartAudit}>
                Je commence le questionnaire
                <ArrowRight className="w-4 h-4" />
              </ScButton>
            </div>
          </div>
        </div>

        <div className="lg:w-64 rounded-2xl border border-[color:var(--sc-blue)]/30 bg-[color:var(--sc-bg-soft)] shadow-[0_2px_6px_-2px_rgb(var(--sc-blue-rgb)/0.12)] p-5 flex flex-col gap-3 relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background: "radial-gradient(at 100% 0%, rgb(var(--sc-indigo-rgb)/0.15), transparent 60%)",
            }}
            aria-hidden
          />
          <div className="relative">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-[color:var(--sc-text-on-strong)] mb-3 bg-[linear-gradient(135deg,var(--sc-blue-soft),var(--sc-blue))] shadow-[0_8px_20px_-6px_rgb(var(--sc-blue-rgb)/0.55)]">
              <GraduationCap className="w-5 h-5" />
            </div>
            <ScBadge tone="info" className="mb-2">
              Résultat attendu
            </ScBadge>
            <h3 className="font-display font-semibold text-base text-[color:var(--sc-text)] mb-1.5">
              Tutos personnalisés
            </h3>
            <p className="text-xs text-[color:var(--sc-text-2)] leading-relaxed text-pretty">
              Après le questionnaire, SafeCheck sélectionne les tutoriels les plus utiles
              pour votre profil. Du débutant au confirmé, chacun trouve son parcours.
            </p>
          </div>
          <button
            onClick={onViewTutorials}
            className="relative mt-auto inline-flex items-center justify-between gap-2 w-full px-3.5 py-2 rounded-lg text-xs font-semibold text-[color:var(--sc-blue)] bg-[color:var(--sc-surface)] border border-[color:var(--sc-blue)]/25 hover:bg-[color:var(--sc-blue)] hover:text-[color:var(--sc-text-on-strong)] hover:border-[color:var(--sc-blue)] transition-colors"
          >
            Voir les tutoriels
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  )
}
