import "dotenv/config"
import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { readFile } from "node:fs/promises"
import { createRequire } from "node:module"
import { after, beforeEach, describe, test } from "node:test"

describe("PostgreSQL enforces Family F structural invariants and retention", { skip: !process.env.DATABASE_URL }, async () => {
  const { prisma } = await import("../../src/lib/prisma")
  const userId = randomUUID()
  const auditIds = [randomUUID(), randomUUID()]
  after(async () => {
    try {
      await prisma.audit.deleteMany({ where: { id: { in: auditIds } } })
      await prisma.user.deleteMany({ where: { id: userId } })
    } finally { await prisma.$disconnect() }
  })
  // Structural constraints are separate behaviors; only migration replay below is sequential.
  beforeEach(async () => {
    await prisma.audit.deleteMany({ where: { id: { in: auditIds } } })
    await prisma.user.deleteMany({ where: { id: userId } })
    await prisma.user.create({ data: { id: userId, email: `integrity-${userId}@example.test`, name: "Integrity Test" } })
  })
  const seedOwnedAudit = () => prisma.audit.create({ data: { id: auditIds[0], userId, guestSubject: null } })
  const seedGuestAudit = () => prisma.audit.create({ data: { id: auditIds[1], userId: null, guestSubject: randomUUID() } })

  await test("user-only and guest-only owners are accepted with initial versions", async () => {
    const owned = await prisma.audit.create({ data: { id: auditIds[0], userId, guestSubject: null } })
    const guest = await prisma.audit.create({ data: { id: auditIds[1], userId: null, guestSubject: randomUUID() } })
    for (const audit of [owned, guest]) {
      assert.equal(audit.questionnaireVersion, 1)
      assert.equal(audit.scoringVersion, 1)
    }
  })

  async function rejected(query: string, args: unknown[], constraint: string) {
    await assert.rejects(prisma.$executeRawUnsafe(query, ...args), (error: unknown) => {
      assert.ok(error instanceof Error)
      assert.match(error.message, new RegExp(constraint))
      return true
    })
  }

  await test("both-null and both-set ownership are rejected by SQL", async () => {
    await seedOwnedAudit()
    await rejected('UPDATE "audits" SET "userId" = NULL, "guestSubject" = NULL WHERE id = $1', [auditIds[0]], "audits_owner_xor_check")
    await rejected('UPDATE "audits" SET "userId" = $1, "guestSubject" = $2 WHERE id = $3', [userId, randomUUID(), auditIds[0]], "audits_owner_xor_check")
    const audit = await prisma.audit.findUniqueOrThrow({ where: { id: auditIds[0] } })
    assert.equal(audit.userId, userId)
    assert.equal(audit.guestSubject, null)
  })

  await test("positive audit versions are enforced independently of the current catalog", async () => {
    await seedOwnedAudit()
    for (const [column, name] of [["questionnaireVersion", "questionnaire"], ["scoringVersion", "scoring"]]) {
      for (const value of [0, -1]) await rejected(`UPDATE "audits" SET "${column}" = $1 WHERE id = $2`, [value, auditIds[0]], `audits_${name}_version_positive_check`)
    }
  })

  await test("answer bounds, primary key, foreign key and cascade remain effective", async () => {
    await seedGuestAudit()
    await prisma.auditAnswer.create({ data: { auditId: auditIds[1], questionId: 1, value: "a" } })
    await assert.rejects(prisma.auditAnswer.create({ data: { auditId: auditIds[1], questionId: 1, value: "b" } }), { code: "P2002" })
    await rejected('INSERT INTO "audit_answers" ("auditId", "questionId", value) VALUES ($1, 0, \'a\')', [auditIds[1]], "audit_answers_question_id_positive_check")
    await rejected('INSERT INTO "audit_answers" ("auditId", "questionId", value) VALUES ($1, 1, \'a\')', [randomUUID()], "audit_answers_auditId_fkey")
    await prisma.audit.delete({ where: { id: auditIds[1] } })
    assert.equal(await prisma.auditAnswer.count({ where: { auditId: auditIds[1] } }), 0)
  })

  await test("tutorial progress SQL rejects invalid scalar and array shapes", async () => {
    const key = { userId_tutorialId: { userId, tutorialId: 1 } }
    await prisma.userTutorialProgress.create({ data: { userId, tutorialId: 1, completedSteps: [0, 1] } })
    for (const [column, value, name] of [
      ["tutorialId", 0, "id_positive"],
      ["tutorialVersion", 0, "version_positive"],
      ["currentStep", -1, "current_step_nonnegative"],
    ] as const) {
      await rejected(`UPDATE "user_tutorial_progress" SET "${column}" = $1 WHERE "userId" = $2`, [value, userId], `tutorial_progress_${name}_check`)
    }
    for (const expression of ["ARRAY[-1]", "ARRAY[0, NULL]::integer[]", "ARRAY[[0,1],[2,3]]", "'[0:1]={0,1}'::integer[]"]) {
      await rejected(`UPDATE "user_tutorial_progress" SET "completedSteps" = ${expression} WHERE "userId" = $1`, [userId], "tutorial_progress_completed_steps_valid_check")
    }
    await rejected('UPDATE "user_tutorial_progress" SET "completedSteps" = NULL WHERE "userId" = $1', [userId], "completedSteps")
    const progress = await prisma.userTutorialProgress.findUniqueOrThrow({ where: key })
    assert.deepEqual(progress.completedSteps, [0, 1])
    assert.equal(progress.tutorialVersion, 1)
    await assert.rejects(prisma.userTutorialProgress.create({ data: { userId: randomUUID(), tutorialId: 1 } }), { code: "P2003" })
  })

  await test("Audit RESTRICT prevents account deletion; progress cascades after audit removal", async () => {
    await seedOwnedAudit()
    await prisma.userTutorialProgress.create({ data: { userId, tutorialId: 1, completedSteps: [0, 1] } })
    await assert.rejects(prisma.user.delete({ where: { id: userId } }), { code: "P2003" })
    assert.equal(await prisma.user.count({ where: { id: userId } }), 1)
    assert.equal(await prisma.userTutorialProgress.count({ where: { userId } }), 1)
    await prisma.audit.delete({ where: { id: auditIds[0] } })
    await prisma.user.delete({ where: { id: userId } })
    assert.equal(await prisma.userTutorialProgress.count({ where: { userId } }), 0)
  })
})

type ReplayClient = {
  connect(): Promise<void>
  end(): Promise<void>
  query(sql: string, values?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>
}

test("immutable migration history replays, rejects ambiguous data and backfills without loss", async (t) => {
  if (!process.env.MIGRATION_DATABASE_URL) return t.skip("Migration credentials are required for isolated replay")
  const { Client } = createRequire(import.meta.url)("pg") as {
    Client: new (options: { connectionString: string }) => ReplayClient
  }
  const client = new Client({ connectionString: process.env.MIGRATION_DATABASE_URL })
  const schema = `family_f_replay_${randomUUID().replaceAll("-", "_")}`
  const migration = (name: string) => readFile(new URL(`../../prisma/migrations/${name}/migration.sql`, import.meta.url), "utf8")
  await client.connect()
  try {
    await client.query(`CREATE SCHEMA "${schema}"`)
    await client.query(`SET search_path TO "${schema}"`)
    await client.query(await migration("20260626103328_init"))
    await client.query(await migration("20260928162256_add_audit_and_answers"))
    await client.query(`INSERT INTO users (id,email,name,"updatedAt") VALUES ('legacy','legacy@example.test',NULL,'2026-01-01')`)
    await client.query("BEGIN")
    await assert.rejects(client.query(await migration("20260928185518_add_better_auth_core")), { code: "23502" })
    await client.query("ROLLBACK")
    await client.query(`UPDATE users SET name='Legacy Test' WHERE id='legacy'`)
    await client.query(await migration("20260928185518_add_better_auth_core"))
    await client.query(await migration("20260928205533_audit_user_ownership"))
    await client.query(await migration("20261002180303_add_user_tutorial_progress"))
    await client.query(`INSERT INTO audits (id,"guestSubject","userId","updatedAt") VALUES ('owned',NULL,'legacy','2026-01-01'),('guest','subject',NULL,'2026-01-02'),('ambiguous',NULL,NULL,'2026-01-03')`)
    await client.query(`INSERT INTO audit_answers ("auditId","questionId",value) VALUES ('owned',1,'a')`)
    await client.query(`INSERT INTO user_tutorial_progress ("userId","tutorialId","currentStep","completedSteps","updatedAt") VALUES ('legacy',1,2,ARRAY[0,1],'2026-01-01')`)
    const familyF = await migration("20261005120000_strengthen_data_integrity_and_versions")
    await assert.rejects(client.query(familyF), /invalid Audit ownership/)
    await client.query("ROLLBACK")
    assert.equal((await client.query(`SELECT count(*)::int AS n FROM information_schema.columns WHERE table_schema=$1 AND column_name='questionnaireVersion'`, [schema])).rows[0].n, 0)
    // The only repaired row is this test's deliberately ambiguous synthetic fixture.
    await client.query(`UPDATE audits SET "guestSubject"='repaired-fixture' WHERE id='ambiguous'`)
    const snapshot = async (after: boolean) => {
      const result: Record<string, unknown> = {}
      for (const table of ["users", "audits", "audit_answers", "user_tutorial_progress"]) {
        const exclude = after && table === "audits" ? ` - 'questionnaireVersion' - 'scoringVersion'` : after && table === "user_tutorial_progress" ? ` - 'tutorialVersion'` : ""
        result[table] = (await client.query(`SELECT to_jsonb(t)${exclude} AS row FROM ${table} t ORDER BY to_jsonb(t)::text`)).rows
      }
      return result
    }
    const before = await snapshot(false)
    await client.query(familyF)
    assert.deepEqual(await snapshot(true), before)
    assert.deepEqual((await client.query('SELECT DISTINCT "questionnaireVersion", "scoringVersion" FROM audits')).rows, [{ questionnaireVersion: 1, scoringVersion: 1 }])
    assert.deepEqual((await client.query('SELECT "tutorialVersion" FROM user_tutorial_progress')).rows, [{ tutorialVersion: 1 }])
    const constraints = (await client.query(`SELECT count(*)::int AS n FROM pg_constraint WHERE connamespace=$1::regnamespace AND contype='c' AND convalidated`, [schema])).rows[0].n
    assert.equal(constraints, 8)
  } finally {
    try {
      await client.query("ROLLBACK")
      await client.query('SET search_path TO public')
      await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`)
    } finally { await client.end() }
  }
})
