import { ScButton } from "@/components/safecheck/primitives"
import type { TutorialSyncState } from "../progress-controller"

export function TutorialProgressSyncStatus({ state, retryHydration, retrySaves }: {
  state: TutorialSyncState
  retryHydration: () => void
  retrySaves: () => void
}) {
  const failed = state.phase === "error" || state.saveErrors.length > 0
  const message = state.phase === "auth-loading" ? "Verification de la connexion…"
    : state.phase === "loading" ? "Chargement de vos progressions…"
    : state.phase === "error" ? state.saveErrors.length > 0
      ? "Impossible de charger vos progressions. Une sauvegarde a aussi échoué ; votre progression reste disponible pour réessayer."
      : "Impossible de charger vos progressions."
    : state.saveErrors.length > 0 ? "Sauvegarde impossible. Votre progression reste disponible pour réessayer."
    : state.identity === null ? "Progression conservee sur cette page uniquement."
    : state.pending > 0 ? "Enregistrement de la progression…" : "Progression enregistree."
  return (
    <div role={failed ? "alert" : "status"} aria-live={failed ? "assertive" : "polite"}
      className={`mb-4 flex flex-wrap items-center gap-3 rounded-xl border p-3 text-xs ${failed ? "border-[color:var(--sc-warn-border)] bg-[color:var(--sc-warn-soft)] text-[color:var(--sc-warn-text)]" : "border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] text-[color:var(--sc-text-muted)]"}`}>
      <span>{message}</span>
      {failed && <ScButton variant="secondary" size="sm" onClick={state.phase === "error" ? retryHydration : retrySaves}>Reessayer</ScButton>}
    </div>
  )
}
