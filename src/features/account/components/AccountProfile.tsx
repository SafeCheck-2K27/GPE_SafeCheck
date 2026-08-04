import type { Dispatch, SetStateAction } from "react"
import { ScButton } from "@/components/safecheck/primitives"
import {
  AlertTriangle,
  Check,
  Edit2,
  Lock,
  Trash2,
} from "lucide-react"
import type { AccountForm, AccountFormSetter } from "../types"
import { AccountSectionCard } from "./AccountSectionCard"

export function AccountProfile({
  form,
  setForm,
  editMode,
  setEditMode,
  showPasswordChange,
  setShowPasswordChange,
  onDeleteRequest,
}: {
  form: AccountForm
  setForm: AccountFormSetter
  editMode: boolean
  setEditMode: Dispatch<SetStateAction<boolean>>
  showPasswordChange: boolean
  setShowPasswordChange: Dispatch<SetStateAction<boolean>>
  onDeleteRequest: () => void
}) {
  return (
    <div className="grid gap-6 sc-fade-in">
      <AccountSectionCard
        icon={Edit2}
        title="Informations personnelles"
        description="Ces informations restent privées et ne sont jamais partagées."
        action={
          !editMode ? (
            <ScButton variant="primary" size="sm" onClick={() => setEditMode(true)}>
              <Edit2 className="w-3.5 h-3.5" />
              Modifier
            </ScButton>
          ) : (
            <div className="flex gap-2">
              <ScButton variant="primary" size="sm" onClick={() => setEditMode(false)}>
                <Check className="w-3.5 h-3.5" /> Sauvegarder
              </ScButton>
              <ScButton variant="secondary" size="sm" onClick={() => setEditMode(false)}>
                Annuler
              </ScButton>
            </div>
          )
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {[
            { label: "Nom de famille", value: form.nom, field: "nom" },
            { label: "Profession", value: form.profession, field: "profession" },
            { label: "Prénom", value: form.prenom, field: "prenom" },
            { label: "Langue", value: form.langue, field: "langue" },
            { label: "Email", value: form.email, field: "email" },
            { label: "Pays", value: form.pays, field: "pays" },
            { label: "Âge", value: form.age, field: "age" },
            { label: "Mot de passe", value: form.motDePasse, field: "motDePasse" },
          ].map((item) => (
            <div key={item.field} className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--sc-text-muted)]">
                {item.label}
              </label>
              {editMode && item.field !== "motDePasse" ? (
                <input
                  type="text"
                  value={(form as unknown as Record<string, string>)[item.field]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [item.field]: e.target.value }))}
                  className="sc-input px-3 py-2 text-sm"
                />
              ) : (
                <span className="text-sm text-[color:var(--sc-text)] py-2">{item.value}</span>
              )}
            </div>
          ))}
        </div>
      </AccountSectionCard>

      <AccountSectionCard
        icon={Lock}
        title="Sécurité du compte"
        description="Mets à jour ton mot de passe régulièrement pour renforcer ta sécurité."
        action={
          !showPasswordChange && (
            <ScButton variant="primary" size="sm" onClick={() => setShowPasswordChange(true)}>
              Changer de mot de passe
            </ScButton>
          )
        }
      >
        {showPasswordChange ? (
          <div className="flex flex-col gap-2.5 max-w-md">
            <input type="password" placeholder="Mot de passe actuel" className="sc-input px-3 py-2.5 text-sm" />
            <input type="password" placeholder="Nouveau mot de passe" className="sc-input px-3 py-2.5 text-sm" />
            <input type="password" placeholder="Confirmer le nouveau mot de passe" className="sc-input px-3 py-2.5 text-sm" />
            <div className="flex gap-2 mt-1">
              <ScButton variant="primary" size="sm" onClick={() => setShowPasswordChange(false)}>
                <Check className="w-3.5 h-3.5" /> Confirmer
              </ScButton>
              <ScButton variant="secondary" size="sm" onClick={() => setShowPasswordChange(false)}>Annuler</ScButton>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">
            Ton mot de passe a été modifié pour la dernière fois il y a <span className="font-semibold text-[color:var(--sc-text)]">3 mois</span>. Pense à le renouveler régulièrement.
          </p>
        )}
      </AccountSectionCard>

      <section className="rounded-2xl overflow-hidden border border-[color:var(--sc-danger)]/30 bg-[color:var(--sc-surface)] shadow-[var(--sc-shadow-sm)]">
        <header className="flex items-start justify-between gap-4 px-5 md:px-6 py-4 bg-[rgba(239,68,68,0.06)] border-b border-[color:var(--sc-danger)]/20">
          <div className="flex items-start gap-3">
            <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[rgba(239,68,68,0.12)] text-[color:var(--sc-danger)] border border-[color:var(--sc-danger)]/25">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-display font-bold text-[15px] text-[color:var(--sc-danger)] tracking-tight">Zone dangereuse</h3>
              <p className="text-[12.5px] text-[color:var(--sc-text-muted)] mt-0.5">Cette action est irréversible.</p>
            </div>
          </div>
          <ScButton variant="danger" size="sm" onClick={onDeleteRequest}>
            <Trash2 className="w-3.5 h-3.5" /> Supprimer mon compte
          </ScButton>
        </header>
        <div className="p-5 md:p-6">
          <p className="text-sm text-[color:var(--sc-text-2)] leading-relaxed">
            En supprimant ton compte, toutes tes données, badges, audits et progression seront définitivement effacés. Tu peux également exporter tes données avant suppression depuis l&apos;onglet Historique &amp; activité.
          </p>
        </div>
      </section>
    </div>
  )
}
