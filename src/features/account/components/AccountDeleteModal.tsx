import { ScButton } from "@/components/safecheck/primitives"
import { AccessibleModal } from "@/components/safecheck/layout/AccessibleModal"
import { AlertTriangle } from "lucide-react"

export function AccountDeleteModal({
  onConfirm,
  onClose,
}: {
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <AccessibleModal
      open
      onClose={onClose}
      role="alertdialog"
      aria-labelledby="account-delete-title"
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 sc-fade-in bg-[color:var(--sc-surface)] border border-[color:var(--sc-border)] shadow-[var(--sc-shadow-lg)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[rgb(var(--sc-danger-rgb)/0.12)] text-[color:var(--sc-danger)]">
            <AlertTriangle className="w-5 h-5" />
          </span>
          <h2
            id="account-delete-title"
            className="font-display font-semibold text-base text-[color:var(--sc-text)]"
          >
            Confirmer la suppression
          </h2>
        </div>
        <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed mb-5">
          Es-tu vraiment sûr·e de vouloir supprimer ton compte&nbsp;? Cette
          action est irréversible et tu perdras toute ta progression.
        </p>
        <div className="flex gap-3">
          <ScButton
            variant="danger"
            size="md"
            onClick={onConfirm}
            className="flex-1"
          >
            Oui, supprimer
          </ScButton>
          <ScButton
            variant="secondary"
            size="md"
            onClick={onClose}
            className="flex-1"
          >
            Annuler
          </ScButton>
        </div>
      </div>
    </AccessibleModal>
  )
}
