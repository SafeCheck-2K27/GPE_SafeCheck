"use client"

import { useI18n } from "./I18nProvider"
import { ScButton } from "./primitives"
import type { GuestClaimStatus } from "./guest-claim-recovery"

export function GuestClaimNotice({
  status,
  onRetry,
}: {
  status: GuestClaimStatus
  onRetry: () => Promise<void>
}) {
  const { t } = useI18n()
  if (status === "idle") return null

  return (
    <aside
      aria-label={t("claim.title")}
      className="fixed bottom-4 inset-x-4 z-40 mx-auto max-w-xl rounded-xl border border-[color:var(--sc-border-strong)] bg-[color:var(--sc-surface)] p-4 shadow-lg text-[color:var(--sc-text)]"
    >
      <p role="status" className="text-sm leading-relaxed mb-3">
        {status === "pending" ? t("claim.pending") : t("claim.failed")}
      </p>
      <ScButton size="sm" variant="secondary" disabled={status === "pending"} onClick={() => { void onRetry() }}>
        {status === "pending" ? t("claim.retrying") : t("claim.retry")}
      </ScButton>
    </aside>
  )
}
