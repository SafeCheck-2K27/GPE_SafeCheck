import assert from "node:assert/strict"
import type { FastifyInstance } from "fastify"

type IntegrationPrisma = typeof import("../../src/lib/prisma").prisma

/** Defer environment-sensitive imports until the test has checked its prerequisites. */
export async function createIntegrationApp() {
  const [{ buildApp }, { prisma }] = await Promise.all([
    import("../../server/app"), import("../../src/lib/prisma"),
  ])
  return { app: buildApp(), prisma }
}

export function cookieFromHeader(header: string | string[] | undefined, name: string) {
  const names = name === "better-auth.session_token" ? [name, `__Secure-${name}`] : [name]
  const cookie = (header === undefined ? [] : [header].flat())
    .find((value) => names.some((candidate) => value.startsWith(`${candidate}=`)))
  assert.ok(cookie, `${name} cookie is present`)
  return cookie.split(";", 1)[0]
}

export async function signupSession(app: FastifyInstance, options: {
  email: string; password: string; name: string; origin?: string
}) {
  const { origin = process.env.WEB_ORIGIN, ...payload } = options
  const response = await app.inject({
    method: "POST", url: "/api/auth/sign-up/email", headers: { origin }, payload,
  })
  assert.equal(response.statusCode, 200)
  return cookieFromHeader(response.headers["set-cookie"], "better-auth.session_token")
}

/** Arrays contain only identifiers allocated by this test; never remove shared QA fixtures. */
export async function cleanupIntegration(options: {
  app: FastifyInstance; prisma: IntegrationPrisma; auditIds?: string[]; emails?: string[]; userIds?: string[]
}) {
  const { app, prisma, auditIds = [], emails = [], userIds = [] } = options
  try {
    await prisma.audit.deleteMany({ where: { id: { in: auditIds } } })
    await prisma.user.deleteMany({ where: { OR: [{ email: { in: emails } }, { id: { in: userIds } }] } })
  } finally {
    try { await app.close() } finally { await prisma.$disconnect() }
  }
}
