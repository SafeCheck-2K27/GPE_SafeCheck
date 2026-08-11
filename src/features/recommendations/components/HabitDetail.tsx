import {
  AlertTriangle,
  BookOpen,
  BookMarked,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react"
import { AccessibleModal } from "@/components/safecheck/layout/AccessibleModal"
import { ScBadge, ScButton } from "@/components/safecheck/primitives"
import { STATUS_LABELS } from "../data"
import type { Habit, RecommendationStatus } from "../types"
import { RecommendationIcon } from "./RecommendationIcon"

export function HabitDetail({
  h,
  onClose,
  status,
  onStatusChange,
}: {
  h: Habit
  onClose: () => void
  status: RecommendationStatus
  onStatusChange: (s: RecommendationStatus) => void
}) {
  return (
    <AccessibleModal
      open
      onClose={onClose}
      aria-labelledby="habit-detail-title"
      className="px-4 py-6 backdrop-blur-none"
    >
      <div
        className="w-full max-w-lg rounded-xl bg-[color:var(--sc-surface)] sc-fade-in max-h-[90vh] overflow-y-auto"
        style={{ border: "1px solid var(--sc-border)", boxShadow: "var(--sc-shadow-md)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-[color:var(--sc-bg-soft)] flex items-center justify-center shrink-0">
                <RecommendationIcon icon={h.icon} className="w-5 h-5 text-[color:var(--sc-blue)]" />
              </div>
              <div>
                <h3
                  id="habit-detail-title"
                  className="font-extrabold text-lg text-[color:var(--sc-text)] leading-tight"
                >
                  {h.title}
                </h3>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <ScBadge tone={h.level === "Débutant" ? "success" : h.level === "Intermédiaire" ? "info" : "premium"}>
                    {h.level}
                  </ScBadge>
                  <ScBadge tone="muted">{h.tag}</ScBadge>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-[color:var(--sc-surface-2)] rounded shrink-0" aria-label="Fermer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5 text-xs text-[color:var(--sc-text-2)] bg-[color:var(--sc-bg)] rounded-lg px-3 py-2 border border-[color:var(--sc-border)]">
              <Clock className="w-3.5 h-3.5 text-[color:var(--sc-blue)] shrink-0" />
              {h.timeEstimate}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[color:var(--sc-text-2)] bg-[color:var(--sc-bg)] rounded-lg px-3 py-2 border border-[color:var(--sc-border)]">
              <Zap className="w-3.5 h-3.5 text-[color:var(--sc-blue)] shrink-0" />
              {h.benefit}
            </div>
          </div>

          {/* Pourquoi c'est important */}
          <div>
            <h4 className="font-bold text-sm text-[color:var(--sc-text)] mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[color:var(--sc-blue)]" />
              Pourquoi c&apos;est important
            </h4>
            <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">{h.whyImportant}</p>
          </div>

          {/* Explication détaillée */}
          <div>
            <h4 className="font-bold text-sm text-[color:var(--sc-text)] mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[color:var(--sc-blue)]" />
              En détail
            </h4>
            <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">{h.detail}</p>
          </div>

          {/* Erreur fréquente */}
          <div className="rounded-lg bg-[color:var(--sc-warn-soft)] border border-[color:var(--sc-warn-border)] px-4 py-3">
            <h4 className="font-bold text-xs text-[color:var(--sc-warn-text)] mb-1 flex items-center gap-1.5 uppercase tracking-wide">
              <AlertTriangle className="w-3.5 h-3.5" />
              Erreur fréquente
            </h4>
            <p className="text-xs text-[color:var(--sc-warn-text)] leading-relaxed">{h.commonMistake}</p>
          </div>

          {/* Tutoriels liés */}
          {h.linkedTutorials.length > 0 && (
            <div>
              <h4 className="font-bold text-sm text-[color:var(--sc-text)] mb-2 flex items-center gap-1.5">
                <ExternalLink className="w-4 h-4 text-[color:var(--sc-blue)]" />
                Tutoriels liés
              </h4>
              <div className="flex flex-col gap-2">
                {h.linkedTutorials.map((tuto) => (
                  <a
                    key={tuto.id}
                    href={`/tutoriels/${tuto.id}`}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--sc-blue)] hover:underline bg-[color:var(--sc-bg-soft)] px-3 py-2 rounded-lg border border-[color:var(--sc-info-border)]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <BookMarked className="w-3.5 h-3.5 shrink-0" />
                    {tuto.title}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Status picker */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[color:var(--sc-text-muted)] font-medium">Statut :</span>
            {(["todo", "en-cours", "fait", "sauvegarde"] as RecommendationStatus[]).map((s) => {
              const { label, color } = STATUS_LABELS[s]
              return (
                <button
                  key={s}
                  onClick={() => onStatusChange(s)}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all ${ status === s ? color : "text-[color:var(--sc-text-muted)] bg-[color:var(--sc-bg)] border-[color:var(--sc-border)] hover:border-[color:var(--sc-border)]" }`}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {/* CTAs */}
          <div className="flex justify-end gap-2 mt-1">
            <ScButton
              variant="secondary"
              onClick={() => { onStatusChange("fait"); onClose() }}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Marquer comme fait
            </ScButton>
            <ScButton variant="primary" onClick={onClose}>
              Compris
            </ScButton>
          </div>
        </div>
      </div>
    </AccessibleModal>
  )
}
