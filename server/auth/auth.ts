import "dotenv/config"
import { prismaAdapter } from "@better-auth/prisma-adapter"
import { betterAuth } from "better-auth"
import { prisma } from "../../src/lib/prisma"
import { CANONICAL_IP_HEADER } from "./request-headers"

const webOrigin = process.env.WEB_ORIGIN
export const authOrigin = process.env.BETTER_AUTH_URL

if (!webOrigin || new URL(webOrigin).origin !== webOrigin) {
  throw new Error("WEB_ORIGIN must be an exact origin")
}
if (!authOrigin || new URL(authOrigin).origin !== authOrigin) {
  throw new Error("BETTER_AUTH_URL must be an exact origin")
}

export const auth = betterAuth({
  baseURL: authOrigin,
  trustedOrigins: [webOrigin],
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  advanced: { ipAddress: { ipAddressHeaders: [CANONICAL_IP_HEADER] } },
  user: { modelName: "User" },
})
