import "dotenv/config"
import assert from "node:assert/strict"
import { test } from "node:test"
import { createIntegrationApp } from "../helpers/integration"

test("native production Auth quota uses socket IP and an explicit proxy boundary", async (t) => {
  if (!process.env.DATABASE_URL || !process.env.BETTER_AUTH_SECRET || !process.env.COOKIE_SECRET) {
    t.skip("Auth integration environment is required")
    return
  }
  Object.assign(process.env, { NODE_ENV: "production", WEB_ORIGIN: "https://safecheck.example", BETTER_AUTH_URL: "https://api.safecheck.example" })
  delete process.env.API_TRUSTED_PROXIES
  const { app, prisma } = await createIntegrationApp()
  t.after(async () => { await app.close(); await prisma.$disconnect() })
  const invalid = (remoteAddress: string, headers: Record<string, string> = {}) => app.inject({
    method: "POST", url: "/api/auth/sign-in/email", remoteAddress,
    headers: { origin: process.env.WEB_ORIGIN!, ...headers }, payload: {},
  })
  const socketA = "192.0.2.10"
  for (let index = 0; index < 3; index += 1) assert.equal((await invalid(socketA)).statusCode, 400)
  assert.equal((await invalid(socketA)).statusCode, 429)
  for (const header of ["x-forwarded-for", "x-real-ip", "cf-connecting-ip", "x-safecheck-client-ip"]) {
    assert.equal((await invalid(socketA, { [header]: "192.0.2.200" })).statusCode, 429)
  }
  assert.equal((await invalid("192.0.2.11", { "x-forwarded-for": "192.0.2.10" })).statusCode, 400)

  // A new app has the same Auth limiter but now resolves only chains from this socket.
  process.env.API_TRUSTED_PROXIES = "198.51.100.10"
  const { app: proxyApp } = await createIntegrationApp()
  t.after(() => proxyApp.close())
  const viaProxy = (remoteAddress: string, forwardedFor: string) => proxyApp.inject({
    method: "POST", url: "/api/auth/sign-in/email", remoteAddress,
    headers: { origin: process.env.WEB_ORIGIN!, "x-forwarded-for": forwardedFor }, payload: {},
  })
  for (let index = 0; index < 3; index += 1) assert.equal((await viaProxy("198.51.100.10", "192.0.2.50")).statusCode, 400)
  assert.equal((await viaProxy("198.51.100.10", "192.0.2.50")).statusCode, 429)
  assert.equal((await viaProxy("198.51.100.10", "192.0.2.201, 192.0.2.50")).statusCode, 429)
  assert.equal((await viaProxy("198.51.100.10", "192.0.2.51")).statusCode, 400)
  assert.equal((await viaProxy("192.0.2.60", "192.0.2.50")).statusCode, 400)
  assert.equal((await viaProxy("198.51.100.10", "bad-ip, 192.0.2.50")).statusCode, 429)
  assert.equal((await viaProxy("198.51.100.10", "2001:db8::51")).statusCode, 400)

  // A malformed nearest hop falls back to the socket, never a client-selected bucket.
  for (let index = 0; index < 3; index += 1) assert.equal((await viaProxy("198.51.100.10", `bad-ip-${index}`)).statusCode, 400)
  assert.equal((await viaProxy("198.51.100.10", "another-bad-ip")).statusCode, 429)
  assert.equal((await viaProxy("198.51.100.10", "192.0.2.202, malformed-nearest-hop")).statusCode, 429)

  // Better Auth's installed sign-in rule is 3 requests / 10 seconds. Advance only
  // Date in this isolated worker; timers and production limiter settings stay real.
  t.mock.timers.enable({ apis: ["Date"], now: Date.now() })
  t.mock.timers.setTime(Date.now() + 10_001)
  assert.equal((await invalid(socketA)).statusCode, 400)
})
