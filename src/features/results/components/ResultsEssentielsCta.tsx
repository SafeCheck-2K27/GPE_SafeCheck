import { ArrowRight, Sparkles } from 'lucide-react'
import { ScButton, ScCard } from '@/components/safecheck/primitives'
import type { ScoreCategorie } from '../categoryScoring'

/*
   Passerelle du résultat vers l'action (SC-020).

   Le diagnostic n'a de valeur que s'il débouche sur quelque chose : ce
   bloc renvoie vers les Essentiels, qui sont le catalogue d'actions
   concrètes. Quand un point faible ressort de l'audit, on le nomme pour
   que le lien ait un sens plutôt que d'être un bouton générique.
 */

export function ResultsEssentielsCta({
  pointsFaibles,
  onOpenEssentiels,
}: {
  pointsFaibles: ScoreCategorie[]
  onOpenEssentiels: () => void
}) {
  const prioritaire = pointsFaibles[0]

  return (
    <ScCard className="p-5">
      <h2 className="font-bold text-base text-[color:var(--sc-text)] mb-1 font-display flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[color:var(--sc-blue)]" />
        Passer à l&apos;action
      </h2>
      <p className="text-sm text-[color:var(--sc-text-2)] mb-4">
        {prioritaire
          ? `Ton thème le plus fragile est « ${prioritaire.categorie} ». Les Essentiels regroupent les actions les plus rentables pour le corriger : 20 % des efforts, 80 % de la sécurité.`
          : "Les Essentiels regroupent les actions de sécurité les plus rentables : 20 % des efforts pour 80 % de la protection."}
      </p>
      <ScButton variant="primary" size="lg" className="w-full sm:w-auto" onClick={onOpenEssentiels}>
        Voir les Essentiels
        <ArrowRight className="w-4 h-4" />
      </ScButton>
    </ScCard>
  )
}
