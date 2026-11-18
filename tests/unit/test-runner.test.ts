import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { test } from "node:test"
import { assessResults, discoverTests, integrationEnvironment, missingIntegrationEnvironment, redactOutput, requireTestGroups } from "../../scripts/test-gate.mjs"

test("strict integration preflight requires every environment value, including migration replay credentials", () => {
  const complete = Object.fromEntries(integrationEnvironment.map((key) => [key, "configured"]))
  assert.deepEqual(missingIntegrationEnvironment(complete), [])
  for (const key of integrationEnvironment) {
    assert.deepEqual(missingIntegrationEnvironment({ ...complete, [key]: " " }), [key])
  }
})

test("a successful aggregate cannot hide a missing file or absent final summary", () => {
  const counts = { tests: 1, failed: 0, passed: 1, cancelled: 0, skipped: 0, todo: 0 }
  const summary = { success: true, counts }
  assert.match(assessResults(["first", "missing"], new Map([["first", summary]]), summary, true).errors.join("\n"), /did not complete: missing/)
  assert.match(assessResults(["first"], new Map([["first", summary]]), undefined, true).errors.join("\n"), /run did not complete/)
  assert.match(assessResults([], new Map(), summary, true).errors.join("\n"), /No test files discovered/)
})

test("test diagnostics redact URLs and configured credentials", () => {
  const output = redactOutput("postgresql://user:password@host/db password abcsecret http://host/path __Secure-better-auth.session_token=issued-token; better-auth.session_token=other-token;", { APP_DB_PASSWORD: "password", COOKIE_SECRET: "abcsecret" })
  assert.equal(output.includes("password"), false)
  assert.equal(output.includes("abcsecret"), false)
  assert.equal(output.includes("postgresql://"), false)
  assert.equal(output.includes("http://"), false)
  assert.equal(output.includes("issued-token"), false)
  assert.equal(output.includes("other-token"), false)
})

test("recursive discovery rejects an empty required group even when another group has tests", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "safecheck-discovery-"))
  t.after(() => rm(directory, { recursive: true, force: true }))
  assert.deepEqual(await discoverTests(directory), [])
  assert.throws(() => requireTestGroups([["unit", ["unit.test.ts"]], ["integration", []]]), /No test files discovered in tests\/integration/)
  await writeFile(join(directory, "one.test.ts"), "export {}")
  await writeFile(join(directory, "unrelated.ts"), "export {}")
  assert.deepEqual(await discoverTests(directory), [join(directory, "one.test.ts")])
})

test("strict integration CLI fails before execution when configuration is absent", () => {
  const env: NodeJS.ProcessEnv = { ...process.env, DOTENV_CONFIG_PATH: join(tmpdir(), "safecheck-no-env-file") }
  delete env.NODE_TEST_CONTEXT
  for (const key of integrationEnvironment) delete env[key]
  const result = spawnSync(process.execPath, ["scripts/run-tests.mjs", "integration", "--strict"], { env, encoding: "utf8", timeout: 15_000 })
  assert.equal(result.status, 1, result.stdout + result.stderr)
  assert.match(result.stderr, /Missing integration environment: DATABASE_URL, MIGRATION_DATABASE_URL/)
  assert.match(result.stderr, /Executed files: 0\/\d+; tests: 0/)
})

// Exercise only tiny fixtures in a fresh process, never recursively run this suite.
test("native runner gates actual execution rather than successful file wrappers", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "safecheck-test-gate-"))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const fixture = join(directory, "fixture.test.ts")
  const runner = join(directory, "runner.mjs")
  const runnerUrl = new URL("../../scripts/run-tests.mjs", import.meta.url).href
  await writeFile(runner, `import { runTestFiles } from ${JSON.stringify(runnerUrl)}; const result = await runTestFiles([${JSON.stringify(fixture)}], { strict: process.argv[2] === 'strict' }); process.exitCode = result.errors.length ? 1 : 0;`)
  const env: NodeJS.ProcessEnv = { ...process.env, DOTENV_CONFIG_PATH: join(directory, "absent.env") }
  delete env.NODE_TEST_CONTEXT
  const cases = [
    { name: "passing tests", source: "import { test } from 'node:test'; test('executed', () => {});", status: 0, message: /tests: 1; passed: 1/ },
    { name: "skipped tests", source: "import { test } from 'node:test'; test('omitted', { skip: true }, () => {});", status: 1, message: /skipped: 1/ },
    { name: "TODO tests", source: "import { test } from 'node:test'; test('later', { todo: true }, () => {});", status: 1, message: /todo: 1/ },
    { name: "cancelled subtests", source: "import { test } from 'node:test'; test('parent', (t) => { t.test('unfinished', async () => { await new Promise(() => {}); }); });", status: 1, message: /cancelled: [1-9]/ },
    { name: "empty files", source: "export {};", status: 1, message: /did not complete|registered no tests/ },
    { name: "exit before executing tests", source: "process.exit(0);", status: 1, message: /did not complete|registered no tests/ },
  ]
  for (const scenario of cases) {
    await t.test(scenario.name, async () => {
      await writeFile(fixture, scenario.source)
      const result = spawnSync(process.execPath, [runner, "strict"], { env, encoding: "utf8", timeout: 15_000 })
      assert.equal(result.error, undefined)
      assert.equal(result.status, scenario.status, result.stdout + result.stderr)
      assert.match(result.stdout, scenario.message)
    })
  }
  await t.test("local skipped tests remain optional", async () => {
    await writeFile(fixture, "import { test } from 'node:test'; test('optional', { skip: true }, () => {});")
    const result = spawnSync(process.execPath, [runner, "local"], { env, encoding: "utf8", timeout: 15_000 })
    assert.equal(result.status, 0, result.stdout + result.stderr)
    assert.match(result.stdout, /skipped: 1/)
  })
})
