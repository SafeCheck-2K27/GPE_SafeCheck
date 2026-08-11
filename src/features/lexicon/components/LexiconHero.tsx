import { BookOpen, GraduationCap, Search, X } from "lucide-react"
import {
  ScBadge,
  ScLinkButton,
} from "@/components/safecheck/primitives"
import { DOMAINS, TERMS } from "../data"

export function LexiconHero({
  search,
  isSearching,
  onSearchChange,
  onSearchReset,
}: {
  search: string
  isSearching: boolean
  onSearchChange: (value: string) => void
  onSearchReset: () => void
}) {
  return (
    <section className="relative overflow-hidden border-b border-[color:var(--sc-border)] sc-mesh-soft">
      <div
        className="pointer-events-none absolute inset-0 sc-dot-texture opacity-50"
        aria-hidden
      />
      <div className="relative max-w-5xl mx-auto px-4 py-12 md:py-16 text-center">
        <ScBadge tone="info" className="mb-4">
          <BookOpen className="w-3 h-3" /> Base de connaissance
        </ScBadge>
        <h1 className="font-display text-3xl md:text-5xl font-bold text-[color:var(--sc-text)] mb-4 text-balance leading-[1.08]">
          Lexique <span className="sc-gradient-text">SafeCheck</span>
        </h1>
        <p className="text-base text-[color:var(--sc-text-2)] leading-relaxed max-w-2xl mx-auto text-pretty">
          Comprenez les mots techniques de la cybersécurité, sans jargon
          inutile. Chaque terme est expliqué simplement, avec un exemple
          concret et les tutoriels SafeCheck pour passer à l'action.
        </p>
        <div className="mt-6 flex items-center justify-center">
          <ScLinkButton variant="ghost" size="sm" href="/tutoriels">
            <GraduationCap className="w-4 h-4" /> Explorer les tutoriels liés
          </ScLinkButton>
        </div>

        <div className="relative max-w-xl mx-auto mt-8">
          <Search className="w-4 h-4 text-[color:var(--sc-text-muted)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Rechercher un terme : phishing, 2FA, VPN, cookie…"
            aria-label="Rechercher un terme dans le lexique"
            className="sc-input w-full pl-11 pr-10 py-3 text-sm shadow-[var(--sc-shadow-sm)]"
          />
          {isSearching && (
            <button
              onClick={onSearchReset}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-[color:var(--sc-text-muted)] hover:text-[color:var(--sc-text)] hover:bg-[color:var(--sc-bg-soft)] transition-colors"
              aria-label="Effacer la recherche"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {!isSearching && (
          <p className="text-xs text-[color:var(--sc-text-muted)] mt-3">
            {TERMS.length} termes · {DOMAINS.length} domaines
          </p>
        )}
      </div>
    </section>
  )
}
