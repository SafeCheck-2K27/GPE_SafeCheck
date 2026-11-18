import "dotenv/config"
import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { test } from "node:test"
import { cleanupIntegration, cookieFromHeader, createIntegrationApp } from "../helpers/integration"

test("production Guest cookies stay Secure across internal HTTP and forged proxy headers", async (t) => {
  if (!process.env.DATABASE_URL || !process.env.BETTER_AUTH_SECRET || !process.env.COOKIE_SECRET) {
    t.skip("Database and Auth integration environment is required")
    return
  }
  // Node executes test files in separate workers; these values precede Auth imports.
  Object.assign(process.env, { NODE_ENV: "production", WEB_ORIGIN: "https://safecheck.example", BETTER_AUTH_URL: "https://api.safecheck.example" })
  delete process.env.API_TRUSTED_PROXIES
  const { app, prisma } = await createIntegrationApp()
  const auditIds: string[] = []
  const email = `security-production-${randomUUID()}@example.test`
  t.after(() => cleanupIntegration({ app, prisma, auditIds, emails: [email] }))

  let guestCookie = ""
  for (const forwardedProto of ["http", "https"]) {
    const response = await app.inject({ method: "POST", url: "/audits", headers: { origin: process.env.WEB_ORIGIN, "x-forwarded-proto": forwardedProto } })
    assert.equal(response.statusCode, 201)
    auditIds.push(response.json().id)
    const issued = String(response.headers["set-cookie"])
    assert.match(issued, /; Secure(?:;|$)/i)
    assert.match(issued, /; HttpOnly(?:;|$)/i)
    assert.match(issued, /; SameSite=Lax(?:;|$)/i)
    assert.match(issued, /; Path=\/(?:;|$)/i)
    assert.match(issued, /; Max-Age=2592000(?:;|$)/i)
    if (!guestCookie) guestCookie = cookieFromHeader(response.headers["set-cookie"], "safecheck_guest")
  }
  const own = await app.inject({ method: "GET", url: `/audits/${auditIds[0]}`, headers: { cookie: guestCookie } })
  assert.equal(own.statusCode, 200)
  const tampered = await app.inject({ method: "GET", url: `/audits/${auditIds[0]}`, headers: { cookie: `${guestCookie}tampered` } })
  assert.equal(tampered.statusCode, 404)

  const signup = await app.inject({ method: "POST", url: "/api/auth/sign-up/email", headers: { origin: process.env.WEB_ORIGIN }, payload: { name: "Production Security Test", email, password: `${randomUUID()}Aa1!` } })
  assert.equal(signup.statusCode, 200)
  const authCookie = [signup.headers["set-cookie"]].flat().find((cookie) => cookie?.startsWith("__Secure-better-auth.session_token="))
  assert.ok(authCookie)
  assert.match(authCookie, /; Secure(?:;|$)/i)
  assert.match(authCookie, /; HttpOnly(?:;|$)/i)
  const sessionCookie = cookieFromHeader(signup.headers["set-cookie"], "better-auth.session_token")
  const claim = await app.inject({ method: "POST", url: "/audits/claim-guest", headers: { origin: process.env.WEB_ORIGIN, cookie: `${sessionCookie}; ${guestCookie}` } })
  assert.equal(claim.statusCode, 200)
  assert.equal(claim.json().claimedCount, 1)
  const expired = String(claim.headers["set-cookie"])
  assert.match(expired, /safecheck_guest=/i)
  assert.match(expired, /; Max-Age=0(?:;|$)/i)
  assert.match(expired, /; Secure(?:;|$)/i)
  assert.match(expired, /; HttpOnly(?:;|$)/i)
  assert.match(expired, /; SameSite=Lax(?:;|$)/i)
  assert.match(expired, /; Path=\/(?:;|$)/i)
  const session = await app.inject({ method: "GET", url: "/api/auth/get-session", headers: { cookie: sessionCookie } })
  assert.equal(session.json().user.email, email)
})
