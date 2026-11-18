import "dotenv/config"
import assert from "node:assert/strict"
import { randomBytes, randomUUID } from "node:crypto"
import { test } from "node:test"
import { cleanupIntegration, cookieFromHeader, createIntegrationApp } from "../helpers/integration"

test("Better Auth native email and password lifecycle", async (t) => {
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
  const email = `auth-test-${randomUUID()}@example.test`
  const password = `${randomBytes(20).toString("base64url")}Aa1!`
  const origin = process.env.WEB_ORIGIN
  const postHeaders = { origin }

  t.after(() => cleanupIntegration({ app, prisma, emails: [email] }))

  const signup = await app.inject({
    method: "POST",
    url: "/api/auth/sign-up/email",
    headers: postHeaders,
    payload: { name: "Auth Test", email, password },
  })
  assert.equal(signup.statusCode, 200)
  assert.equal("token" in signup.json(), false)
  assert.equal(signup.headers["access-control-allow-origin"], origin)
  assert.equal(signup.headers["access-control-allow-credentials"], "true")
  const firstCookie = cookieFromHeader(signup.headers["set-cookie"], "better-auth.session_token")
  const cookieAttributes = String(signup.headers["set-cookie"])
  assert.match(cookieAttributes, /; HttpOnly/i)
  assert.match(cookieAttributes, /; SameSite=Lax/i)
  assert.match(cookieAttributes, /; Path=\//i)
  assert.match(cookieAttributes, /; Max-Age=604800/i)
  assert.doesNotMatch(cookieAttributes, /; Secure(?:;|$)/i)

  const user = await prisma.user.findUnique({
    where: { email },
    include: { accounts: true, sessions: true },
  })
  assert.ok(user)
  assert.equal(user.accounts.length, 1)
  assert.equal(user.accounts[0].providerId, "credential")
  assert.ok(user.accounts[0].password)
  assert.notEqual(user.accounts[0].password, password)
  assert.equal(user.sessions.length, 1)

  const session = await app.inject({
    method: "GET",
    url: "/api/auth/get-session",
    headers: { cookie: firstCookie },
  })
  assert.equal(session.statusCode, 200)
  assert.equal(session.json().user.email, email)
  assert.equal("token" in session.json().session, false)
  assert.equal(JSON.stringify(session.json()).includes(user.accounts[0].password), false)

  const anonymous = await app.inject({ method: "GET", url: "/api/auth/get-session" })
  assert.equal(anonymous.statusCode, 200)
  assert.equal(anonymous.json(), null)

  const signout = await app.inject({
    method: "POST",
    url: "/api/auth/sign-out",
    headers: { ...postHeaders, cookie: firstCookie },
  })
  assert.equal(signout.statusCode, 200)
  assert.ok(signout.headers["set-cookie"])
  assert.match(String(signout.headers["set-cookie"]), /Max-Age=0/i)
  assert.equal(await prisma.session.count({ where: { userId: user.id } }), 0)

  const afterSignout = await app.inject({
    method: "GET",
    url: "/api/auth/get-session",
    headers: { cookie: firstCookie },
  })
  assert.equal(afterSignout.statusCode, 200)
  assert.equal(afterSignout.json(), null)

  const wrongPassword = await app.inject({
    method: "POST",
    url: "/api/auth/sign-in/email",
    headers: postHeaders,
    payload: { email, password: `${password}wrong` },
  })
  const unknownEmail = await app.inject({
    method: "POST",
    url: "/api/auth/sign-in/email",
    headers: postHeaders,
    payload: { email: `missing-${randomUUID()}@example.test`, password },
  })
  assert.equal(wrongPassword.statusCode, unknownEmail.statusCode)
  assert.deepEqual(wrongPassword.json(), unknownEmail.json())
  assert.ok(wrongPassword.statusCode >= 400)
  for (const failure of [wrongPassword, unknownEmail]) {
    assert.equal(failure.body.includes(password), false)
    assert.equal(failure.body.includes(user.accounts[0].password), false)
    assert.equal(failure.body.includes("Prisma"), false)
    assert.equal(failure.body.includes("stack"), false)
    assert.equal(failure.headers["set-cookie"], undefined)
  }

  const duplicate = await app.inject({
    method: "POST",
    url: "/api/auth/sign-up/email",
    headers: postHeaders,
    payload: { name: "Auth Test", email, password },
  })
  assert.ok(duplicate.statusCode >= 400)
  assert.equal(await prisma.user.count({ where: { email } }), 1)

  const shortPassword = await app.inject({
    method: "POST",
    url: "/api/auth/sign-up/email",
    headers: postHeaders,
    payload: { name: "Auth Test", email: `short-${randomUUID()}@example.test`, password: "short" },
  })
  assert.ok(shortPassword.statusCode >= 400)

  const invalidOrigin = await app.inject({
    method: "POST",
    url: "/api/auth/sign-in/email",
    headers: { origin: "https://untrusted.example" },
    payload: { email, password },
  })
  assert.ok(invalidOrigin.statusCode >= 400)

  const login = await app.inject({
    method: "POST",
    url: "/api/auth/sign-in/email",
    headers: postHeaders,
    payload: { email, password },
  })
  assert.equal(login.statusCode, 200)
  assert.equal("token" in login.json(), false)
  const secondCookie = cookieFromHeader(login.headers["set-cookie"], "better-auth.session_token")
  assert.notEqual(firstCookie, secondCookie)
  assert.equal(await prisma.session.count({ where: { userId: user.id } }), 1)

  const afterLogin = await app.inject({
    method: "GET",
    url: "/api/auth/get-session",
    headers: { cookie: secondCookie },
  })
  assert.equal(afterLogin.statusCode, 200)
  assert.equal(afterLogin.json().user.email, email)
})
