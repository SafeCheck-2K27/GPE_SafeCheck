import "dotenv/config"
import assert from "node:assert/strict"
import { randomBytes, randomUUID } from "node:crypto"
import { test } from "node:test"
import { cleanupIntegration, cookieFromHeader, createIntegrationApp, signupSession } from "../helpers/integration"

import { auditQuestions } from "../../src/features/audit/data"

test("guest audits can be claimed explicitly and idempotently", async (t) => {
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
    `claim-a-${randomUUID()}@example.test`,
    `claim-b-${randomUUID()}@example.test`,
  ]
  const password = `${randomBytes(20).toString("base64url")}Aa1!`
  const createdAuditIds: string[] = []
  const origin = process.env.WEB_ORIGIN

  t.after(() => cleanupIntegration({ app, prisma, emails, auditIds: createdAuditIds }))

  async function createGuestAudit(cookie?: string) {
    const response = await app.inject({
      method: "POST",
      url: "/audits",
      headers: cookie ? { cookie } : {},
    })
    assert.equal(response.statusCode, 201)
    const id = response.json<{ id: string }>().id
    createdAuditIds.push(id)
    return { id, setCookie: response.headers["set-cookie"] }
  }

  const signup = (email: string) => signupSession(app, { email, password, name: "Claim Test" })

  const guestFirst = await createGuestAudit()
  const guestCookie = cookieFromHeader(guestFirst.setCookie, "safecheck_guest")
  const guestSecond = await createGuestAudit(guestCookie)
  const guestCompleted = await createGuestAudit(guestCookie)

  for (const question of auditQuestions) {
    const saved = await app.inject({
      method: "PUT",
      url: `/audits/${guestCompleted.id}/answers/${question.id}`,
      headers: { cookie: guestCookie },
      payload: { value: "a" },
    })
    assert.equal(saved.statusCode, 200)
  }
  const submitted = await app.inject({
    method: "POST",
    url: `/audits/${guestCompleted.id}/submit`,
    headers: { cookie: guestCookie },
  })
  assert.equal(submitted.statusCode, 200)
  const claimOldDate = new Date("2020-01-01T00:00:00.000Z")
  await prisma.audit.update({
    where: { id: guestSecond.id }, data: { questionnaireVersion: 2, scoringVersion: 3 },
  })
  await prisma.audit.updateMany({
    where: { id: { in: [guestFirst.id, guestSecond.id, guestCompleted.id] } },
    data: { updatedAt: claimOldDate },
  })
  const completedBefore = await prisma.audit.findUniqueOrThrow({
    where: { id: guestCompleted.id },
    include: { answers: { orderBy: { questionId: "asc" } } },
  })
  assert.equal(completedBefore.status, "COMPLETED")
  assert.equal(completedBefore.answers.length, auditQuestions.length)

  const anonymousClaim = await app.inject({
    method: "POST",
    url: "/audits/claim-guest",
    headers: { cookie: guestCookie, origin },
  })
  assert.equal(anonymousClaim.statusCode, 401)
  assert.equal(anonymousClaim.json().code, "UNAUTHENTICATED")
  assert.equal(anonymousClaim.headers["set-cookie"], undefined)

  const signupCookieA = await signup(emails[0])
  const signupCookieB = await signup(emails[1])
  const [userA, userB] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { email: emails[0] } }),
    prisma.user.findUniqueOrThrow({ where: { email: emails[1] } }),
  ])
  const originalGuestSubject = completedBefore.guestSubject
  assert.ok(originalGuestSubject)

  // Another user's valid audit must never be reassigned during a guest claim.
  const alreadyOwned = await prisma.audit.create({
    data: { userId: userB.id, guestSubject: null, updatedAt: claimOldDate },
  })
  createdAuditIds.push(alreadyOwned.id)

  const withoutGuest = await app.inject({
    method: "POST",
    url: "/audits/claim-guest",
    headers: { cookie: signupCookieA, origin },
  })
  assert.equal(withoutGuest.statusCode, 200)
  assert.deepEqual(withoutGuest.json(), { claimedCount: 0 })
  assert.equal(withoutGuest.headers["set-cookie"], undefined)

  const invalidGuest = await app.inject({
    method: "POST",
    url: "/audits/claim-guest",
    headers: { cookie: `${signupCookieA}; safecheck_guest=invalid`, origin },
  })
  assert.equal(invalidGuest.statusCode, 200)
  assert.deepEqual(invalidGuest.json(), { claimedCount: 0 })
  assert.equal(invalidGuest.headers["set-cookie"], undefined)

  const forgedBody = await app.inject({
    method: "POST",
    url: "/audits/claim-guest",
    headers: { cookie: signupCookieA, origin },
    payload: { guestSubject: originalGuestSubject, userId: userB.id },
  })
  assert.equal(forgedBody.statusCode, 200)
  assert.deepEqual(forgedBody.json(), { claimedCount: 0 })

  const invalidOrigin = await app.inject({
    method: "POST",
    url: "/audits/claim-guest",
    headers: {
      cookie: `${signupCookieA}; ${guestCookie}`,
      origin: "https://untrusted.example",
    },
  })
  assert.equal(invalidOrigin.statusCode, 403)
  assert.equal(invalidOrigin.headers["set-cookie"], undefined)

  const claimed = await app.inject({
    method: "POST",
    url: "/audits/claim-guest",
    headers: { cookie: `${signupCookieA}; ${guestCookie}`, origin },
  })
  assert.equal(claimed.statusCode, 200)
  assert.deepEqual(claimed.json(), { claimedCount: 3 })
  const clearedCookie = String(claimed.headers["set-cookie"])
  assert.match(clearedCookie, /safecheck_guest=;/)
  assert.match(clearedCookie, /Max-Age=0/i)
  assert.match(clearedCookie, /Path=\//i)
  assert.match(clearedCookie, /HttpOnly/i)
  assert.match(clearedCookie, /SameSite=Lax/i)
  assert.doesNotMatch(clearedCookie, /better-auth\.session_token=/)

  for (const id of [guestFirst.id, guestSecond.id, guestCompleted.id]) {
    const audit = await prisma.audit.findUniqueOrThrow({ where: { id } })
    assert.equal(audit.userId, userA.id)
    assert.equal(audit.guestSubject, null)
    assert.ok(audit.updatedAt > claimOldDate)
    assert.equal(audit.questionnaireVersion, id === guestSecond.id ? 2 : 1)
    assert.equal(audit.scoringVersion, id === guestSecond.id ? 3 : 1)
  }
  const completedAfter = await prisma.audit.findUniqueOrThrow({
    where: { id: guestCompleted.id },
    include: { answers: { orderBy: { questionId: "asc" } } },
  })
  assert.equal(completedAfter.status, "COMPLETED")
  assert.deepEqual(completedAfter.answers, completedBefore.answers)
  assert.equal(completedAfter.questionnaireVersion, completedBefore.questionnaireVersion)
  assert.equal(completedAfter.scoringVersion, completedBefore.scoringVersion)
  const stillOwnedByB = await prisma.audit.findUniqueOrThrow({
    where: { id: alreadyOwned.id },
  })
  assert.equal(stillOwnedByB.userId, userB.id)
  assert.equal(stillOwnedByB.guestSubject, null)
  assert.deepEqual(stillOwnedByB.updatedAt, claimOldDate)

  const sessionAfter = await app.inject({
    method: "GET",
    url: "/api/auth/get-session",
    headers: { cookie: signupCookieA },
  })
  assert.equal(sessionAfter.statusCode, 200)
  assert.equal(sessionAfter.json().user.id, userA.id)
  const userRead = await app.inject({
    method: "GET",
    url: `/audits/${guestFirst.id}`,
    headers: { cookie: signupCookieA },
  })
  assert.equal(userRead.statusCode, 200)
  const oldGuestRead = await app.inject({
    method: "GET",
    url: `/audits/${guestFirst.id}`,
    headers: { cookie: guestCookie },
  })
  assert.equal(oldGuestRead.statusCode, 404)

  const repeated = await app.inject({
    method: "POST",
    url: "/audits/claim-guest",
    headers: { cookie: `${signupCookieA}; ${guestCookie}`, origin },
  })
  assert.equal(repeated.statusCode, 200)
  assert.deepEqual(repeated.json(), { claimedCount: 0 })
  const repeatedAudit = await prisma.audit.findUniqueOrThrow({ where: { id: guestCompleted.id } })
  assert.deepEqual(repeatedAudit.updatedAt, completedAfter.updatedAt)
  assert.match(String(repeated.headers["set-cookie"]), /Max-Age=0/i)

  const signedOutB = await app.inject({
    method: "POST",
    url: "/api/auth/sign-out",
    headers: { cookie: signupCookieB, origin },
  })
  assert.equal(signedOutB.statusCode, 200)
  const loginGuest = await createGuestAudit()
  const loginGuestCookie = cookieFromHeader(loginGuest.setCookie, "safecheck_guest")
  const signedInB = await app.inject({
    method: "POST",
    url: "/api/auth/sign-in/email",
    headers: { cookie: loginGuestCookie, origin },
    payload: { email: emails[1], password },
  })
  assert.equal(signedInB.statusCode, 200)
  const loginCookieB = cookieFromHeader(signedInB.headers["set-cookie"], "better-auth.session_token")
  const loginClaim = await app.inject({
    method: "POST",
    url: "/audits/claim-guest",
    headers: { cookie: `${loginCookieB}; ${loginGuestCookie}`, origin },
  })
  assert.equal(loginClaim.statusCode, 200)
  assert.deepEqual(loginClaim.json(), { claimedCount: 1 })
  const claimedAfterLogin = await prisma.audit.findUniqueOrThrow({
    where: { id: loginGuest.id },
  })
  assert.equal(claimedAfterLogin.userId, userB.id)
  assert.equal(claimedAfterLogin.guestSubject, null)
  const loginUserRead = await app.inject({
    method: "GET",
    url: `/audits/${loginGuest.id}`,
    headers: { cookie: loginCookieB },
  })
  assert.equal(loginUserRead.statusCode, 200)
  const loginOldGuestRead = await app.inject({
    method: "GET",
    url: `/audits/${loginGuest.id}`,
    headers: { cookie: loginGuestCookie },
  })
  assert.equal(loginOldGuestRead.statusCode, 404)
})
