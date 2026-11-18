import "dotenv/config"
import assert from "node:assert/strict"
import { test } from "node:test"

test("application database credentials cannot administer PostgreSQL or its schema", async (t) => {
  if (!process.env.DATABASE_URL) {
    t.skip("Database integration environment is required")
    return
  }
  const { prisma } = await import("../../src/lib/prisma")
  t.after(() => prisma.$disconnect())
  const [role] = await prisma.$queryRaw<Array<{
    superuser: boolean; create_db: boolean; create_role: boolean
    replication: boolean; bypass_rls: boolean; schema_create: boolean
    database_create: boolean; memberships: bigint
  }>>`
    SELECT r.rolsuper AS superuser, r.rolcreatedb AS create_db,
      r.rolcreaterole AS create_role, r.rolreplication AS replication,
      r.rolbypassrls AS bypass_rls,
      has_schema_privilege(current_user, 'public', 'CREATE') AS schema_create,
      has_database_privilege(current_user, current_database(), 'CREATE') AS database_create,
      (SELECT count(*) FROM pg_auth_members WHERE member = r.oid) AS memberships
    FROM pg_roles r WHERE rolname = current_user
  `
  assert.ok(role)
  for (const key of ["superuser", "create_db", "create_role", "replication", "bypass_rls", "schema_create", "database_create"] as const) {
    assert.equal(role[key], false, `runtime must not have ${key}; run npm run db:secure`)
  }
  assert.equal(role.memberships, BigInt(0), "runtime cannot assume another role")
  const missing = await prisma.$queryRaw<Array<{ table_name: string }>>`
    SELECT tablename AS table_name FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'
      AND NOT (has_table_privilege(current_user, format('%I.%I', schemaname, tablename), 'SELECT')
        AND has_table_privilege(current_user, format('%I.%I', schemaname, tablename), 'INSERT')
        AND has_table_privilege(current_user, format('%I.%I', schemaname, tablename), 'UPDATE')
        AND has_table_privilege(current_user, format('%I.%I', schemaname, tablename), 'DELETE'))
  `
  assert.deepEqual(missing, [], "runtime retains application CRUD permissions")
})
