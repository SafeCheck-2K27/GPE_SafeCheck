import { tutoriels, type Tutoriel } from "../tutorials/data/catalog"
import { assertTutorialProgressVersion, type TutorialProgressDto } from "../tutorials/hydration"
import { getTutorialProgressPercent, getTutorialStatus, normalizeTutorialProgress, type TutorialProgress, type TutorialStatus } from "../tutorials/progress"

export type AccountTutorial = TutorialProgress & {
  tutorialId: number
  slug: string
  title: string
  level: Tutoriel["level"]
  category: Tutoriel["category"]
  duration: string
  totalSteps: number
  percentage: number
  status: TutorialStatus
  updatedAt: string
  action: { label: "Reprendre" | "Revoir"; href: string }
}

export function mapAccountTutorials(snapshots: readonly TutorialProgressDto[]): AccountTutorial[] {
  const items: AccountTutorial[] = []
  for (const snapshot of snapshots) {
    const tutorial = tutoriels.find((candidate) => candidate.id === snapshot.tutorialId)
    if (!tutorial) continue
    assertTutorialProgressVersion(snapshot, tutorial.version)
    const totalSteps = tutorial.steps.length
    const progress = normalizeTutorialProgress(snapshot, totalSteps)!
    const status = getTutorialStatus(progress, totalSteps)
    items.push({
      ...progress,
      tutorialId: tutorial.id, slug: tutorial.slug, title: tutorial.title,
      level: tutorial.level, category: tutorial.category, duration: tutorial.duration,
      totalSteps, status, percentage: getTutorialProgressPercent(progress, totalSteps),
      updatedAt: snapshot.updatedAt,
      action: { label: status === "COMPLETED" ? "Revoir" : "Reprendre", href: `/tutoriels/${tutorial.id}` },
    })
  }
  return items.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
}

export function calculateTutorialCounters(items: readonly AccountTutorial[]) {
  return {
    total: items.length,
    inProgress: items.filter((item) => item.status === "IN_PROGRESS").length,
    completed: items.filter((item) => item.status === "COMPLETED").length,
  }
}
