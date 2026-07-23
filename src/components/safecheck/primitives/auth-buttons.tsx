"use client"

/* Google "G" SVG icon (multi-colour brand mark) */
export function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="var(--sc-google-blue)"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.28 1.4-1.1 2.59-2.34 3.39v2.78h3.78c2.21-2.04 3.58-5.06 3.58-8.41z"
      />
      <path
        fill="var(--sc-google-green)"
        d="M12 24c3.16 0 5.81-1.04 7.74-2.85l-3.78-2.94c-1.05.7-2.39 1.12-3.96 1.12-3.04 0-5.62-2.05-6.54-4.81H1.55v3.02C3.47 21.31 7.45 24 12 24z"
      />
      <path
        fill="var(--sc-google-yellow)"
        d="M5.46 14.52a7.21 7.21 0 010-4.55V6.95H1.55a11.97 11.97 0 000 10.59l3.91-3.02z"
      />
      <path
        fill="var(--sc-google-red)"
        d="M12 4.74c1.72 0 3.26.59 4.47 1.74l3.36-3.36C17.81 1.18 15.16 0 12 0 7.45 0 3.47 2.69 1.55 6.6l3.91 3.02c.92-2.76 3.5-4.88 6.54-4.88z"
      />
    </svg>
  )
}

/**
 * GoogleAuthButton - mock OAuth button used by the login modal and the
 * sign-up modal. Visually consistent with the rest of the SafeCheck UI
 * (rounded-lg, soft border, gentle hover lift) so it feels native.
 */
export function GoogleAuthButton({
  label,
  onClick,
  disabled,
}: {
  label: string
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-[color:var(--sc-text)] bg-[color:var(--sc-surface)] border border-[color:var(--sc-border-strong)] hover:border-[color:var(--sc-blue)] hover:bg-[color:var(--sc-bg-soft)]/60 shadow-[0_2px_6px_-2px_rgb(var(--sc-ink-rgb)/0.08)] hover:shadow-[0_8px_22px_-8px_rgb(var(--sc-blue-rgb)/0.30)] hover:-translate-y-0.5 transition-[transform,box-shadow,background,color,border-color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sc-blue)]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sc-bg)] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer"
    >
      <GoogleIcon className="w-4 h-4" />
      {label}
    </button>
  )
}

/**
 * AuthDivider - "ou" / "or" separator used between Google and the email form.
 */
export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-4" role="separator" aria-label={label}>
      <span className="flex-1 h-px bg-[color:var(--sc-border)]" />
      <span className="text-[11px] font-medium uppercase tracking-wider text-[color:var(--sc-text-muted)]">
        {label}
      </span>
      <span className="flex-1 h-px bg-[color:var(--sc-border)]" />
    </div>
  )
}
