import { ArrowRight, Check, Info } from "lucide-react"
import { ScButton } from "@/components/safecheck/primitives"
import { auditQualificationFacts } from "../mock-data"

const auditInfoCardClassName =
  "rounded-2xl p-5 border bg-[rgba(37,99,235,0.04)] border-[rgba(37,99,235,0.18)] shadow-[var(--sc-shadow-sm)]"

export function ResultsAuditInfo({
  onBrowseAudits,
}: {
  onBrowseAudits: () => void
}) {
  return (
    <div className={auditInfoCardClassName}>
      <div className="flex items-center gap-2 mb-3">
        <span
          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-white"
          style={{ background: "var(--sc-blue)" }}
        >
          <Info className="w-3.5 h-3.5" />
        </span>
        <h2 className="font-bold text-sm text-[color:var(--sc-text)]">
          Audit rapide ≠ audit complet
        </h2>
      </div>
      <ul className="space-y-1.5 mb-4">
        {auditQualificationFacts.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-sm text-[color:var(--sc-text-2)]"
          >
            <Check className="w-3.5 h-3.5 text-[color:var(--sc-blue)] mt-0.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
      <ScButton variant="secondary" size="sm" onClick={onBrowseAudits}>
        Voir les autres niveaux d&apos;audit
        <ArrowRight className="w-3.5 h-3.5 ml-1" />
      </ScButton>
    </div>
  )
}
