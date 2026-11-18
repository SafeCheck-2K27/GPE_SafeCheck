import { createAuthClient } from "better-auth/react"

const configuredAuthApiOrigin = process.env.NEXT_PUBLIC_API_URL

if (!configuredAuthApiOrigin) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured")
}

export const authApiOrigin = configuredAuthApiOrigin

export const authClient = createAuthClient({
  baseURL: authApiOrigin,
  fetchOptions: { credentials: "include" },
})
