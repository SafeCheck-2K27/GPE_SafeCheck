import { tutoriels, type Tutoriel } from "../tutorials/data/catalog"
import type { Niveau, RelatedTutoriel } from "./data"

const LEVEL_LABELS: Record<Tutoriel["level"], Niveau> = {
  Debutant: "Débutant",
  Intermediaire: "Intermédiaire",
  Avance: "Avancé",
}

/** Resolve displayed metadata from the catalog; unknown references have no fallback. */
export function resolveLexiconTutorial({ tutorialId }: RelatedTutoriel) {
  const tutorial = tutoriels.find(({ id }) => id === tutorialId)
  if (!tutorial) return undefined

  return {
    id: tutorial.id,
    title: tutorial.title,
    difficulty: LEVEL_LABELS[tutorial.level],
    duration: tutorial.duration,
  }
}
