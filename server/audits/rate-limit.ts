export type RateLimitDecision = { allowed: true; retryAfterSeconds: 0 } | { allowed: false; retryAfterSeconds: number }

type Bucket = { startedAt: number; count: number }

/** A bounded fixed-window limiter. Full maps reject new keys until space expires instead of evicting live quotas. */
export class AuditRateLimiter {
  private readonly buckets = new Map<string, Bucket>()
  private operations = 0

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly maxKeys = 4096,
  ) {}

  consume(key: string, now = Date.now()): RateLimitDecision {
    if (++this.operations % 128 === 0 || this.buckets.size >= this.maxKeys) this.removeExpired(now)
    const bucket = this.buckets.get(key)
    if (bucket && now - bucket.startedAt < this.windowMs) {
      if (bucket.count >= this.limit) {
        return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((bucket.startedAt + this.windowMs - now) / 1000)) }
      }
      bucket.count += 1
      return { allowed: true, retryAfterSeconds: 0 }
    }
    if (this.buckets.size >= this.maxKeys) {
      const soonestExpiry = Math.min(...Array.from(this.buckets.values(), (item) => item.startedAt + this.windowMs))
      return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((soonestExpiry - now) / 1000)) }
    }
    this.buckets.set(key, { startedAt: now, count: 1 })
    return { allowed: true, retryAfterSeconds: 0 }
  }

  private removeExpired(now: number) {
    for (const [key, bucket] of this.buckets) {
      if (now - bucket.startedAt >= this.windowMs) this.buckets.delete(key)
    }
  }
}

function expandIpv6(ip: string): string[] | null {
  const halves = ip.toLowerCase().split("::")
  if (halves.length > 2) return null
  const left = halves[0] ? halves[0].split(":") : []
  const right = halves.length === 2 && halves[1] ? halves[1].split(":") : []
  const missing = 8 - left.length - right.length
  if ((halves.length === 1 && missing !== 0) || (halves.length === 2 && missing < 1)) return null
  const groups = [...left, ...Array(missing).fill("0"), ...right]
  return groups.length === 8 && groups.every((group) => /^[0-9a-f]{1,4}$/.test(group)) ? groups : null
}

/** Normalize resolved Fastify peer addresses to IPv4 /32 and IPv6 /64 buckets. */
export function auditRateLimitKey(ip: string): string {
  const mapped = ip.toLowerCase().match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/)
  const candidate = mapped?.[1] ?? ip
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(candidate)) {
    const octets = candidate.split(".").map(Number)
    if (octets.every((part) => part >= 0 && part <= 255)) return `v4:${octets.join(".")}`
  }
  const groups = expandIpv6(candidate)
  return groups ? `v6:${groups.slice(0, 4).map((group) => Number.parseInt(group, 16).toString(16)).join(":")}` : `ip:${ip}`
}
