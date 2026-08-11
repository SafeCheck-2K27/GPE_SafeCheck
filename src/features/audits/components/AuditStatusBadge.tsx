import { CheckCircle2, Sparkles } from "lucide-react"
import { ScBadge } from "@/components/safecheck/primitives"
import { getAuditStatusPresentation } from "../status"
import type { AuditCatalogStatus } from "../types"

export function AuditStatusBadge({
  status,
}: {
  status: AuditCatalogStatus
}) {
  const presentation = getAuditStatusPresentation(status)

  return (
    <ScBadge tone={presentation.badgeTone}>
      {presentation.badgeIcon === "check" && (
        <CheckCircle2 className="w-3 h-3" />
      )}
      {presentation.badgeIcon === "sparkles" && (
        <Sparkles className="w-3 h-3" />
      )}
      {presentation.badgeLabel}
    </ScBadge>
  )
}
