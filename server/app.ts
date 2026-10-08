import cookie from "@fastify/cookie"
import cors from "@fastify/cors"
import Fastify from "fastify"
import { auditRoutes } from "./audits/routes"
import { authRoutes } from "./auth/routes"
import { tutorialProgressRoutes } from "./tutorial-progress/routes"
import { trustedProxies, validateApiEnvironment } from "./runtime-config"

type ReadinessCheck = () => Promise<unknown>
const readinessTimeoutMs = 1000

export function buildApp(options: { readinessCheck?: ReadinessCheck } = {}) {
  validateApiEnvironment()

  const cookieSecret = process.env.COOKIE_SECRET
  if (!cookieSecret || cookieSecret.length < 32) {
    throw new Error("COOKIE_SECRET must contain at least 32 characters")
  }
  const webOrigin = process.env.WEB_ORIGIN
  if (!webOrigin || new URL(webOrigin).origin !== webOrigin) {
    throw new Error("WEB_ORIGIN must be an exact origin")
  }

  const proxies = trustedProxies()
  const app = Fastify({ logger: true, trustProxy: proxies.length ? proxies : false })

  app.register(cors, {
    origin: webOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT"],
  })
  app.register(cookie, { secret: cookieSecret })
  app.register(authRoutes)
  app.register(auditRoutes)
  app.register(tutorialProgressRoutes)

  app.get("/health", async () => ({ status: "ok" }))

  let readinessInFlight: Promise<boolean> | undefined
  const readinessCheck = options.readinessCheck ?? (async () => {
    const { prisma } = await import("../src/lib/prisma")
    await prisma.$queryRaw`SELECT 1`
  })

  app.get("/ready", async (_request, reply) => {
    let timeout: ReturnType<typeof setTimeout> | undefined
    try {
      if (!readinessInFlight) {
        const checkInFlight = Promise.resolve()
          .then(readinessCheck)
          .then(() => true, () => false)
        readinessInFlight = checkInFlight
        void checkInFlight.finally(() => {
          if (readinessInFlight === checkInFlight) readinessInFlight = undefined
        })
      }
      const timedOut = Symbol("readiness-timeout")
      const result = await Promise.race([
        readinessInFlight,
        new Promise<typeof timedOut>((resolve) => {
          // Keep the probe local and lightweight; bound each HTTP wait even if
          // the database driver stalls, while sharing that single pending probe.
          timeout = setTimeout(() => resolve(timedOut), readinessTimeoutMs)
        }),
      ])
      if (result === timedOut || !result) {
        return reply.code(503).send({ status: "unavailable" })
      }
      return reply.code(200).send({ status: "ready" })
    } catch {
      return reply.code(503).send({ status: "unavailable" })
    } finally {
      if (timeout) clearTimeout(timeout)
    }
  })

  app.setErrorHandler((error, request, reply) => {
    const errorStatus =
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error &&
      typeof error.statusCode === "number"
        ? error.statusCode
        : 500
    const status =
      errorStatus >= 400 && errorStatus < 500 ? errorStatus : 500

    if (status === 500) {
      request.log.error({ err: error }, "Request failed")
    }

    reply.code(status).send({
      code: status === 500 ? "INTERNAL_ERROR" : "INVALID_REQUEST",
      message: status === 500 ? "Internal server error" : "Invalid request",
    })
  })

  return app
}
