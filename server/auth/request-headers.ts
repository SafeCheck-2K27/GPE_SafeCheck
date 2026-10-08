import { isIP } from "node:net"
import { fromNodeHeaders } from "better-auth/node"
import type { FastifyRequest } from "fastify"

export const CANONICAL_IP_HEADER = "x-safecheck-client-ip"

/** The header is private to this handoff; incoming copies are always overwritten. */
export function authRequestHeaders(request: FastifyRequest): Headers {
  const headers = fromNodeHeaders(request.headers)
  const address = isIP(request.ip) ? request.ip : request.raw.socket.remoteAddress
  if (address && isIP(address)) headers.set(CANONICAL_IP_HEADER, address)
  else headers.delete(CANONICAL_IP_HEADER)
  return headers
}
