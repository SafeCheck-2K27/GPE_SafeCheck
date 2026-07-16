"use client"

import { useState } from "react"
import Link from "next/link"
import { BookText, Hash } from "lucide-react"
import {
  getInlineLexiqueDefinition,
  getTerm,
  INLINE_LEXIQUE_TERMS,
} from "@/lib/lexique-data"
import { TUTORIAL_DETAIL_LEXICON_TAGS } from "../data"

function TutorialLexiconTooltip({
  text,
  term,
}: {
  text: string
  term: string
}) {
  const [open, setOpen] = useState(false)
  const definition = getInlineLexiqueDefinition(term)

  if (!definition) return <span>{text}</span>

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="underline decoration-dotted underline-offset-2 decoration-[color:var(--sc-blue)]/60 text-[color:var(--sc-blue)] hover:decoration-solid cursor-help transition-all"
        aria-label={`Definition de ${term}`}
      >
        {text}
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-0 mb-2 z-50 w-64 rounded-xl border border-[color:var(--sc-border)] bg-[color:var(--sc-surface)] shadow-[var(--sc-shadow-md)] p-3 text-left pointer-events-none"
        >
          <span className="block text-[10px] font-bold text-[color:var(--sc-blue)] uppercase tracking-wider mb-1">
            Lexique SafeCheck
          </span>
          <span className="block text-xs text-[color:var(--sc-text-2)] leading-relaxed">
            {definition}
          </span>
        </span>
      )}
    </span>
  )
}

export function TutorialTextWithLexicon({ text }: { text: string }) {
  const terms = [...INLINE_LEXIQUE_TERMS]
  const sortedTerms = [...terms].sort((a, b) => b.length - a.length)
  const pattern = sortedTerms
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")
  const parts = text.split(new RegExp(`(${pattern})`, "gi"))

  return (
    <>
      {parts.map((part, index) => {
        const matchedTerm = sortedTerms.find(
          (term) => term.toLowerCase() === part.toLowerCase(),
        )

        if (matchedTerm) {
          return (
            <TutorialLexiconTooltip
              key={index}
              text={part}
              term={matchedTerm}
            />
          )
        }

        return <span key={index}>{part}</span>
      })}
    </>
  )
}

export function TutorialLexiconTags({ text }: { text: string }) {
  const haystack = text.toLowerCase()
  const matches = TUTORIAL_DETAIL_LEXICON_TAGS.flatMap((tag) => {
    const lexiqueTerm = getTerm(tag.slug)
    const matchesText = tag.patterns.some((pattern) =>
      haystack.includes(pattern),
    )

    return lexiqueTerm && matchesText
      ? [{ ...tag, label: lexiqueTerm.nom }]
      : []
  }).slice(0, 5)

  if (matches.length === 0) return null

  return (
    <div className="mt-4 pt-4 border-t border-[color:var(--sc-border)]">
      <div className="flex items-center gap-1.5 mb-2.5">
        <BookText className="w-3.5 h-3.5 text-[color:var(--sc-blue)]" />
        <span className="text-[11px] font-bold text-[color:var(--sc-blue)] uppercase tracking-wider">
          Termes du lexique
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {matches.map((tag) => (
          <Link
            key={tag.slug}
            href={`/lexique?terme=${tag.slug}`}
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold bg-[color:var(--sc-bg-soft)] text-[color:var(--sc-text-2)] border border-[color:var(--sc-border)] hover:border-[color:var(--sc-blue)]/45 hover:text-[color:var(--sc-blue)] transition-colors"
          >
            <Hash className="w-3 h-3 opacity-60" />
            {tag.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
