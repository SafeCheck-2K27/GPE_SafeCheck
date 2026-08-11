export function AuditLevelTag({ level }: { level: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider text-[color:var(--sc-blue)] bg-[color:var(--sc-blue)]/10 border border-[color:var(--sc-blue)]/25">
      {level}
    </span>
  )
}
