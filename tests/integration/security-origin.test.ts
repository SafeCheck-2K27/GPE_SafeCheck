import "dotenv/config"
import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { test } from "node:test"
import { cleanupIntegration, cookieFromHeader, createIntegrationApp, signupSession } from "../helpers/integration"

test("Audit mutations reject hostile browser origins before any cookie or mutation", async (t) => {
  if (!process.env.DATABASE_URL || !process.env.BETTER_AUTH_SECRET || !process.env.COOKIE_SECRET) {
    t.skip("Database and Auth integration environment is required")
    return
  }
  const { app, prisma } = await createIntegrationApp()
  const auditIds: string[] = []
  const email = `security-origin-${randomUUID()}@example.test`
  t.after(() => cleanupIntegration({ app, prisma, auditIds, emails: [email] }))

  const created = await app.inject({ method: "POST", url: "/audits", headers: { origin: process.env.WEB_ORIGIN } })
  if (created.statusCode === 201) auditIds.push(created.json().id)
  assert.equal(created.statusCode, 201)
  const id = created.json().id as string
  const guest = cookieFromHeader(created.headers["set-cookie"], "safecheck_guest")
  const subject = (await prisma.audit.findUniqueOrThrow({ where: { id } })).guestSubject
  assert.ok(subject)
  const badHeaders = [
    { origin: "https://attacker.example", "content-type": "text/plain", "sec-fetch-site": "cross-site", "sec-fetch-mode": "navigate" },
    { origin: "null" },
    { origin: `${process.env.WEB_ORIGIN}.attacker.example` },
    { origin: `${process.env.WEB_ORIGIN}/path` },
    { origin: new URL(process.env.WEB_ORIGIN!).origin.replace(/^https?:/, process.env.WEB_ORIGIN!.startsWith("https:") ? "http:" : "https:") },
    { origin: "http://[malformed" },
    { "sec-fetch-site": "cross-site" },
    { "sec-fetch-site": "same-site", "sec-fetch-mode": "cors" },
    { "sec-fetch-site": "none", "sec-fetch-mode": "cors" },
    { "sec-fetch-mode": "navigate" },
  ]
  for (const headers of badHeaders) {
    for (const cookie of [undefined, guest]) {
      const response = await app.inject({ method: "POST", url: "/audits", headers: { ...headers, ...(cookie ? { cookie } : {}) }, ...(headers["content-type"] === "text/plain" ? { payload: "ignored=attack" } : {}) })
      if (response.statusCode === 201) auditIds.push(response.json().id)
      assert.equal(response.statusCode, 403)
      assert.equal(response.headers["set-cookie"], undefined)
    }
  }
  assert.equal(await prisma.audit.count({ where: { guestSubject: subject } }), 1)

  for (const request of [
    { method: "PUT" as const, url: `/audits/${id}/answers/1`, payload: { value: "a" } },
    { method: "POST" as const, url: `/audits/${id}/submit` },
    { method: "POST" as const, url: "/audits/claim-guest" },
  ]) {
    const response = await app.inject({ ...request, headers: { origin: "https://attacker.example", cookie: guest } })
    assert.equal(response.statusCode, 403)
    assert.equal(response.headers["set-cookie"], undefined)
  }
  const unchanged = await prisma.audit.findUniqueOrThrow({ where: { id }, include: { answers: true } })
  assert.equal(unchanged.status, "IN_PROGRESS")
  assert.deepEqual(unchanged.answers, [])
  assert.equal(unchanged.guestSubject, subject)

  // A non-browser request with no Origin or Fetch Metadata is explicitly allowed.
  const cli = await app.inject({ method: "POST", url: "/audits", headers: { cookie: guest } })
  if (cli.statusCode === 201) auditIds.push(cli.json().id)
  assert.equal(cli.statusCode, 201)
  assert.equal(cli.headers["set-cookie"], undefined)

  const sameOrigin = await app.inject({ method: "POST", url: "/audits", headers: { cookie: guest, "sec-fetch-site": "same-origin", "sec-fetch-mode": "cors" } })
  if (sameOrigin.statusCode === 201) auditIds.push(sameOrigin.json().id)
  assert.equal(sameOrigin.statusCode, 201)
  assert.equal(sameOrigin.headers["set-cookie"], undefined)

  const put = await app.inject({ method: "PUT", url: `/audits/${id}/answers/1`, headers: { origin: process.env.WEB_ORIGIN, cookie: guest }, payload: { value: "a" } })
  assert.equal(put.statusCode, 200)
  const fetched = await app.inject({ method: "GET", url: `/audits/${id}`, headers: { cookie: guest } })
  assert.equal(fetched.statusCode, 200)
  const preflight = await app.inject({ method: "OPTIONS", url: `/audits/${id}/answers/1`, headers: { origin: process.env.WEB_ORIGIN, "access-control-request-method": "PUT" } })
  assert.equal(preflight.statusCode, 204)

  const password = `${randomUUID()}Aa1!`
  const sessionCookie = await signupSession(app, { name: "Origin Test", email, password })
  const claim = await app.inject({ method: "POST", url: "/audits/claim-guest", headers: { origin: process.env.WEB_ORIGIN, cookie: `${sessionCookie}; ${guest}` } })
  assert.equal(claim.statusCode, 200)
  assert.equal(claim.json().claimedCount, 3)
  assert.match(String(claim.headers["set-cookie"]), /safecheck_guest=.*Max-Age=0/i)
  const session = await app.inject({ method: "GET", url: "/api/auth/get-session", headers: { cookie: sessionCookie } })
  assert.equal(session.statusCode, 200)
  assert.equal(session.json().user.email, email)
})
