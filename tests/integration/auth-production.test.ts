import "dotenv/config"
import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { test } from "node:test"
import { cleanupIntegration, cookieFromHeader, createIntegrationApp } from "../helpers/integration"

test("HTTPS production auth issues secure cookies and revokes the session on logout", async (t) => {
  if (!process.env.DATABASE_URL || !process.env.BETTER_AUTH_SECRET || !process.env.COOKIE_SECRET) {
    t.skip("Database and Auth integration environment is required")
    return
  }

  // Node runs test files in isolated processes. Set policy before importing Auth.
  const previous = {
    NODE_ENV: process.env.NODE_ENV,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    WEB_ORIGIN: process.env.WEB_ORIGIN,
  }
  Object.assign(process.env, {
    NODE_ENV: "production",
    BETTER_AUTH_URL: "https://api.safecheck.example",
    WEB_ORIGIN: "https://safecheck.example",
  })
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  })

  const { app, prisma } = await createIntegrationApp()
  const email = `auth-production-${randomUUID()}@example.test`
  const password = `${randomUUID()}Aa1!`
  t.after(() => cleanupIntegration({ app, prisma, emails: [email] }))
  const headers = { origin: process.env.WEB_ORIGIN }
  const signup = await app.inject({
    method: "POST", url: "/api/auth/sign-up/email", headers,
    payload: { name: "HTTPS Policy Test", email, password },
  })
  assert.equal(signup.statusCode, 200)
  assert.equal("token" in signup.json(), false)
  assert.equal(signup.headers["access-control-allow-origin"], headers.origin)
  assert.equal(signup.headers["access-control-allow-credentials"], "true")
  const cookies = [signup.headers["set-cookie"]].flat()
  const issued = cookies.find((cookie) => cookie?.startsWith("__Secure-better-auth.session_token="))
  assert.ok(issued, "HTTPS uses the Secure cookie namespace")
  assert.match(issued, /; Secure(?:;|$)/i)
  assert.match(issued, /; HttpOnly(?:;|$)/i)
  assert.match(issued, /; SameSite=Lax(?:;|$)/i)
  assert.match(issued, /; Path=\/(?:;|$)/i)
  const cookie = cookieFromHeader(signup.headers["set-cookie"], "better-auth.session_token")

  const session = await app.inject({ method: "GET", url: "/api/auth/get-session", headers: { cookie } })
  assert.equal(session.statusCode, 200)
  assert.equal(session.json().user.email, email)
  assert.equal("token" in session.json().session, false)
  const userId = session.json().user.id as string
  assert.equal(await prisma.session.count({ where: { userId } }), 1)

  const logout = await app.inject({ method: "POST", url: "/api/auth/sign-out", headers: { ...headers, cookie } })
  assert.equal(logout.statusCode, 200)
  const expired = [logout.headers["set-cookie"]].flat().find((value) => value?.startsWith("__Secure-better-auth.session_token="))
  assert.ok(expired, "logout clears the same Secure cookie")
  assert.match(expired, /; Max-Age=0(?:;|$)/i)
  assert.match(expired, /; Secure(?:;|$)/i)
  assert.match(expired, /; HttpOnly(?:;|$)/i)
  assert.equal(await prisma.session.count({ where: { userId } }), 0)
  const revoked = await app.inject({ method: "GET", url: "/api/auth/get-session", headers: { cookie } })
  assert.equal(revoked.statusCode, 200)
  assert.equal(revoked.json(), null)
})
