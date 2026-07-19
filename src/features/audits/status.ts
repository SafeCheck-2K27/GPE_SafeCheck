import type {
  AuditCatalogStatus,
  AuditStatusPresentation,
} from "./types"

const AUDIT_STATUS_PRESENTATIONS: Record<
  AuditCatalogStatus,
  AuditStatusPresentation
> = {
  available: {
    badgeTone: "success",
    badgeLabel: "Disponible",
    badgeIcon: "check",
    actionLabel: "Lancer",
    actionVariant: "primary",
    accessibleAction: "Lancer",
  },
  coming: {
    badgeTone: "warn",
    badgeLabel: "Bientôt disponible",
    badgeIcon: null,
    actionLabel: "En savoir plus",
    actionVariant: "secondary",
    accessibleAction: "En savoir plus sur",
  },
  premium: {
    badgeTone: "premium",
    badgeLabel: "Expert · Long terme",
    badgeIcon: "sparkles",
    actionLabel: "En savoir plus",
    actionVariant: "secondary",
    accessibleAction: "En savoir plus sur",
  },
}

export function getAuditStatusPresentation(
  status: AuditCatalogStatus,
): AuditStatusPresentation {
  return AUDIT_STATUS_PRESENTATIONS[status]
}
