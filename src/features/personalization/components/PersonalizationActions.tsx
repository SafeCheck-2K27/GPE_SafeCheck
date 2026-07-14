import { ChevronRight, Shield, SkipForward } from "lucide-react"

export function PersonalizationActions({
  onSubmit,
  onSkip,
}: {
  onSubmit: () => void
  onSkip: () => void
}) {
  return (
    <div className="rounded-2xl p-5 md:p-6 flex flex-col items-center gap-4 bg-[color:var(--sc-bg-soft)] border border-[color:var(--sc-border)]">
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
        <button
          type="button"
          onClick={onSubmit}
          className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-[linear-gradient(135deg,var(--sc-blue-soft),var(--sc-blue))] border border-[color:var(--sc-blue-hover)] shadow-[0_8px_20px_-6px_rgba(37,99,235,0.45)] hover:shadow-[0_12px_28px_-8px_rgba(37,99,235,0.55)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
        >
          <Shield className="w-4 h-4 shrink-0" />
          Voir mes résultats
          <ChevronRight className="w-4 h-4 shrink-0" />
        </button>

        <button
          type="button"
          onClick={onSkip}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] text-[color:var(--sc-text-2)] hover:border-[color:var(--sc-border-strong)] hover:text-[color:var(--sc-text)] hover:bg-[color:var(--sc-surface-2)] transition-all duration-200"
        >
          <SkipForward className="w-4 h-4 shrink-0" />
          Passer cette étape
        </button>
      </div>

      <p className="text-xs text-[color:var(--sc-text-muted)] text-center">
        Vous pourrez modifier ces préférences plus tard depuis votre profil.
      </p>
    </div>
  )
}
