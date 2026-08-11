import { DOMAINS, getTerm, type DomainId, type LexiqueTerm } from "./data"

export function parseLexiconDomain(value: string | null): DomainId | null {
  if (!value) return null
  return DOMAINS.some((domain) => domain.id === value)
    ? (value as DomainId)
    : null
}

export function resolveLexiconTerm(slug: string | null): LexiqueTerm | null {
  return slug ? getTerm(slug) ?? null : null
}
