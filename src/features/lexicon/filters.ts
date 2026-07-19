import {
  getTermsByDomain,
  type DomainId,
  type LexiqueTerm,
} from "./data"

export function filterLexiconTermsByDomain(
  domainId: DomainId | null,
): LexiqueTerm[] {
  return domainId ? getTermsByDomain(domainId) : []
}
