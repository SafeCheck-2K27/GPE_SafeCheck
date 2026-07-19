import { X } from "lucide-react"
import { AccessibleModal } from "@/components/safecheck/layout/AccessibleModal"
import { ScBadge, ScButton } from "@/components/safecheck/primitives"
import type { Essential } from "../types"

export function EssentialDetailModal({
  essential,
  onClose,
}: {
  essential: Essential
  onClose: () => void
}) {
  const Icon = essential.icon

  return (
    <AccessibleModal
      open
      onClose={onClose}
      aria-labelledby="essential-detail-title"
      className="px-4 backdrop-blur-none"
    >
      <div
        className="w-full max-w-xl rounded-xl bg-[color:var(--sc-surface)] sc-fade-in max-h-[90vh] overflow-y-auto"
        style={{
          border: "1px solid var(--sc-border)",
          boxShadow: "var(--sc-shadow-md)",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-[color:var(--sc-bg-soft)] flex items-center justify-center">
                <Icon className="w-5 h-5 text-[color:var(--sc-blue)]" />
              </div>
              <div>
                <h3
                  id="essential-detail-title"
                  className="font-extrabold text-lg text-[color:var(--sc-text)]"
                >
                  {essential.title}
                </h3>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <ScBadge
                    tone={
                      essential.importance === "Critique" ? "warn" : "info"
                    }
                  >
                    {essential.importance}
                  </ScBadge>
                  <ScBadge tone="muted">{essential.type}</ScBadge>
                  <ScBadge tone="muted">{essential.difficulty}</ScBadge>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-[color:var(--sc-surface-2)] rounded"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-[color:var(--sc-text)] leading-relaxed mb-3">
            {essential.description}
          </p>
          <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">
            {essential.details}
          </p>
          <div className="mt-6 flex justify-end">
            <ScButton variant="primary" onClick={onClose}>
              Compris
            </ScButton>
          </div>
        </div>
      </div>
    </AccessibleModal>
  )
}
