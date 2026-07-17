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
  const Icon = h.icon
  return (
    <AccessibleModal
      open
      onClose={onClose}
      aria-labelledby="habit-detail-title"
      className="bg-black/40 px-4 py-6 backdrop-blur-none"
    >
      <div
        className="w-full max-w-lg rounded-xl bg-[#FFFFFF] sc-fade-in max-h-[90vh] overflow-y-auto"
        style={{ border: "1px solid #B3DBEF", boxShadow: "5px 5px 0px #C0DDF8" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-[#C3E8FF] flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-[#157FE2]" />
              </div>
              <div>
                <h3
                  id="habit-detail-title"
                  className="font-extrabold text-lg text-[#000] leading-tight"
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
            <button onClick={onClose} className="p-1 hover:bg-[#F6F6F6] rounded shrink-0" aria-label="Fermer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5 text-xs text-[#000]/65 bg-[#F8FAFC] rounded-lg px-3 py-2 border border-[#E2E8F0]">
              <Clock className="w-3.5 h-3.5 text-[#157FE2] shrink-0" />
              {h.timeEstimate}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#000]/65 bg-[#F8FAFC] rounded-lg px-3 py-2 border border-[#E2E8F0]">
              <Zap className="w-3.5 h-3.5 text-[#157FE2] shrink-0" />
              {h.benefit}
            </div>
          </div>

          {/* Pourquoi c'est important */}
          <div>
            <h4 className="font-bold text-sm text-[#000] mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#157FE2]" />
              Pourquoi c&apos;est important
            </h4>
            <p className="text-sm text-[#000]/75 leading-relaxed">{h.whyImportant}</p>
          </div>

          {/* Explication détaillée */}
          <div>
            <h4 className="font-bold text-sm text-[#000] mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#157FE2]" />
              En détail
            </h4>
            <p className="text-sm text-[#000]/70 leading-relaxed">{h.detail}</p>
          </div>

          {/* Erreur fréquente */}
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
            <h4 className="font-bold text-xs text-amber-700 mb-1 flex items-center gap-1.5 uppercase tracking-wide">
              <AlertTriangle className="w-3.5 h-3.5" />
              Erreur fréquente
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">{h.commonMistake}</p>
          </div>

          {/* Tutoriels liés */}
          {h.linkedTutorials.length > 0 && (
            <div>
              <h4 className="font-bold text-sm text-[#000] mb-2 flex items-center gap-1.5">
                <ExternalLink className="w-4 h-4 text-[#157FE2]" />
                Tutoriels liés
              </h4>
              <div className="flex flex-col gap-2">
                {h.linkedTutorials.map((tuto) => (
                  <a
                    key={tuto.id}
                    href={`/tutoriels/${tuto.id}`}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#157FE2] hover:underline bg-[#EEF4FF] px-3 py-2 rounded-lg border border-[#C3DAFD]"
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
            <span className="text-xs text-[#000]/60 font-medium">Statut :</span>
            {(["todo", "en-cours", "fait", "sauvegarde"] as RecommendationStatus[]).map((s) => {
              const { label, color } = STATUS_LABELS[s]
              return (
                <button
                  key={s}
                  onClick={() => onStatusChange(s)}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all ${ status === s ? color : "text-[#000]/40 bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#B3DBEF]" }`}
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
