import type { Contributor } from "../_data"

function Github({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.92 1.23 3.23 0 4.62-2.8 5.64-5.48 5.94.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.21.7.82.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z" />
    </svg>
  )
}

function Linkedin({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  )
}

export function ContributorCard({ contributor, delay }: { contributor: Contributor; delay: number }) {
  return (
    <article
      className="rounded-xl p-5 bg-[color:var(--sc-surface)] flex flex-col gap-3 sc-fade-in transition-all hover:-translate-y-1"
      style={{ animationDelay: `${delay}ms`, border: "1px solid var(--sc-border)", boxShadow: "var(--sc-shadow)" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-[color:var(--sc-text-on-strong)] shrink-0"
          style={{ background: `linear-gradient(135deg, ${contributor.accent}, ${contributor.accent}aa)` }}
          aria-hidden
        >
          {contributor.initials}
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-sm text-[color:var(--sc-text)] truncate">{contributor.name}</h3>
          <p className="text-xs text-[color:var(--sc-text-muted)] truncate">{contributor.role}</p>
        </div>
      </div>
      <p className="text-xs text-[color:var(--sc-text-2)] leading-relaxed">{contributor.bio}</p>
      <div className="flex flex-wrap gap-1.5">
        {contributor.contribution.map((tag) => (
          <span key={tag} className="inline-flex items-center text-[10px] px-2 py-0.5 rounded bg-[color:var(--sc-bg-soft)] text-[color:var(--sc-blue-ink)] font-semibold">
            {tag}
          </span>
        ))}
      </div>
      {(contributor.github || contributor.linkedin) && (
        <div className="flex items-center gap-2 pt-2 border-t border-[color:var(--sc-border)]">
          {contributor.github && (
            <a href={contributor.github} target="_blank" rel="noreferrer noopener" className="p-1.5 rounded hover:bg-[color:var(--sc-bg-soft)] transition-colors" aria-label={`GitHub de ${contributor.name}`}>
              <Github className="w-4 h-4 text-[color:var(--sc-text)]" />
            </a>
          )}
          {contributor.linkedin && (
            <a href={contributor.linkedin} target="_blank" rel="noreferrer noopener" className="p-1.5 rounded hover:bg-[color:var(--sc-bg-soft)] transition-colors" aria-label={`LinkedIn de ${contributor.name}`}>
              <Linkedin className="w-4 h-4 text-[color:var(--sc-blue)]" />
            </a>
          )}
        </div>
      )}
    </article>
  )
}
