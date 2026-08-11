export function PageSuspenseFallback({
  label = "Chargement de la page",
}: {
  label?: string
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-screen flex items-center justify-center bg-[color:var(--sc-bg)]"
    >
      <span
        aria-hidden
        className="w-8 h-8 rounded-full border-2 border-[color:var(--sc-blue)] border-t-transparent animate-spin"
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}
