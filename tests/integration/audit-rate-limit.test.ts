import "dotenv/config"
import assert from "node:assert/strict"
import { test } from "node:test"
import { cleanupIntegration, createIntegrationApp } from "../helpers/integration"

test("audit creation and mutations are rate limited by the resolved client IP", async (t) => {
  if (!process.env.DATABASE_URL || !process.env.COOKIE_SECRET || !process.env.WEB_ORIGIN || !process.env.BETTER_AUTH_SECRET || !process.env.BETTER_AUTH_URL) {
    t.skip("Audit integration environment is required")
    return
  }
  const originalProxies = process.env.API_TRUSTED_PROXIES
  delete process.env.API_TRUSTED_PROXIES
  const { app, prisma } = await createIntegrationApp()
  const auditIds: string[] = []
  t.after(async () => {
    try { await cleanupIntegration({ app, prisma, auditIds }) }
    finally {
      if (originalProxies === undefined) delete process.env.API_TRUSTED_PROXIES
      else process.env.API_TRUSTED_PROXIES = originalProxies
    }
  })

  for (let index = 0; index < 10; index += 1) {
    const response = await app.inject({ method: "POST", url: "/audits", headers: { "x-forwarded-for": `192.0.2.${index + 1}` } })
    assert.equal(response.statusCode, 201)
    auditIds.push(response.json<{ id: string }>().id)
  }
  const blockedCreate = await app.inject({ method: "POST", url: "/audits", headers: { "x-forwarded-for": "203.0.113.9" } })
  assert.equal(blockedCreate.statusCode, 429)
  assert.equal(blockedCreate.json<{ code: string }>().code, "RATE_LIMITED")
  assert.match(String(blockedCreate.headers["retry-after"]), /^\d+$/)

  for (let index = 0; index < 180; index += 1) {
    const response = await app.inject({ method: "POST", url: "/audits/claim-guest", headers: { origin: process.env.WEB_ORIGIN!, "x-forwarded-for": `198.51.100.${(index % 250) + 1}` } })
    assert.equal(response.statusCode, 401)
  }
  const blockedMutation = await app.inject({ method: "POST", url: "/audits/claim-guest", headers: { origin: process.env.WEB_ORIGIN!, "x-forwarded-for": "203.0.113.9" } })
  assert.equal(blockedMutation.statusCode, 429)
  assert.match(String(blockedMutation.headers["retry-after"]), /^\d+$/)
})
