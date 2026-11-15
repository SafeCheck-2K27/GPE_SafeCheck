import "dotenv/config"
import assert from "node:assert/strict"
import { randomBytes, randomUUID } from "node:crypto"
import { test } from "node:test"
import { cleanupIntegration, cookieFromHeader, createIntegrationApp, signupSession } from "../helpers/integration"

test("session refresh cookies survive audit handling alongside guest-cookie clearing", async (t) => {
  if (!process.env.DATABASE_URL || !process.env.BETTER_AUTH_SECRET || !process.env.BETTER_AUTH_URL || !process.env.WEB_ORIGIN) {
    t.skip("Auth integration environment is required")
    return
  }

  const { app, prisma } = await createIntegrationApp()
  app.addHook("onRequest", async (request, reply) => {
    if (request.url === "/audits/claim-guest") {
      reply.header("set-cookie", "preexisting_cookie=kept; Path=/")
    }
  })
  const email = `session-refresh-${randomUUID()}@example.test`
  const password = `${randomBytes(20).toString("base64url")}Aa1!`
  const auditIds: string[] = []
  t.after(() => cleanupIntegration({ app, prisma, emails: [email], auditIds }))

  const guestAudit = await app.inject({ method: "POST", url: "/audits" })
  assert.equal(guestAudit.statusCode, 201)
  auditIds.push(guestAudit.json<{ id: string }>().id)
  const guestCookie = cookieFromHeader(guestAudit.headers["set-cookie"], "safecheck_guest")
  const sessionCookie = await signupSession(app, { email, password, name: "Session Refresh Test" })
  const user = await prisma.user.findUniqueOrThrow({ where: { email }, select: { id: true } })
  const storedSession = await prisma.session.findFirstOrThrow({ where: { userId: user.id } })

  // Put the session close to expiry so Better Auth refreshes it on this request.
  const agedExpiry = new Date(Date.now() + 60 * 60 * 1000)
  await prisma.session.update({ where: { id: storedSession.id }, data: { expiresAt: agedExpiry } })

  const response = await app.inject({
    method: "POST",
    url: "/audits/claim-guest",
    headers: { cookie: `${sessionCookie}; ${guestCookie}` },
  })
  assert.equal(response.statusCode, 200)
  assert.deepEqual(response.json(), { claimedCount: 1 })
  const setCookies = [response.headers["set-cookie"]].flat()
  assert.ok(setCookies.some((value) => /^(?:__Secure-)?better-auth\.session_token=/.test(value ?? "")),
    "the refreshed authenticated session cookie reaches the HTTP response")
  assert.ok(setCookies.some((value) => /^safecheck_guest=.*Max-Age=0/i.test(value ?? "")),
    "the guest cookie is still cleared by the claim route")
  assert.equal(setCookies.filter((value) => value?.startsWith("preexisting_cookie=")).length, 1,
    "a cookie already set on the Fastify reply is preserved exactly once")

  const refreshedSession = await prisma.session.findUniqueOrThrow({ where: { id: storedSession.id } })
  assert.ok(refreshedSession.expiresAt > agedExpiry, "the database session expiry was extended")
  assert.equal(await prisma.audit.count({ where: { id: { in: auditIds }, userId: user.id } }), 1)

  const tutorialAgedExpiry = new Date(Date.now() + 60 * 60 * 1000)
  await prisma.session.update({ where: { id: storedSession.id }, data: { expiresAt: tutorialAgedExpiry } })
  const progressResponse = await app.inject({
    method: "GET",
    url: "/me/tutorial-progress",
    headers: { cookie: sessionCookie },
  })
  assert.equal(progressResponse.statusCode, 200)
  assert.ok([progressResponse.headers["set-cookie"]].flat().some((value) =>
    /^(?:__Secure-)?better-auth\.session_token=/.test(value ?? "")),
  "tutorial progress also relays the refreshed authenticated session cookie")
  const tutorialRefreshedSession = await prisma.session.findUniqueOrThrow({ where: { id: storedSession.id } })
  assert.ok(tutorialRefreshedSession.expiresAt > tutorialAgedExpiry,
    "tutorial progress refreshes the authoritative database session expiry")
})
