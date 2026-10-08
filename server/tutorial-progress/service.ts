import { tutoriels } from "../../src/lib/tutoriels-data"
import { prisma } from "../../src/lib/prisma"
import type { VersionedTutorialProgress } from "./contract"

export class TutorialVersionConflict extends Error {
  constructor() { super("Incompatible tutorial progress version") }
}

const progressFields = {
  tutorialId: true,
  tutorialVersion: true,
  currentStep: true,
  completedSteps: true,
  createdAt: true,
  updatedAt: true,
} as const

export function listTutorialProgress(userId: string) {
  return prisma.userTutorialProgress.findMany({
    where: { userId },
    select: progressFields,
    orderBy: [{ updatedAt: "desc" }, { tutorialId: "asc" }],
  })
}

export async function saveTutorialProgress(userId: string, tutorialId: number, progress: VersionedTutorialProgress) {
  const tutorial = tutoriels.find((candidate) => candidate.id === tutorialId)
  if (!tutorial || progress.tutorialVersion !== tutorial.version) throw new TutorialVersionConflict()
  const where = { userId_tutorialId: { userId, tutorialId } }
  const data = { currentStep: progress.currentStep, completedSteps: [...progress.completedSteps] }
  const write = (allowCreate: boolean) => prisma.$transaction(async (tx) => {
    // The version predicate and row lock prevent a concurrent incompatible row
    // from being overwritten. Full snapshots still replace matching versions.
    const updated = await tx.userTutorialProgress.updateMany({
      where: { userId, tutorialId, tutorialVersion: progress.tutorialVersion }, data,
    })
    if (updated.count > 0) return tx.userTutorialProgress.findUniqueOrThrow({ where, select: progressFields })
    if (!allowCreate) throw new TutorialVersionConflict()
    return tx.userTutorialProgress.create({
      data: { userId, tutorialId, tutorialVersion: progress.tutorialVersion, ...data }, select: progressFields,
    })
  })
  try {
    return await write(true)
  } catch (error) {
    // A first insertion can race or hit an existing older version. Retry only
    // the conditional update; never reset that existing row's version.
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return write(false)
    }
    throw error
  }
}
