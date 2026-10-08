"use client"

import { useI18n } from "./I18nProvider"
import { ScButton } from "./primitives"

export function SessionNotice({ error, retrying, onRetry }: {
  error: boolean
  retrying: boolean
  onRetry: () => Promise<void>
}) {
  const { t } = useI18n()
  if (!error) return null

  return (
    <aside
      aria-label={t("session.title")}
      className="fixed bottom-4 inset-x-4 z-40 mx-auto max-w-xl rounded-xl border border-[color:var(--sc-border-strong)] bg-[color:var(--sc-surface)] p-4 shadow-lg text-[color:var(--sc-text)]"
    >
      <p role="status" className="text-sm leading-relaxed mb-3">
        {retrying ? t("session.retrying") : t("session.failed")}
      </p>
      <ScButton size="sm" variant="secondary" disabled={retrying} onClick={() => { void onRetry() }}>
        {retrying ? t("session.retrying") : t("session.retry")}
      </ScButton>
    </aside>
  )
}
