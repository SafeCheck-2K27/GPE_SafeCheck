import "dotenv/config"
import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { after, beforeEach, describe, test } from "node:test"

describe("Prisma persists user tutorial progress and enforces ownership constraints", { skip: !process.env.DATABASE_URL }, async () => {
  const { prisma } = await import("../../src/lib/prisma")
  const userIds = [randomUUID(), randomUUID()]
  after(async () => {
    try {
      // Delete only this test's users; their progress is removed by the FK cascade.
      await prisma.user.deleteMany({ where: { id: { in: userIds } } })
      assert.equal(await prisma.userTutorialProgress.count({ where: { userId: { in: userIds } } }), 0)
    } finally {
      await prisma.$disconnect()
    }
  })

  // Each behavior starts with its own rows, including when selected by name.
  beforeEach(async () => {
    await prisma.user.deleteMany({ where: { id: { in: userIds } } })
    for (const id of userIds) {
      await prisma.user.create({ data: { id, email: `tutorial-progress-${id}@example.test`, name: "Tutorial Progress Test" } })
    }
  })
  const [userA, userB] = userIds
  const key = { userId_tutorialId: { userId: userA, tutorialId: 1 } }

  const seedProgress = (userId = userA, tutorialId = 1, completedSteps = [0, 1]) =>
    prisma.userTutorialProgress.create({ data: { userId, tutorialId, currentStep: 2, completedSteps } })

  await test("create stores the resume position and integer list", async () => {
    const progress = await prisma.userTutorialProgress.create({
      data: { userId: userA, tutorialId: 1, currentStep: 2, completedSteps: [0, 1] },
    })
    assert.equal(progress.currentStep, 2)
    assert.deepEqual(progress.completedSteps, [0, 1])
    assert.ok(progress.createdAt instanceof Date)
    assert.ok(progress.updatedAt instanceof Date)
  })

  await test("read resolves the composite key and the User relation", async () => {
    await seedProgress()
    const progress = await prisma.userTutorialProgress.findUniqueOrThrow({
      where: key, include: { user: { select: { id: true, email: true } } },
    })
    assert.equal(progress.userId, userA)
    assert.equal(progress.tutorialId, 1)
    assert.equal(progress.currentStep, 2)
    assert.deepEqual(progress.completedSteps, [0, 1])
    assert.equal(progress.user.id, userA)
    assert.equal(progress.user.email, `tutorial-progress-${userA}@example.test`)
  })

  await test("update replaces validations and maintains timestamps through Prisma", async () => {
    await seedProgress()
    const oldDate = new Date("2000-01-01T00:00:00.000Z")
    const before = await prisma.userTutorialProgress.update({ where: key, data: { updatedAt: oldDate } })
    const updated = await prisma.userTutorialProgress.update({
      where: key, data: { currentStep: 3, completedSteps: [0, 2] },
    })
    assert.equal(updated.currentStep, 3)
    assert.deepEqual(updated.completedSteps, [0, 2])
    assert.equal(updated.createdAt.getTime(), before.createdAt.getTime())
    assert.ok(updated.updatedAt.getTime() > oldDate.getTime())
  })

  await test("composite uniqueness rejects a second row for the same User and tutorial", async () => {
    await seedProgress()
    await assert.rejects(
      prisma.userTutorialProgress.create({ data: { userId: userA, tutorialId: 1 } }),
      (error: unknown) => typeof error === "object" && error !== null && "code" in error && error.code === "P2002",
    )
    assert.equal(await prisma.userTutorialProgress.count({ where: { userId: userA, tutorialId: 1 } }), 1)
  })

  await test("one User can have multiple tutorials with empty progress defaults", async () => {
    await seedProgress()
    const progress = await prisma.userTutorialProgress.create({ data: { userId: userA, tutorialId: 2 } })
    assert.equal(progress.currentStep, 0)
    assert.deepEqual(progress.completedSteps, [])
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userA }, include: { tutorialProgress: { orderBy: { tutorialId: "asc" } } },
    })
    assert.deepEqual(user.tutorialProgress.map((item) => item.tutorialId), [1, 2])
  })

  await test("different Users can each track the same tutorial independently", async () => {
    await seedProgress(userA, 1, [0, 2])
    const progress = await prisma.userTutorialProgress.create({ data: { userId: userB, tutorialId: 1 } })
    assert.equal(progress.currentStep, 0)
    assert.deepEqual(progress.completedSteps, [])
    assert.equal(await prisma.userTutorialProgress.count({ where: { userId: { in: userIds }, tutorialId: 1 } }), 2)
    assert.deepEqual((await prisma.userTutorialProgress.findUniqueOrThrow({ where: key })).completedSteps, [0, 2])
  })

  await test("deleting a User cascades only that User's progress", async () => {
    await seedProgress()
    await seedProgress(userB)
    await prisma.user.delete({ where: { id: userA } })
    assert.equal(await prisma.userTutorialProgress.count({ where: { userId: userA } }), 0)
    assert.equal(await prisma.userTutorialProgress.count({ where: { userId: userB } }), 1)
  })
})
