import "dotenv/config"
import assert from "node:assert/strict"
import { test } from "node:test"
import { buildApp } from "../../server/app"
import { cleanupIntegration, createIntegrationApp } from "../helpers/integration"

test("readiness checks PostgreSQL while health remains independent", async (t) => {
  if (!process.env.DATABASE_URL) {
    t.skip("Database integration environment is required")
    return
  }

  const { app: readyApp, prisma } = await createIntegrationApp()
  const unavailableApp = buildApp({
    readinessCheck: async () => { throw new Error("controlled database failure") },
  })
  t.after(async () => {
    await unavailableApp.close()
    await cleanupIntegration({ app: readyApp, prisma })
  })

  const ready = await readyApp.inject({ method: "GET", url: "/ready" })
  assert.equal(ready.statusCode, 200)
  assert.deepEqual(ready.json(), { status: "ready" })

  const failed = await unavailableApp.inject({ method: "GET", url: "/ready" })
  assert.equal(failed.statusCode, 503)
  assert.deepEqual(failed.json(), { status: "unavailable" })
  assert.equal(failed.body.includes("controlled database failure"), false)

  const health = await unavailableApp.inject({ method: "GET", url: "/health" })
  assert.equal(health.statusCode, 200)
  assert.deepEqual(health.json(), { status: "ok" })
})

test("concurrent readiness timeouts share one stalled database probe", async (t) => {
  const pendingProbe = new Promise<never>(() => {})
  let probeCount = 0
  const app = buildApp({
    readinessCheck: () => {
      probeCount += 1
      return pendingProbe
    },
  })
  t.after(() => app.close())
  await app.ready()
  t.mock.timers.enable({ apis: ["setTimeout"] })
  const schedule = globalThis.setTimeout
  let scheduled = 0
  let deadlineScheduled!: () => void
  let deadlines = new Promise<void>((resolve) => { deadlineScheduled = resolve })
  t.mock.method(globalThis, "setTimeout", ((callback: () => void, delay?: number) => {
    const handle = schedule(callback, delay)
    if (delay === 1000 && ++scheduled === 2) deadlineScheduled()
    return handle
  }) as typeof setTimeout)

  const pendingResponses = Promise.all([
    app.inject({ method: "GET", url: "/ready" }),
    app.inject({ method: "GET", url: "/ready" }),
  ])
  await deadlines
  t.mock.timers.tick(1000)
  const responses = await pendingResponses
  assert.deepEqual(responses.map((response) => response.statusCode), [503, 503])
  assert.equal(probeCount, 1)

  // A later probe also reuses the query left in flight by expired HTTP requests.
  scheduled = 1
  deadlines = new Promise<void>((resolve) => { deadlineScheduled = resolve })
  const later = app.inject({ method: "GET", url: "/ready" })
  await deadlines
  t.mock.timers.tick(1000)
  assert.equal((await later).statusCode, 503)
  assert.equal(probeCount, 1)
})
