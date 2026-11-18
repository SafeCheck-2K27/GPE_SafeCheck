import "dotenv/config"
import { run } from "node:test"
import { fileURLToPath } from "node:url"
import { relative, resolve } from "node:path"
import { inspect } from "node:util"
import { assessResults, discoverTests, missingIntegrationEnvironment, redactOutput, requireTestGroups } from "./test-gate.mjs"

export async function runTestFiles(files, { strict = false, redactionEnv = process.env, log = console.log } = {}) {
  const expected = files.map((file) => resolve(file))
  log(`Expected files (${expected.length}):\n${expected.map((file) => `  ${relative(process.cwd(), file)}`).join("\n")}`)
  const summaries = new Map()
  let finalSummary
  const started = performance.now()
  for await (const event of run({ files: expected, execArgv: ["--import", "tsx"], concurrency: true })) {
    const { type, data } = event
    if (type === "test:summary") {
      if (data.file) summaries.set(resolve(data.file), data)
      else finalSummary = data
    } else if (type === "test:fail") {
      log(redactOutput(`FAIL ${data.name}\n${inspect(data.details.error, { depth: 5 })}`, redactionEnv))
    } else if (type === "test:stdout" || type === "test:stderr") {
      log(redactOutput(data.message.trimEnd(), redactionEnv))
    }
  }
  const result = assessResults(expected, summaries, finalSummary, strict)
  const counts = result.counts ?? { tests: 0, passed: 0, failed: 0, cancelled: 0, skipped: 0, todo: 0 }
  log(`Executed files: ${result.executed.length}/${expected.length}; tests: ${counts.tests}; passed: ${counts.passed}; failed: ${counts.failed}; skipped: ${counts.skipped}; cancelled: ${counts.cancelled}; todo: ${counts.todo}; duration: ${((performance.now() - started) / 1000).toFixed(2)}s`)
  for (const error of result.errors) log(redactOutput(`GATE: ${error}`, redactionEnv))
  return result
}

async function main() {
  const args = process.argv.slice(2)
  const scope = args[0] ?? "all"
  if (!["unit", "integration", "all"].includes(scope) || args.slice(1).some((arg) => arg !== "--strict")) {
    throw new Error("Usage: node scripts/run-tests.mjs [unit|integration|all] [--strict]")
  }
  const strict = args.includes("--strict") || /^(?:1|true)$/i.test(process.env.CI ?? "")
  const groups = scope === "all" ? ["unit", "integration"] : [scope]
  const discovered = await Promise.all(groups.map(async (group) => [group, await discoverTests(resolve("tests", group))]))
  requireTestGroups(discovered)
  const files = discovered.flatMap(([, files]) => files)
  if (strict && groups.includes("integration")) {
    const missing = missingIntegrationEnvironment(process.env)
    if (missing.length) {
      console.error(`GATE: Missing integration environment: ${missing.join(", ")}`)
      console.error(`Expected files (${files.length}):\n${files.map((file) => `  ${relative(process.cwd(), file)}`).join("\n")}`)
      console.error(`Executed files: 0/${files.length}; tests: 0; skipped: 0; cancelled: 0; todo: 0`)
      process.exitCode = 1
      return
    }
  }
  const result = await runTestFiles(files, { strict })
  if (result.errors.length) process.exitCode = 1
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(redactOutput(error.stack ?? error, process.env))
    process.exitCode = 1
  })
}
