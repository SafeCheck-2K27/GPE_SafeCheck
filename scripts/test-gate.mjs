import { readdir } from "node:fs/promises"
import { resolve } from "node:path"

export const integrationEnvironment = [
  "DATABASE_URL", "MIGRATION_DATABASE_URL", "COOKIE_SECRET",
  "BETTER_AUTH_SECRET", "BETTER_AUTH_URL", "WEB_ORIGIN",
]

export function missingIntegrationEnvironment(env) {
  return integrationEnvironment.filter((key) => !env[key]?.trim())
}

export async function discoverTests(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(entries.map(async (entry) => {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) return discoverTests(path)
    return entry.isFile() && entry.name.endsWith(".test.ts") ? [path] : []
  }))
  return files.flat().sort()
}

export function requireTestGroups(groups) {
  for (const [group, files] of groups) {
    if (!files.length) throw new Error(`No test files discovered in tests/${group}`)
  }
}

export function assessResults(expectedFiles, summaries, finalSummary, strict) {
  const errors = []
  const executed = expectedFiles.filter((file) => {
    const counts = summaries.get(file)?.counts
    return counts && counts.tests - counts.skipped - counts.todo > 0
  })
  if (!expectedFiles.length) errors.push("No test files discovered")
  for (const file of expectedFiles) {
    const summary = summaries.get(file)
    if (!summary) errors.push(`Test file did not complete: ${file}`)
    else if (summary.counts.tests === 0) errors.push(`Test file registered no tests: ${file}`)
    else if (!summary.success) errors.push(`Test file failed: ${file}`)
  }
  if (!finalSummary) errors.push("Test run did not complete")
  else {
    const counts = finalSummary.counts
    if (!finalSummary.success || counts.failed || counts.cancelled) errors.push("Failed or cancelled tests")
    if (strict && (counts.skipped || counts.todo)) errors.push("Strict gate rejects skipped or TODO tests")
    if (!counts.tests) errors.push("No tests executed")
  }
  return { errors, executed, counts: finalSummary?.counts }
}

// Child diagnostics can contain connection strings or application secrets.
export function redactOutput(value, env) {
  let output = String(value)
    .replace(/\b(?:postgres(?:ql)?|https?):\/\/[^\s'"<>]+/gi, "[redacted URL]")
    .replace(/((?:__Secure-)?better-auth\.session_token=)[^;\s'"<>]+/gi, "$1[redacted]")
  for (const [key, secret] of Object.entries(env)) {
    if (/(?:SECRET|PASSWORD|TOKEN|DATABASE_URL)/i.test(key) && secret) output = output.replaceAll(secret, "[redacted]")
  }
  return output
}
