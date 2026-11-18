import assert from "node:assert/strict"
import { test } from "node:test"
import { trustedProxies, validateApiEnvironment } from "../../server/runtime-config"

const validEnvironment = {
  BETTER_AUTH_SECRET: "a".repeat(32),
  DATABASE_URL: "postgresql://app:private-password@localhost:5432/safecheck",
}

test("API startup accepts a PostgreSQL URL and a sufficiently long auth secret", () => {
  assert.doesNotThrow(() => validateApiEnvironment(validEnvironment))
})

test("API startup rejects short auth secrets without revealing their value", () => {
  assert.throws(
    () => validateApiEnvironment({ ...validEnvironment, BETTER_AUTH_SECRET: "private-secret" }),
    (error: unknown) => {
      assert.match(String(error), /BETTER_AUTH_SECRET must contain at least 32 characters/)
      assert.equal(String(error).includes("private-secret"), false)
      return true
    },
  )
})

test("API startup rejects non-PostgreSQL database URLs without revealing credentials", () => {
  assert.throws(
    () => validateApiEnvironment({ ...validEnvironment, DATABASE_URL: "https://user:private-password@example.test/db" }),
    (error: unknown) => {
      assert.match(String(error), /DATABASE_URL must be a valid PostgreSQL URL/)
      assert.equal(String(error).includes("private-password"), false)
      return true
    },
  )
})

test("production requires HTTPS API and browser origins", () => {
  const production = { ...validEnvironment, NODE_ENV: "production", WEB_ORIGIN: "https://safecheck.example", BETTER_AUTH_URL: "https://api.safecheck.example" }
  assert.doesNotThrow(() => validateApiEnvironment(production))
  assert.throws(() => validateApiEnvironment({ ...production, WEB_ORIGIN: "http://safecheck.example" }), /WEB_ORIGIN must use HTTPS/)
  assert.throws(() => validateApiEnvironment({ ...production, BETTER_AUTH_URL: "http://api.safecheck.example" }), /BETTER_AUTH_URL must use HTTPS/)
  assert.throws(() => validateApiEnvironment({ ...production, WEB_ORIGIN: "https://safecheck.example/path" }), /WEB_ORIGIN must be an exact origin/)
})

test("proxy trust is explicit and restricted to narrow IP ranges", () => {
  assert.deepEqual(trustedProxies(validEnvironment), [])
  assert.deepEqual(trustedProxies({ API_TRUSTED_PROXIES: "198.51.100.10,2001:db8::1/128" }), ["198.51.100.10", "2001:db8::1/128"])
  assert.deepEqual(trustedProxies({ API_TRUSTED_PROXIES: "2001:db8:ffff::1/128" }), ["2001:db8:ffff::1/128"])
  for (const value of ["0.0.0.0/0", "10.0.0.0/8", "::/0", "::ffff:0:0/96", "0:0:0:0:0:ffff:0:0/96", "loopback", "198.51.100.10,"]) {
    assert.throws(() => trustedProxies({ API_TRUSTED_PROXIES: value }), /API_TRUSTED_PROXIES/)
  }
})
