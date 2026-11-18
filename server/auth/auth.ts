import "dotenv/config"
import { prismaAdapter } from "@better-auth/prisma-adapter"
import { betterAuth } from "better-auth"
import { prisma } from "../../src/lib/prisma"
import { CANONICAL_IP_HEADER } from "./request-headers"

function requireExactOrigin(name: "WEB_ORIGIN" | "BETTER_AUTH_URL"): string {
  const origin = process.env[name]
  if (!origin || new URL(origin).origin !== origin) {
    throw new Error(`${name} must be an exact origin`)
  }
  return origin
}

const webOrigin = requireExactOrigin("WEB_ORIGIN")
export const authOrigin = requireExactOrigin("BETTER_AUTH_URL")

export function createAuth(database: Parameters<typeof prismaAdapter>[0] = prisma) {
  return betterAuth({
    baseURL: authOrigin,
    trustedOrigins: [webOrigin],
    database: prismaAdapter(database, { provider: "postgresql", transaction: true }),
    emailAndPassword: { enabled: true },
    advanced: { ipAddress: { ipAddressHeaders: [CANONICAL_IP_HEADER] } },
    user: { modelName: "User" },
  })
}

export const auth = createAuth()
