import type { FastifyPluginAsync } from "fastify"
import { auth, authOrigin } from "./auth"
import { authRequestHeaders } from "./request-headers"

const tokenResponsePaths = new Set([
  "/api/auth/sign-up/email",
  "/api/auth/sign-in/email",
  "/api/auth/get-session",
])

function omitSessionToken(pathname: string, body: Buffer): Buffer {
  if (!tokenResponsePaths.has(pathname)) return body

  const payload: unknown = JSON.parse(body.toString("utf8"))
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
    return body
  }

  const data = payload as Record<string, unknown>
  delete data.token
  if (pathname === "/api/auth/get-session" && data.session && typeof data.session === "object") {
    delete (data.session as Record<string, unknown>).token
  }
  return Buffer.from(JSON.stringify(data))
}

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    async handler(request, reply) {
      const headers = authRequestHeaders(request)
      headers.delete("content-length")

      const url = new URL(request.url, authOrigin)
      const authRequest = new Request(url, {
        method: request.method,
        headers,
        ...(request.body === undefined ? {} : { body: JSON.stringify(request.body) }),
      })
      const response = await auth.handler(authRequest)

      reply.code(response.status)
      response.headers.forEach((value, key) => {
        if (key !== "set-cookie" && key !== "content-length" && key !== "etag") {
          reply.header(key, value)
        }
      })
      const cookies = response.headers.getSetCookie()
      if (cookies.length > 0) reply.header("set-cookie", cookies)

      if (!response.body) return reply.send(null)
      const body = Buffer.from(await response.arrayBuffer())
      return reply.send(
        response.ok && response.headers.get("content-type")?.includes("application/json")
          ? omitSessionToken(url.pathname, body)
          : body,
      )
    },
  })
}
