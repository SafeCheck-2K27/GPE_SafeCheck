import "dotenv/config"
import { prisma } from "../src/lib/prisma"
import { buildApp } from "./app"

const app = buildApp()
let shuttingDown = false

async function shutdown(signal: string) {
  if (shuttingDown) return
  shuttingDown = true
  app.log.info({ signal }, "Shutting down API")

  try {
    await app.close()
  } finally {
    await prisma.$disconnect()
  }
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    void shutdown(signal).catch((error: unknown) => {
      app.log.error({ err: error }, "Failed to shut down API")
      process.exitCode = 1
    })
  })
}

async function start() {
  const host = process.env.API_HOST || "localhost"
  const port = Number(process.env.API_PORT || "3001")

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("API_PORT must be an integer between 1 and 65535")
  }

  await app.listen({ host, port })

  try {
    await prisma.$queryRaw`SELECT 1`
    app.log.info("PostgreSQL connection verified through Prisma")
  } catch (error) {
    app.log.warn({ err: error }, "PostgreSQL connection unavailable")
  }
}

void start().catch(async (error: unknown) => {
  app.log.error({ err: error }, "Failed to start API")
  await Promise.allSettled([app.close(), prisma.$disconnect()])
  process.exitCode = 1
})
