import "dotenv/config"
import assert from "node:assert/strict"
import { randomBytes, randomUUID } from "node:crypto"
import { test } from "node:test"
import { cleanupIntegration, cookieFromHeader, createIntegrationApp, signupSession } from "../helpers/integration"
import { auditQuestions } from "../../src/features/audit/data"

test("GET /audits lists only the signed-in user's summaries", async (t) => {
  if (!process.env.DATABASE_URL || !process.env.BETTER_AUTH_SECRET || !process.env.BETTER_AUTH_URL || !process.env.WEB_ORIGIN) {
    t.skip("Auth integration environment is required")
    return
  }

  const { app, prisma } = await createIntegrationApp()
  const emails = [`list-a-${randomUUID()}@example.test`, `list-b-${randomUUID()}@example.test`]
  const password = `${randomBytes(20).toString("base64url")}Aa1!`
  const auditIds: string[] = []

  t.after(() => cleanupIntegration({ app, prisma, emails, auditIds: auditIds }))

  const signup = (email: string) => signupSession(app, { email, password, name: "Audit List Test" })

  async function create(cookie?: string) {
    const response = await app.inject({ method: "POST", url: "/audits", headers: cookie ? { cookie } : {} })
    assert.equal(response.statusCode, 201)
    const id = response.json<{ id: string }>().id
    auditIds.push(id)
    return { id, response }
  }

  const withoutSession = await app.inject({ method: "GET", url: "/audits" })
  assert.equal(withoutSession.statusCode, 401)
  assert.deepEqual(withoutSession.json(), { code: "UNAUTHENTICATED", message: "Authentication required" })

  const userA = await signup(emails[0])
  const userB = await signup(emails[1])
  const empty = await app.inject({ method: "GET", url: "/audits", headers: { cookie: userA } })
  assert.equal(empty.statusCode, 200)
  assert.deepEqual(empty.json(), { items: [] })

  const older = await create(userA)
  const newer = await create(userA)
  const otherUser = await create(userB)
  const guest = await create()
  const guestCookie = cookieFromHeader(guest.response.headers["set-cookie"], "safecheck_guest")

  await prisma.audit.update({ where: { id: older.id }, data: { createdAt: new Date("2026-01-01T00:00:00.000Z") } })
  await prisma.audit.update({ where: { id: newer.id }, data: { createdAt: new Date("2026-01-02T00:00:00.000Z") } })

  for (const question of auditQuestions) {
    const response = await app.inject({
      method: "PUT", url: `/audits/${older.id}/answers/${question.id}`,
      headers: { cookie: userA }, payload: { value: "a" },
    })
    assert.equal(response.statusCode, 200)
  }
  const submitted = await app.inject({ method: "POST", url: `/audits/${older.id}/submit`, headers: { cookie: userA } })
  assert.equal(submitted.statusCode, 200)

  for (const question of auditQuestions.slice(0, 2)) {
    const response = await app.inject({
      method: "PUT", url: `/audits/${newer.id}/answers/${question.id}`,
      headers: { cookie: userA }, payload: { value: "b" },
    })
    assert.equal(response.statusCode, 200)
  }

  const listed = await app.inject({ method: "GET", url: "/audits", headers: { cookie: `${userA}; ${guestCookie}` } })
  assert.equal(listed.statusCode, 200)
  const items = listed.json<{ items: Array<Record<string, unknown>> }>().items
  assert.deepEqual(items.map((item) => item.id), [newer.id, older.id])
  assert.deepEqual(items.map((item) => item.status), ["in_progress", "completed"])
  assert.deepEqual(items.map((item) => item.answeredCount), [2, auditQuestions.length])
  for (const item of items) {
    assert.deepEqual(Object.keys(item).sort(), ["answeredCount", "createdAt", "id", "questionnaireVersion", "scoringVersion", "status", "updatedAt"])
    assert.equal(item.questionnaireVersion, 1)
    assert.equal(item.scoringVersion, 1)
    assert.equal(typeof item.createdAt, "string")
    assert.equal(typeof item.updatedAt, "string")
  }

  const bList = await app.inject({ method: "GET", url: "/audits", headers: { cookie: userB } })
  assert.equal(bList.statusCode, 200)
  assert.deepEqual(bList.json<{ items: Array<{ id: string }> }>().items.map((item) => item.id), [otherUser.id])

  const guestOnly = await app.inject({ method: "GET", url: "/audits", headers: { cookie: guestCookie } })
  assert.equal(guestOnly.statusCode, 401)
})
