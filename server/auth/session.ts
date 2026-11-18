import type { FastifyReply, FastifyRequest } from "fastify"
import { auth } from "./auth"
import { authRequestHeaders } from "./request-headers"

/** Resolve the authoritative user and preserve any session cookies Better Auth refreshes. */
export async function authenticatedUserId(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<string | null> {
  const { headers, response: session } = await auth.api.getSession({
    headers: authRequestHeaders(request),
    returnHeaders: true,
  })

  const refreshedCookies = headers.getSetCookie()
  if (refreshedCookies.length > 0) {
    reply.header("set-cookie", refreshedCookies)
  }

  return session?.user.id ?? null
}
