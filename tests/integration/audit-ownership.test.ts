import "dotenv/config"
import assert from "node:assert/strict"
import { randomBytes, randomUUID } from "node:crypto"
import { test } from "node:test"
import { cleanupIntegration, cookieFromHeader, createIntegrationApp, signupSession } from "../helpers/integration"

import { auditQuestions } from "../../src/features/audit/data"

test("Audit ownership stays separate for users and guests", async (t) => {
  if (
    !process.env.DATABASE_URL ||
    !process.env.BETTER_AUTH_SECRET ||
    !process.env.BETTER_AUTH_URL ||
    !process.env.WEB_ORIGIN
  ) {
    t.skip("Auth integration environment is required")
    return
  }

  const { app, prisma } = await createIntegrationApp()
  const emails = [
    `owner-a-${randomUUID()}@example.test`,
    `owner-b-${randomUUID()}@example.test`,
  ]
  const password = `${randomBytes(20).toString("base64url")}Aa1!`
  const createdAuditIds: string[] = []

  t.after(() => cleanupIntegration({ app, prisma, emails, auditIds: createdAuditIds }))

  const signup = (email: string) => signupSession(app, { email, password, name: "Ownership Test" })

  const guestCreated = await app.inject({ method: "POST", url: "/audits" })
  assert.equal(guestCreated.statusCode, 201)
  const guestAuditId = guestCreated.json<{ id: string }>().id
  createdAuditIds.push(guestAuditId)
  const guestCookie = cookieFromHeader(guestCreated.headers["set-cookie"], "safecheck_guest")

  const signupCookieA = await signup(emails[0])
  const userBCookie = await signup(emails[1])
  const userA = await prisma.user.findUniqueOrThrow({ where: { email: emails[0] } })

  const signedOut = await app.inject({
    method: "POST",
    url: "/api/auth/sign-out",
    headers: { origin: process.env.WEB_ORIGIN, cookie: signupCookieA },
  })
  assert.equal(signedOut.statusCode, 200)
  const signedIn = await app.inject({
    method: "POST",
    url: "/api/auth/sign-in/email",
    headers: { origin: process.env.WEB_ORIGIN, cookie: guestCookie },
    payload: { email: emails[0], password },
  })
  assert.equal(signedIn.statusCode, 200)
  const userACookie = cookieFromHeader(signedIn.headers["set-cookie"], "better-auth.session_token")

  const bothCookies = `${userACookie}; ${guestCookie}`
  const userCreated = await app.inject({
    method: "POST",
    url: "/audits",
    headers: { cookie: bothCookies },
  })
  assert.equal(userCreated.statusCode, 201)
  assert.equal(userCreated.headers["set-cookie"], undefined)
  const userAuditId = userCreated.json<{ id: string }>().id
  createdAuditIds.push(userAuditId)

  const [guestAudit, userAudit] = await Promise.all([
    prisma.audit.findUniqueOrThrow({ where: { id: guestAuditId } }),
    prisma.audit.findUniqueOrThrow({ where: { id: userAuditId } }),
  ])
  assert.equal(guestAudit.userId, null)
  assert.ok(guestAudit.guestSubject)
  assert.equal(userAudit.userId, userA.id)
  assert.equal(userAudit.guestSubject, null)

  const userCreatedWithoutGuest = await app.inject({
    method: "POST",
    url: "/audits",
    headers: { cookie: userACookie },
  })
  assert.equal(userCreatedWithoutGuest.statusCode, 201)
  assert.equal(userCreatedWithoutGuest.headers["set-cookie"], undefined)
  const secondUserAuditId = userCreatedWithoutGuest.json<{ id: string }>().id
  createdAuditIds.push(secondUserAuditId)
  const secondUserAudit = await prisma.audit.findUniqueOrThrow({
    where: { id: secondUserAuditId },
  })
  assert.equal(secondUserAudit.userId, userA.id)
  assert.equal(secondUserAudit.guestSubject, null)

  const ownRead = await app.inject({
    method: "GET",
    url: `/audits/${userAuditId}`,
    headers: { cookie: bothCookies },
  })
  assert.equal(ownRead.statusCode, 200)

  for (const cookie of [userBCookie, guestCookie]) {
    const headers = { cookie }
    const otherRead = await app.inject({ method: "GET", url: `/audits/${userAuditId}`, headers })
    const otherWrite = await app.inject({
      method: "PUT",
      url: `/audits/${userAuditId}/answers/1`,
      headers,
      payload: { value: "a" },
    })
    const otherSubmit = await app.inject({
      method: "POST",
      url: `/audits/${userAuditId}/submit`,
      headers,
    })
    assert.equal(otherRead.statusCode, 404)
    assert.equal(otherWrite.statusCode, 404)
    assert.equal(otherSubmit.statusCode, 404)
  }

  const unclaimedRead = await app.inject({
    method: "GET",
    url: `/audits/${guestAuditId}`,
    headers: { cookie: bothCookies },
  })
  assert.equal(unclaimedRead.statusCode, 404)
  const guestRead = await app.inject({
    method: "GET",
    url: `/audits/${guestAuditId}`,
    headers: { cookie: guestCookie },
  })
  assert.equal(guestRead.statusCode, 200)

  for (const question of auditQuestions) {
    const saved = await app.inject({
      method: "PUT",
      url: `/audits/${userAuditId}/answers/${question.id}`,
      headers: { cookie: bothCookies },
      payload: { value: "a" },
    })
    assert.equal(saved.statusCode, 200)
  }
  const submitted = await app.inject({
    method: "POST",
    url: `/audits/${userAuditId}/submit`,
    headers: { cookie: bothCookies },
  })
  assert.equal(submitted.statusCode, 200)
  assert.equal(submitted.json().status, "completed")

  const stillGuest = await prisma.audit.findUniqueOrThrow({ where: { id: guestAuditId } })
  assert.equal(stillGuest.userId, null)
  assert.equal(stillGuest.guestSubject, guestAudit.guestSubject)
})
