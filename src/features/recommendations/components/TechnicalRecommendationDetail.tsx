import {
  AlertTriangle,
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
import { CATEGORY_LABELS, STATUS_LABELS } from "../data"
import type {
  RecommendationStatus,
  TechnicalRecommendation,
} from "../types"

export function TechnicalRecommendationDetail({
  t,
  onClose,
  status,
  onStatusChange,
}: {
  t: TechnicalRecommendation
  onClose: () => void
  status: RecommendationStatus
  onStatusChange: (s: RecommendationStatus) => void
}) {
  const Icon = t.icon
  return (
    <AccessibleModal
      open
      onClose={onClose}
      aria-labelledby="technical-recommendation-detail-title"
      className="bg-black/40 px-4 py-6 backdrop-blur-none"
    >
      <div
        className="w-full max-w-xl rounded-xl bg-[#FFFFFF] sc-fade-in max-h-[90vh] overflow-y-auto"
        style={{ border: "1px solid #B3DBEF", boxShadow: "5px 5px 0px #C0DDF8" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-[#C3E8FF] flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-[#157FE2]" />
              </div>
              <div>
                <h3
                  id="technical-recommendation-detail-title"
                  className="font-extrabold text-lg text-[#000] leading-tight"
                >
                  {t.title}
                </h3>
                <p className="text-xs text-[#000]/55 italic mt-0.5">{t.subtitle}</p>
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <ScBadge tone={t.urgency === "Haute" ? "warn" : t.urgency === "Moyenne" ? "info" : "muted"}>
                    {t.urgency === "Haute" && <AlertTriangle className="w-3 h-3" />}
                    {t.urgency}
                  </ScBadge>
                  <ScBadge tone={t.level === "Débutant" ? "success" : t.level === "Intermédiaire" ? "info" : "premium"}>
                    {t.level}
                  </ScBadge>
                  <ScBadge tone="muted">{CATEGORY_LABELS[t.category].label}</ScBadge>
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
              {t.timeEstimate}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#000]/65 bg-[#F8FAFC] rounded-lg px-3 py-2 border border-[#E2E8F0]">
              <Zap className="w-3.5 h-3.5 text-[#157FE2] shrink-0" />
              {t.benefit}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-[#000]/80 leading-relaxed">{t.description}</p>

          {/* Pourquoi c'est important */}
          <div>
            <h4 className="font-bold text-sm text-[#000] mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#157FE2]" />
              Pourquoi c&apos;est important
            </h4>
            <p className="text-sm text-[#000]/75 leading-relaxed">{t.whyImportant}</p>
          </div>

          {/* Étapes */}
          <div>
            <h4 className="font-bold text-sm text-[#000] mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#157FE2]" />
              Étapes à suivre
            </h4>
            <ol className="space-y-2.5">
              {t.steps.map((step, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-[#157FE2] text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-sm text-[#000]/85 leading-relaxed pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Erreur fréquente */}
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
            <h4 className="font-bold text-xs text-amber-700 mb-1 flex items-center gap-1.5 uppercase tracking-wide">
              <AlertTriangle className="w-3.5 h-3.5" />
              Erreur fréquente
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">{t.commonMistake}</p>
          </div>

          {/* Tutoriels liés */}
          {t.linkedTutorials.length > 0 && (
            <div>
              <h4 className="font-bold text-sm text-[#000] mb-2 flex items-center gap-1.5">
                <ExternalLink className="w-4 h-4 text-[#157FE2]" />
                Tutoriels liés
              </h4>
              <div className="flex flex-col gap-2">
                {t.linkedTutorials.map((tuto) => (
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
          <div className="flex justify-end gap-2">
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
