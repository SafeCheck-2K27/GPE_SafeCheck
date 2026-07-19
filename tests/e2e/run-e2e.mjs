import { spawn } from "node:child_process"
import { join } from "node:path"

const root = process.cwd()
const nextCli = join(root, "node_modules", "next", "dist", "bin", "next")
const playwrightCli = join(root, "node_modules", "@playwright", "test", "cli.js")

const server = spawn(
  process.execPath,
  [nextCli, "start", "--hostname", "127.0.0.1", "--port", "3100"],
  { cwd: root, stdio: "inherit", windowsHide: true },
)

try {
  await waitForServer(server)

  const testProcess = spawn(
    process.execPath,
    [playwrightCli, "test", ...process.argv.slice(2)],
    { cwd: root, stdio: "inherit", windowsHide: true },
  )
  const testExitCode = await waitForExit(testProcess)
  process.exitCode = testExitCode ?? 1
} finally {
  await stopProcess(server)
}

async function waitForServer(serverProcess) {
  const deadline = Date.now() + 120_000

  while (Date.now() < deadline) {
    if (serverProcess.exitCode !== null) {
      throw new Error(`Next server exited with code ${serverProcess.exitCode}`)
    }

    try {
      const response = await fetch("http://127.0.0.1:3100")
      if (response.ok) return
    } catch {
      // The server is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  throw new Error("Timed out waiting for the Next test server")
}

function waitForExit(childProcess) {
  return new Promise((resolve, reject) => {
    childProcess.once("error", reject)
    childProcess.once("exit", resolve)
  })
}

async function stopProcess(childProcess) {
  if (childProcess.exitCode !== null || childProcess.killed) return

  childProcess.kill()
  await Promise.race([
    waitForExit(childProcess),
    new Promise((resolve) => setTimeout(resolve, 5_000)),
  ])

  if (childProcess.exitCode === null) childProcess.kill("SIGKILL")
}
