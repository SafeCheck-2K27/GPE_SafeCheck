import { Search } from "lucide-react"
import { ScButton } from "@/components/safecheck/primitives"

export function LexiconNoResults({
  query,
  onReset,
}: {
  query: string
  onReset: () => void
}) {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[color:var(--sc-bg-soft)] text-[color:var(--sc-text-muted)] mb-4">
        <Search className="w-6 h-6" />
      </div>
      <h3 className="font-bold text-lg text-[color:var(--sc-text)] mb-1">
        Aucun résultat pour « {query} »
      </h3>
      <p className="text-sm text-[color:var(--sc-text-2)] max-w-md mx-auto mb-5">
        Vérifiez l'orthographe ou essayez un terme plus général comme « mot de
        passe », « réseau » ou « phishing ».
      </p>
      <ScButton variant="secondary" size="sm" onClick={onReset}>
        Réinitialiser la recherche
      </ScButton>
    </div>
  )
}
