import assert from "node:assert/strict"
import { test } from "node:test"
import { AuditRateLimiter, auditRateLimitKey } from "../../server/audits/rate-limit"

test("audit rate limits reset when their fixed window expires", () => {
  const limiter = new AuditRateLimiter(2, 1000)
  assert.equal(limiter.consume("ip", 100).allowed, true)
  assert.equal(limiter.consume("ip", 200).allowed, true)
  assert.deepEqual(limiter.consume("ip", 300), { allowed: false, retryAfterSeconds: 1 })
  assert.equal(limiter.consume("ip", 1100).allowed, true)
})

test("bounded limiter does not evict live keys under key churn", () => {
  const limiter = new AuditRateLimiter(1, 1000, 1)
  assert.equal(limiter.consume("a", 0).allowed, true)
  assert.deepEqual(limiter.consume("b", 100), { allowed: false, retryAfterSeconds: 1 })
  assert.deepEqual(limiter.consume("a", 100), { allowed: false, retryAfterSeconds: 1 })
  assert.equal(limiter.consume("b", 1000).allowed, true)
})

test("rate limit keys use IPv4 addresses and group IPv6 /64", () => {
  assert.notEqual(auditRateLimitKey("192.0.2.1"), auditRateLimitKey("192.0.2.254"))
  assert.equal(auditRateLimitKey("2001:db8:1:2::1"), auditRateLimitKey("2001:db8:1:2:ffff::9"))
  assert.equal(auditRateLimitKey("2001:db8:1:2::1"), auditRateLimitKey("2001:0db8:0001:0002:ffff::9"))
  assert.notEqual(auditRateLimitKey("2001:db8:1:2::1"), auditRateLimitKey("2001:db8:1:3::1"))
  assert.equal(auditRateLimitKey("::ffff:192.0.2.4"), auditRateLimitKey("192.0.2.4"))
})
