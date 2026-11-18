import "dotenv/config"
import assert from "node:assert/strict"
import { randomBytes, randomUUID } from "node:crypto"
import { after, beforeEach, describe, test } from "node:test"
import { cleanupIntegration, createIntegrationApp, signupSession } from "../helpers/integration"
import { tutoriels } from "../../src/lib/tutoriels-data"

describe("Tutorial progress API validates snapshots and isolates Better Auth users", { skip: !process.env.DATABASE_URL || !process.env.BETTER_AUTH_SECRET || !process.env.BETTER_AUTH_URL || !process.env.WEB_ORIGIN }, async () => {
  const { app, prisma } = await createIntegrationApp()
  const { Prisma } = await import("../../src/generated/prisma/client")
  const emails = [`tutorial-api-a-${randomUUID()}@example.test`, `tutorial-api-b-${randomUUID()}@example.test`]
  const password = `${randomBytes(20).toString("base64url")}Aa1!`
  const origin = process.env.WEB_ORIGIN
  after(async () => {
    try {
      const users = await prisma.user.findMany({ where: { email: { in: emails } }, select: { id: true } })
      await prisma.user.deleteMany({ where: { email: { in: emails } } })
      assert.equal(await prisma.userTutorialProgress.count({ where: { userId: { in: users.map((user) => user.id) } } }), 0)
    } finally {
      await cleanupIntegration({ app, prisma, emails })
    }
  })

  const signup = (email: string) => signupSession(app, { email, password, name: "Tutorial API Test" })

  const cookieA = await signup(emails[0])
  const cookieB = await signup(emails[1])
  const userA = await prisma.user.findUniqueOrThrow({ where: { email: emails[0] } })
  const userB = await prisma.user.findUniqueOrThrow({ where: { email: emails[1] } })
  const userIds = [userA.id, userB.id]
  const base = "/me/tutorial-progress"
  const totalSteps = tutoriels.find((tutorial) => tutorial.id === 1)!.steps.length
  const progressKey = { userId_tutorialId: { userId: userA.id, tutorialId: 1 } }
  const valid = { tutorialVersion: 1, currentStep: 2, completedSteps: [0, 1] }
  const publicKeys = ["tutorialId", "tutorialVersion", "currentStep", "completedSteps", "createdAt", "updatedAt"].sort()
  const unauthenticated = { code: "UNAUTHENTICATED", message: "Authentication required" }
  const put = (id: number | string, payload: object, cookie = cookieA) => app.inject({
    method: "PUT", url: `${base}/${id}`, headers: { cookie, origin }, payload,
  })
  const rows = () => prisma.userTutorialProgress.findMany({
    where: { userId: { in: userIds } }, orderBy: [{ userId: "asc" }, { tutorialId: "asc" }],
  })
  function assertDto(item: Record<string, unknown>) {
    assert.deepEqual(Object.keys(item).sort(), publicKeys)
    assert.equal(typeof item.createdAt, "string")
    assert.equal(typeof item.updatedAt, "string")
    assert.equal(new Date(item.createdAt as string).toISOString(), item.createdAt)
    assert.equal(new Date(item.updatedAt as string).toISOString(), item.updatedAt)
  }

  // Sharing authenticated identities is setup; persisted progress belongs to each behavior.
  beforeEach(() => prisma.userTutorialProgress.deleteMany({ where: { userId: { in: userIds } } }))
  const seedProgress = (completedSteps = [0, 1], currentStep = 2) =>
    prisma.userTutorialProgress.create({ data: { userId: userA.id, tutorialId: 1, ...valid, currentStep, completedSteps } })

  await test("GET requires a valid session, including for a signed guest cookie", async () => {
    for (const cookie of [undefined, `safecheck_guest=${app.signCookie(randomUUID())}`, "better-auth.session_token=invalid"]) {
      const response = await app.inject({ method: "GET", url: base, headers: cookie ? { cookie } : {} })
      assert.equal(response.statusCode, 401)
      assert.deepEqual(response.json(), unauthenticated)
      assert.equal(response.headers["set-cookie"], undefined)
      assert.equal(response.headers["cache-control"], "no-store")
    }
  })

  await test("PUT rejects guests before parsing the body and creates no progress cookie", async () => {
    await seedProgress()
    const before = await rows()
    for (const cookie of [undefined, `safecheck_guest=${app.signCookie(randomUUID())}`, "better-auth.session_token=invalid"]) {
      for (const payload of [JSON.stringify(valid), "{invalid-json"]) {
        const response = await app.inject({
          method: "PUT", url: `${base}/1`,
          headers: { ...(cookie ? { cookie } : {}), "content-type": "application/json" }, payload,
        })
        assert.equal(response.statusCode, 401)
        assert.deepEqual(response.json(), unauthenticated)
        assert.equal(response.headers["set-cookie"], undefined)
      }
    }
    assert.deepEqual(await rows(), before)
  })

  await test("a signed-in user with no progress gets an empty list", async () => {
    for (const cookie of [cookieA, cookieB]) {
      const response = await app.inject({ method: "GET", url: base, headers: { cookie } })
      assert.equal(response.statusCode, 200)
      assert.deepEqual(response.json(), { items: [] })
    }
  })

  await test("PUT creates the progress for the session owner in PostgreSQL", async () => {
    const response = await put(1, valid)
    assert.equal(response.statusCode, 200)
    const item = response.json()
    assertDto(item)
    assert.equal(response.headers["cache-control"], "no-store")
    assert.equal(item.tutorialId, 1)
    assert.equal(item.tutorialVersion, 1)
    assert.equal(item.currentStep, 2)
    assert.deepEqual(item.completedSteps, [0, 1])
    const row = await prisma.userTutorialProgress.findUniqueOrThrow({ where: progressKey })
    assert.equal(row.userId, userA.id)
    assert.equal(row.tutorialVersion, 1)
    assert.equal(row.currentStep, item.currentStep)
    assert.deepEqual(row.completedSteps, item.completedSteps)
    assert.equal(row.createdAt.toISOString(), item.createdAt)
    assert.equal(row.updatedAt.toISOString(), item.updatedAt)
  })

  await test("GET reads the saved public snapshot", async () => {
    await seedProgress()
    const response = await app.inject({ method: "GET", url: base, headers: { cookie: cookieA } })
    assert.equal(response.statusCode, 200)
    assert.deepEqual(Object.keys(response.json()), ["items"])
    assert.equal(response.headers["cache-control"], "no-store")
    const [item] = response.json().items
    assertDto(item)
    assert.equal(item.tutorialId, 1)
    assert.equal(item.currentStep, 2)
    assert.deepEqual(item.completedSteps, [0, 1])
  })

  await test("repeated PUT replaces the snapshot without adding rows or changing createdAt", async () => {
    const createdAt = (await seedProgress()).createdAt.toISOString()
    for (let repeat = 0; repeat < 2; repeat++) {
      const response = await put(1, { tutorialVersion: 1, currentStep: 3, completedSteps: [0, 2] })
      assert.equal(response.statusCode, 200)
      assert.equal(response.json().createdAt, createdAt)
      assert.equal(response.json().currentStep, 3)
      assert.deepEqual(response.json().completedSteps, [0, 2])
    }
    assert.equal(await prisma.userTutorialProgress.count({ where: { userId: userA.id, tutorialId: 1 } }), 1)
  })

  await test("GET lists multiple tutorials ordered by updatedAt descending", async () => {
    await seedProgress()
    assert.equal((await put(3, { tutorialVersion: 1, currentStep: 0, completedSteps: [] })).statusCode, 200)
    await prisma.userTutorialProgress.update({ where: progressKey, data: { updatedAt: new Date("2000-01-01T00:00:00Z") } })
    const response = await app.inject({ method: "GET", url: base, headers: { cookie: cookieA } })
    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.json().items.map((item: { tutorialId: number }) => item.tutorialId), [3, 1])
    for (const item of response.json().items) assertDto(item)
  })

  await test("two users can track the same tutorial without reading or overwriting each other", async () => {
    await seedProgress([0, 2], 3)
    assert.equal((await put(1, { tutorialVersion: 1, currentStep: 1, completedSteps: [1] }, cookieB)).statusCode, 200)
    const a = await app.inject({ method: "GET", url: base, headers: { cookie: cookieA } })
    const b = await app.inject({ method: "GET", url: `${base}?userId=${userA.id}`, headers: { cookie: cookieB } })
    assert.equal(a.statusCode, 200)
    assert.equal(b.statusCode, 200)
    assert.deepEqual(b.json().items.map((item: { tutorialId: number }) => item.tutorialId), [1])
    assert.deepEqual(b.json().items[0].completedSteps, [1])
    assert.deepEqual(a.json().items.find((item: { tutorialId: number }) => item.tutorialId === 1).completedSteps, [0, 2])
    assert.equal(await prisma.userTutorialProgress.count({ where: { userId: { in: userIds }, tutorialId: 1 } }), 2)
  })

  await test("unknown tutorial ids return 404 without writing", async () => {
    await seedProgress()
    const before = await rows()
    const unknown = Math.max(...tutoriels.map((tutorial) => tutorial.id)) + 1
    const response = await put(unknown, valid)
    assert.equal(response.statusCode, 404)
    assert.deepEqual(response.json(), { code: "TUTORIAL_NOT_FOUND", message: "Tutorial not found" })
    assert.deepEqual(await rows(), before)
  })

  await test("invalid versions return 400, stale client versions return 409, neither writes", async () => {
    await seedProgress()
    const before = await rows()
    for (const tutorialVersion of [undefined, 0, -1, 1.5, "1", null, Number.MAX_SAFE_INTEGER + 1]) {
      const response = await put(1, { ...valid, tutorialVersion })
      assert.equal(response.statusCode, 400)
      assert.equal(response.json().code, "INVALID_TUTORIAL_PROGRESS")
    }
    // Reject the incompatible content identity before interpreting old indices.
    const stale = await put(1, { tutorialVersion: 42, currentStep: 999, completedSteps: [999] })
    assert.equal(stale.statusCode, 409)
    assert.equal(stale.json().code, "TUTORIAL_VERSION_CONFLICT")
    assert.deepEqual(await rows(), before)
  })

  await test("historical incompatible rows remain readable and cannot be silently reset", async () => {
    await seedProgress()
    const original = await prisma.userTutorialProgress.findUniqueOrThrow({ where: progressKey })
    await prisma.userTutorialProgress.update({ where: progressKey, data: { tutorialVersion: 42 } })
    try {
      const before = await rows()
      const read = await app.inject({ method: "GET", url: base, headers: { cookie: cookieA } })
      assert.equal(read.statusCode, 200)
      assert.equal(read.json().items.find((item: { tutorialId: number }) => item.tutorialId === 1).tutorialVersion, 42)
      const responses = await Promise.all([put(1, valid), put(1, valid)])
      for (const response of responses) {
        assert.equal(response.statusCode, 409)
        assert.equal(response.json().code, "TUTORIAL_VERSION_CONFLICT")
      }
      assert.deepEqual(await rows(), before)
    } finally {
      await prisma.userTutorialProgress.update({ where: progressKey, data: { tutorialVersion: original.tutorialVersion, updatedAt: original.updatedAt } })
    }
  })

  await test("malformed tutorial ids return 400 without writing", async () => {
    await seedProgress()
    const before = await rows()
    for (const id of ["0", "-1", "1.5", "01", "1e0", "abc", "9007199254740992"]) {
      const response = await put(id, valid)
      assert.equal(response.statusCode, 400, id)
      assert.equal(response.json().code, "INVALID_TUTORIAL_ID")
    }
    assert.deepEqual(await rows(), before)
  })

  await test("currentStep must be a bounded integer with no type coercion", async () => {
    await seedProgress()
    const before = await rows()
    for (const currentStep of [-1, totalSteps, 1.5, "2", null, true]) {
      const response = await put(1, { tutorialVersion: 1, currentStep, completedSteps: [] })
      assert.equal(response.statusCode, 400)
      assert.equal(response.json().code, "INVALID_TUTORIAL_PROGRESS")
    }
    const infinite = await app.inject({
      method: "PUT", url: `${base}/1`, headers: { cookie: cookieA, origin, "content-type": "application/json" },
      payload: '{"tutorialVersion":1,"currentStep":1e309,"completedSteps":[]}',
    })
    assert.equal(infinite.statusCode, 400)
    assert.deepEqual(await rows(), before)
  })

  await test("completedSteps rejects invalid indices and non-array values", async () => {
    await seedProgress()
    const before = await rows()
    for (const completedSteps of [[-1], [totalSteps], [1.5], ["1"], [null], [true], null, {}, "0"]) {
      const response = await put(1, { tutorialVersion: 1, currentStep: 0, completedSteps })
      assert.equal(response.statusCode, 400)
      assert.equal(response.json().code, "INVALID_TUTORIAL_PROGRESS")
    }
    assert.deepEqual(await rows(), before)
  })

  await test("missing fields, client userId and extra business fields are rejected", async () => {
    await seedProgress()
    const before = await rows()
    for (const body of [{}, { tutorialVersion: 1, currentStep: 0 }, { completedSteps: [] },
      { ...valid, userId: userB.id }, { ...valid, status: "COMPLETED" }, { ...valid, percentage: 100 },
      { ...valid, nested: { userId: userB.id } }, []]) {
      const response = await put(1, body)
      assert.equal(response.statusCode, 400)
      assert.equal(response.json().code, "INVALID_TUTORIAL_PROGRESS")
    }
    const nullBody = await app.inject({
      method: "PUT", url: `${base}/1`, headers: { cookie: cookieA, origin, "content-type": "application/json" }, payload: "null",
    })
    assert.equal(nullBody.statusCode, 400)
    assert.deepEqual(await rows(), before)
  })

  await test("duplicate and unsorted validations are normalized in response and DB", async () => {
    const response = await put(1, { tutorialVersion: 1, currentStep: 2, completedSteps: [2, 0, 2, 1] })
    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.json().completedSteps, [0, 1, 2])
    assert.deepEqual((await prisma.userTutorialProgress.findUniqueOrThrow({ where: progressKey })).completedSteps, [0, 1, 2])
  })

  await test("a complete snapshot stores every step without storing or returning status", async () => {
    const completedSteps = Array.from({ length: totalSteps }, (_, index) => index)
    const response = await put(1, { tutorialVersion: 1, currentStep: totalSteps - 1, completedSteps })
    assert.equal(response.statusCode, 200)
    assertDto(response.json())
    assert.deepEqual(response.json().completedSteps, completedSteps)
    assert.deepEqual((await prisma.userTutorialProgress.findUniqueOrThrow({ where: progressKey })).completedSteps, completedSteps)
  })

  await test("a later snapshot can remove validations rather than merging them", async () => {
    await seedProgress()
    const response = await put(1, { tutorialVersion: 1, currentStep: 2, completedSteps: [] })
    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.json().completedSteps, [])
    assert.deepEqual((await prisma.userTutorialProgress.findUniqueOrThrow({ where: progressKey })).completedSteps, [])
  })

  await test("concurrent first PUTs keep one complete snapshot; a subsequent write wins", async () => {
    const snapshots = [{ tutorialVersion: 1, currentStep: 1, completedSteps: [0] }, { tutorialVersion: 1, currentStep: 2, completedSteps: [0, 1] }]
    const responses = await Promise.all(snapshots.map((snapshot) => put(2, snapshot)))
    for (const response of responses) assert.equal(response.statusCode, 200)
    assert.equal(await prisma.userTutorialProgress.count({ where: { userId: userA.id, tutorialId: 2 } }), 1)
    const row = await prisma.userTutorialProgress.findUniqueOrThrow({ where: { userId_tutorialId: { userId: userA.id, tutorialId: 2 } } })
    assert.ok(snapshots.some((snapshot) => snapshot.currentStep === row.currentStep && JSON.stringify(snapshot.completedSteps) === JSON.stringify(row.completedSteps)))
    // This last request is ordered deliberately, without assuming parallel scheduling.
    const last = { tutorialVersion: 1, currentStep: 3, completedSteps: [1, 3] }
    const final = await app.inject({ method: "PUT", url: `${base}/2`, headers: { cookie: cookieA }, payload: last })
    assert.equal(final.statusCode, 200)
    const saved = await prisma.userTutorialProgress.findUniqueOrThrow({ where: { userId_tutorialId: { userId: userA.id, tutorialId: 2 } } })
    assert.equal(saved.currentStep, last.currentStep)
    assert.deepEqual(saved.completedSteps, last.completedSteps)
  })

  await test("untrusted Origin is forbidden without altering the stored snapshot", async () => {
    await seedProgress()
    const before = await rows()
    for (const badOrigin of ["https://untrusted.example", "null"]) {
      const response = await app.inject({ method: "PUT", url: `${base}/1`, headers: { cookie: cookieA, origin: badOrigin }, payload: valid })
      assert.equal(response.statusCode, 403)
      assert.deepEqual(response.json(), { code: "INVALID_REQUEST", message: "Invalid request" })
    }
    assert.deepEqual(await rows(), before)
  })

  await test("a new catalog version persists its own identity and rejects old clients", async () => {
    const tutorial = tutoriels.find((item) => item.id === 4)!
    const originalVersion = tutorial.version
    tutorial.version = originalVersion + 1
    try {
      const response = await put(tutorial.id, { tutorialVersion: tutorial.version, currentStep: 1, completedSteps: [0] })
      assert.equal(response.statusCode, 200)
      assert.equal(response.json().tutorialVersion, tutorial.version)
      const saved = await prisma.userTutorialProgress.findUniqueOrThrow({
        where: { userId_tutorialId: { userId: userA.id, tutorialId: tutorial.id } },
      })
      assert.equal(saved.tutorialVersion, tutorial.version)
      const stale = await put(tutorial.id, { tutorialVersion: originalVersion, currentStep: 0, completedSteps: [] })
      assert.equal(stale.statusCode, 409)
      assert.deepEqual(await prisma.userTutorialProgress.findUniqueOrThrow({ where: { userId_tutorialId: { userId: userA.id, tutorialId: tutorial.id } } }), saved)
    } finally {
      tutorial.version = originalVersion
      await prisma.userTutorialProgress.deleteMany({ where: { userId: userA.id, tutorialId: tutorial.id } })
    }
  })

  await test("plain-text and form payloads cannot bypass runtime validation", async () => {
    await seedProgress()
    const before = await rows()
    for (const [contentType, payload] of [["text/plain", JSON.stringify(valid)], ["application/x-www-form-urlencoded", "currentStep=2&completedSteps=0"]]) {
      const response = await app.inject({ method: "PUT", url: `${base}/1`, headers: { cookie: cookieA, origin, "content-type": contentType }, payload })
      assert.ok([400, 415].includes(response.statusCode))
    }
    assert.deepEqual(await rows(), before)
  })

  await test("revoked Better Auth sessions cannot read or write progress", async () => {
    // Revocation belongs to this behavior, rather than changing a shared actor's session.
    const email = `tutorial-api-revoked-${randomUUID()}@example.test`
    emails.push(email)
    const cookie = await signup(email)
    const user = await prisma.user.findUniqueOrThrow({ where: { email } })
    userIds.push(user.id)
    await prisma.userTutorialProgress.create({ data: { userId: user.id, tutorialId: 1, ...valid } })
    const before = await rows()
    const signedOut = await app.inject({ method: "POST", url: "/api/auth/sign-out", headers: { cookie, origin } })
    assert.equal(signedOut.statusCode, 200)
    const read = await app.inject({ method: "GET", url: base, headers: { cookie } })
    const write = await put(1, valid, cookie)
    assert.equal(read.statusCode, 401)
    assert.equal(write.statusCode, 401)
    assert.deepEqual(await rows(), before)
  })

  await test("Prisma failures expose only the existing generic HTTP error", async () => {
    const delegate = prisma.userTutorialProgress
    const original = delegate.findMany
    // Prisma delegates use dynamic proxies, which node:test mock.method cannot inspect.
    delegate.findMany = () => {
      throw new Prisma.PrismaClientKnownRequestError("Private database detail", { code: "P2022", clientVersion: "test" })
    }
    try {
      const response = await app.inject({ method: "GET", url: base, headers: { cookie: cookieA } })
      assert.equal(response.statusCode, 500)
      assert.deepEqual(response.json(), { code: "INTERNAL_ERROR", message: "Internal server error" })
      assert.equal(response.body.includes("P2022"), false)
      assert.equal(response.body.includes("Private database detail"), false)
    } finally {
      delegate.findMany = original
    }
  })
})
