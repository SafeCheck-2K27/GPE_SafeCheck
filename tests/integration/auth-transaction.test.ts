import "dotenv/config"
import assert from "node:assert/strict"
import { randomBytes, randomUUID } from "node:crypto"
import { test } from "node:test"

test("email signup rolls back partial records when account or session creation fails", async (t) => {
  if (
    !process.env.DATABASE_URL ||
    !process.env.BETTER_AUTH_SECRET ||
    !process.env.BETTER_AUTH_URL ||
    !process.env.WEB_ORIGIN
  ) {
    t.skip("Auth integration environment is required")
    return
  }

  const [{ createAuth }, { prisma }] = await Promise.all([
    import("../../server/auth/auth"),
    import("../../src/lib/prisma"),
  ])
  const password = `${randomBytes(20).toString("base64url")}Aa1!`
  const emails = [`auth-transaction-${randomUUID()}@example.test`, `auth-session-${randomUUID()}@example.test`]

  t.after(async () => {
    try {
      await prisma.user.deleteMany({ where: { email: { in: emails } } })
    } finally {
      await prisma.$disconnect()
    }
  })

  async function verifyRollback(failAt: "account" | "session", email: string) {
    let failurePending = true
    let accountCreates = 0
    let sessionCreates = 0
    const failingPrisma = prisma.$extends({
      query: {
        account: {
          async create({ args, query }) {
            accountCreates += 1
            if (failAt === "account" && failurePending) {
              failurePending = false
              throw new Error("F06 test account insert failure")
            }
            return query(args)
          },
        },
        session: {
          async create({ args, query }) {
            sessionCreates += 1
            if (failAt === "session" && failurePending) {
              failurePending = false
              throw new Error("F06 test session insert failure")
            }
            return query(args)
          },
        },
      },
    })
    const auth = createAuth(failingPrisma)

    async function signup() {
      return auth.handler(new Request(`${process.env.BETTER_AUTH_URL}/api/auth/sign-up/email`, {
        method: "POST",
        headers: {
          origin: process.env.WEB_ORIGIN!,
          "content-type": "application/json",
        },
        body: JSON.stringify({ name: "Rollback Test", email, password }),
      }))
    }

    const failedSignup = await signup()
    assert.ok(failedSignup.status >= 400)
    assert.equal(failurePending, false, `${failAt} failure was injected`)
    assert.equal(accountCreates, 1, "signup attempted to create its credential account")
    assert.equal(sessionCreates, failAt === "session" ? 1 : 0)
    assert.equal(await prisma.user.count({ where: { email } }), 0)
    assert.equal(await prisma.account.count({ where: { user: { email } } }), 0)
    assert.equal(await prisma.session.count({ where: { user: { email } } }), 0)

    const retry = await signup()
    assert.equal(retry.status, 200)
    assert.equal(await prisma.user.count({ where: { email } }), 1)
    assert.equal(await prisma.account.count({ where: { user: { email } } }), 1)
    assert.equal(await prisma.session.count({ where: { user: { email } } }), 1)
  }

  await verifyRollback("account", emails[0])
  await verifyRollback("session", emails[1])
})
