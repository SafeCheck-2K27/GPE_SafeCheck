import { searchTerms, type LexiqueTerm } from "./data"

export function searchLexiconTerms(query: string): LexiqueTerm[] {
  return searchTerms(query)
}
