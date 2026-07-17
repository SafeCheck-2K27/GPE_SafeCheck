"use client"

import { useState, type ReactNode } from "react"
import { AccessibleModal } from "@/components/safecheck/layout/AccessibleModal"
import { ScButton } from "@/components/safecheck/primitives"
import { ArrowRight, Check, CheckCircle2, Flag, X } from "lucide-react"
import { PRECISION_LABELS } from "../data"
import type { PrecisionType } from "../types"

export function TutorialPrecisionModal({
  onClose,
  stepTitle,
  submitIcon,
}: {
  onClose: () => void
  stepTitle?: string
  submitIcon?: ReactNode
}) {
  const [type, setType] = useState<PrecisionType | "">("")
  const [message, setMessage] = useState("")
  const [anonymous, setAnonymous] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSend = () => {
    if (!type || !message.trim()) return
    setSent(true)
  }

  return (
    <AccessibleModal
      open
      onClose={onClose}
      zIndex={60}
      aria-labelledby="tutorial-precision-title"
      className="bg-black/40 p-4"
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden bg-[color:var(--sc-surface)] border border-[color:var(--sc-border)] shadow-[var(--sc-shadow-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 border-b border-[color:var(--sc-border)] bg-[color:var(--sc-bg-soft)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Flag className="w-4 h-4 text-[color:var(--sc-blue)]" />
              <span
                id="tutorial-precision-title"
                className="text-sm font-bold text-[color:var(--sc-text)]"
              >
                Apporter une precision
              </span>
            </div>
            {stepTitle && (
              <p className="text-xs text-[color:var(--sc-text-muted)]">
                Etape : <span className="font-medium text-[color:var(--sc-text-2)]">{stepTitle}</span>
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[color:var(--sc-surface)] rounded-lg transition-colors" aria-label="Fermer">
            <X className="w-4 h-4 text-[color:var(--sc-text-muted)]" />
          </button>
        </div>

        {sent ? (
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[color:var(--sc-success)]/10 border border-[color:var(--sc-success)]/30 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-[color:var(--sc-success)]" />
            </div>
            <div>
              <p className="font-bold text-[color:var(--sc-text)] mb-2">Precision envoyee</p>
              <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed max-w-xs">
                Merci, votre precision a ete envoyee. Elle pourra etre relue avant publication.
              </p>
            </div>
            <ScButton variant="secondary" size="sm" onClick={onClose}>Fermer</ScButton>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[color:var(--sc-text)] mb-2">
                Type de retour <span className="text-[color:var(--sc-error)]">*</span>
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {(Object.entries(PRECISION_LABELS) as [PrecisionType, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setType(key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-left transition-all border ${ type === key ? "bg-[color:var(--sc-blue)]/10 border-[color:var(--sc-blue)]/50 text-[color:var(--sc-blue)]" : "bg-[color:var(--sc-bg-soft)] border-[color:var(--sc-border)] text-[color:var(--sc-text-2)] hover:border-[color:var(--sc-blue)]/30" }`}
                  >
                    <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${type === key ? "border-[color:var(--sc-blue)] bg-[color:var(--sc-blue)]" : "border-[color:var(--sc-border-strong)]"}`}>
                      {type === key && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
                    </span>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[color:var(--sc-text)] mb-2">
                Message <span className="text-[color:var(--sc-error)]">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Decrivez la precision que vous souhaitez apporter..."
                rows={3}
                className="w-full rounded-xl border border-[color:var(--sc-border)] bg-[color:var(--sc-bg-soft)] px-3 py-2 text-sm text-[color:var(--sc-text)] placeholder:text-[color:var(--sc-text-muted)] focus:outline-none focus:border-[color:var(--sc-blue)]/60 focus:ring-1 focus:ring-[color:var(--sc-blue)]/20 resize-none transition-all"
              />
            </div>
            <button
              type="button"
              onClick={() => setAnonymous(!anonymous)}
              className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${anonymous ? "bg-[color:var(--sc-surface-2)] border-[color:var(--sc-border-strong)] text-[color:var(--sc-text)]" : "bg-[color:var(--sc-bg-soft)] border-[color:var(--sc-border)] text-[color:var(--sc-text-2)] hover:border-[color:var(--sc-border-strong)]"}`}
            >
              <span className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${anonymous ? "bg-[color:var(--sc-blue)] border-[color:var(--sc-blue)]" : "border-[color:var(--sc-border-strong)] bg-transparent"}`}>
                {anonymous && <Check className="w-3 h-3 text-white" />}
              </span>
              Envoyer anonymement
            </button>
            <ScButton
              variant="primary"
              size="sm"
              onClick={handleSend}
              disabled={!type || !message.trim()}
              className="w-full"
            >
              {submitIcon ?? <ArrowRight className="w-3.5 h-3.5" />}
              Envoyer la precision
            </ScButton>
          </div>
        )}
      </div>
    </AccessibleModal>
  )
}
