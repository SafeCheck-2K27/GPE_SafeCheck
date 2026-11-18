import type { FastifyRequest } from "fastify"

/** Browser mutations need our exact Origin. Non-browser clients may omit both
 * Origin and Fetch Metadata; these headers are not an authentication mechanism. */
export function allowsBrowserMutation(request: FastifyRequest): boolean {
  const origin = request.headers.origin
  if (origin !== undefined) return origin === process.env.WEB_ORIGIN

  const site = request.headers["sec-fetch-site"]
  const mode = request.headers["sec-fetch-mode"]
  if (site === undefined && mode === undefined) return true
  return site === "same-origin" && (mode === "cors" || mode === "same-origin")
}
