import { existsSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { defineConfig } from "@playwright/test"

function resolveSystemBrowser(): string {
  const programFiles = process.env.PROGRAMFILES ?? "C:\\Program Files"
  const programFilesX86 = process.env["PROGRAMFILES(X86)"] ?? "C:\\Program Files (x86)"
  const localAppData = process.env.LOCALAPPDATA ?? ""
  const operaRoot = join(localAppData, "Programs", "Opera GX")
  const operaVersionedExecutables = existsSync(operaRoot)
    ? readdirSync(operaRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && /^\d+(?:\.\d+)+$/.test(entry.name))
        .sort((left, right) =>
          right.name.localeCompare(left.name, undefined, { numeric: true }),
        )
        .map((entry) => join(operaRoot, entry.name, "opera.exe"))
    : []
  const candidates = [
    process.env.PLAYWRIGHT_SYSTEM_BROWSER,
    join(programFilesX86, "Microsoft", "Edge", "Application", "msedge.exe"),
    join(programFiles, "Microsoft", "Edge", "Application", "msedge.exe"),
    join(localAppData, "Microsoft", "Edge", "Application", "msedge.exe"),
    join(programFilesX86, "Google", "Chrome", "Application", "chrome.exe"),
    join(programFiles, "Google", "Chrome", "Application", "chrome.exe"),
    join(localAppData, "Google", "Chrome", "Application", "chrome.exe"),
    ...operaVersionedExecutables,
  ].filter((candidate): candidate is string => Boolean(candidate))

  const executablePath = candidates.find((candidate) => existsSync(candidate))
  if (!executablePath) {
    throw new Error(
      "No supported system browser found. Set PLAYWRIGHT_SYSTEM_BROWSER to an existing Chromium executable.",
    )
  }

  return executablePath
}

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "line",
  outputDir: "test-results",
  use: {
    baseURL: "http://127.0.0.1:3100",
    headless: true,
    contextOptions: { reducedMotion: "reduce" },
    viewport: { width: 1280, height: 800 },
    launchOptions: {
      executablePath: resolveSystemBrowser(),
    },
    trace: "retain-on-failure",
  },
})
