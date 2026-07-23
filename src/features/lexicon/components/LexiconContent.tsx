"use client"

import { useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import Footer from "@/components/safecheck/Footer"
import Navbar from "@/components/safecheck/Navbar"
import { PageShell } from "@/components/safecheck/layout/PageShell"
import { getTerm, type DomainId, type LexiqueTerm } from "../data"
import { filterLexiconTermsByDomain } from "../filters"
import { searchLexiconTerms } from "../search"
import { parseLexiconDomain, resolveLexiconTerm } from "../utils"
import { LexiconBrowser } from "./LexiconBrowser"
import { LexiconHero } from "./LexiconHero"
import { LexiconTermDetailModal } from "./LexiconTermDetailModal"

export function LexiconContent() {
  const params = useSearchParams()
  const [search, setSearch] = useState("")
  const [activeDomain, setActiveDomain] = useState<DomainId | null>(() =>
    parseLexiconDomain(params.get("domaine")),
  )
  const [selected, setSelected] = useState<LexiqueTerm | null>(() =>
    resolveLexiconTerm(params.get("terme")),
  )

  const isSearching = search.trim().length > 0
  const searchResults = useMemo(
    () => (isSearching ? searchLexiconTerms(search) : []),
    [search, isSearching],
  )
  const domainTerms = useMemo(
    () => filterLexiconTermsByDomain(activeDomain),
    [activeDomain],
  )

  const selectRelatedTerm = (slug: string) => {
    const term = getTerm(slug)
    if (term) setSelected(term)
  }

  return (
    <PageShell>
      <Navbar signupHref="/compte/creer" />

      <main className="flex-1">
        <LexiconHero
          search={search}
          isSearching={isSearching}
          onSearchChange={setSearch}
          onSearchReset={() => setSearch("")}
        />
        <LexiconBrowser
          search={search}
          searchResults={searchResults}
          activeDomain={activeDomain}
          domainTerms={domainTerms}
          onSearchReset={() => setSearch("")}
          onSelectDomain={setActiveDomain}
          onSelectTerm={setSelected}
        />
      </main>

      <Footer />

      {selected && (
        <LexiconTermDetailModal
          term={selected}
          onClose={() => setSelected(null)}
          onRelatedTerm={selectRelatedTerm}
        />
      )}
    </PageShell>
  )
}
