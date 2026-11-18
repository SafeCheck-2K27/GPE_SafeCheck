import { isIP } from "node:net"

export type ApiEnvironment = {
  DATABASE_URL?: string
  BETTER_AUTH_SECRET?: string
  [key: string]: string | undefined
}

/** Validate server credentials without including their values in diagnostics. */
export function validateApiEnvironment(env: ApiEnvironment = process.env) {
  if (!env.BETTER_AUTH_SECRET || env.BETTER_AUTH_SECRET.length < 32) {
    throw new Error("BETTER_AUTH_SECRET must contain at least 32 characters")
  }

  try {
    const databaseUrl = new URL(env.DATABASE_URL ?? "")
    if (
      !["postgres:", "postgresql:"].includes(databaseUrl.protocol) ||
      !databaseUrl.hostname ||
      databaseUrl.pathname.length < 2
    ) {
      throw new Error("invalid PostgreSQL URL")
    }
  } catch {
    throw new Error("DATABASE_URL must be a valid PostgreSQL URL")
  }

  for (const key of ["WEB_ORIGIN", "BETTER_AUTH_URL"]) {
    const value = env[key]
    if (!value) {
      if (env.NODE_ENV === "production") throw new Error(`${key} must be an exact HTTPS origin in production`)
      continue
    }
    try {
      const parsed = new URL(value)
      if (parsed.origin !== value || !["http:", "https:"].includes(parsed.protocol)) throw new Error()
      if (env.NODE_ENV === "production" && parsed.protocol !== "https:") {
        throw new Error(`${key} must use HTTPS in production`)
      }
    } catch (error) {
      if (error instanceof Error && error.message === `${key} must use HTTPS in production`) throw error
      throw new Error(`${key} must be an exact origin`)
    }
  }

  trustedProxies(env)
}

/** Empty by default. Only explicitly named proxy sockets can supply forwarding data. */
export function trustedProxies(env: ApiEnvironment = process.env): string[] {
  const setting = env.API_TRUSTED_PROXIES
  if (!setting) return []
  const entries = setting.split(",").map((entry) => entry.trim())
  for (const entry of entries) {
    const [address, prefix, extra] = entry.split("/")
    const family = isIP(address)
    const minimum = family === 4 ? 24 : 64
    const maximum = family === 4 ? 32 : 128
    // IPv4-mapped IPv6 entries could otherwise trust the entire IPv4 space
    // with an apparently narrow /96. WHATWG URL expands mapped notation.
    const mapped = family === 6 && new URL(`http://[${address}]`).hostname.startsWith("[::ffff:")
    if (!family || extra !== undefined || mapped || (prefix !== undefined && (
      !/^\d+$/.test(prefix) || Number(prefix) < minimum || Number(prefix) > maximum
    ))) {
      throw new Error("API_TRUSTED_PROXIES must contain only IPs or narrow CIDRs")
    }
  }
  return entries
}
