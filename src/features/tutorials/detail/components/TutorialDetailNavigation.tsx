import Link from "next/link"
import { ScButton } from "@/components/safecheck/primitives"
import { ChevronLeft, ChevronRight, Shield } from "lucide-react"

export function TutorialDetailBreadcrumb({ title }: { title: string }) {
  return (
    <nav
      aria-label="Fil d'Ariane"
      className="flex items-center gap-2 text-xs text-[color:var(--sc-text-muted)] mb-5"
    >
      <Link
        href="/tutoriels"
        className="hover:text-[color:var(--sc-blue)] transition-colors"
      >
        Tutoriels
      </Link>
      <ChevronRight className="w-3 h-3" />
      <span className="text-[color:var(--sc-text-2)] truncate max-w-xs">
        {title}
      </span>
    </nav>
  )
}

export function TutorialDetailNotFound({ onBack }: { onBack: () => void }) {
  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 flex flex-col items-center justify-center text-center">
      <Shield className="w-12 h-12 text-[color:var(--sc-text-muted)] mb-4 opacity-40" />
      <h1 className="text-2xl font-bold text-[color:var(--sc-text)] mb-2">
        Tutoriel introuvable
      </h1>
      <p className="text-sm text-[color:var(--sc-text-muted)] mb-6">
        Ce tutoriel n&apos;existe pas ou a ete deplace.
      </p>
      <ScButton variant="primary" size="sm" onClick={onBack}>
        <ChevronLeft className="w-3.5 h-3.5" />
        Retour aux tutoriels
      </ScButton>
    </main>
  )
}
