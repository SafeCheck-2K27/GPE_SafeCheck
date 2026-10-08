import assert from "node:assert/strict"
import { test } from "node:test"
import { decodeAccountAuditList } from "../../src/lib/contracts/audit"
import { ApiPayloadError } from "../../src/lib/contracts/payload"
import { listAccountAudits } from "../../src/features/account/api"

const validAudit = {
  id: "audit-1",
  status: "in_progress",
  createdAt: "2026-09-29T10:00:00.000Z",
  updatedAt: "2026-09-29T10:00:00.000Z",
  questionnaireVersion: 1, scoringVersion: 1,
  answeredCount: 2,
}

test("audit list decoder accepts an empty list and historical non-UUID identifiers", () => {
  assert.deepEqual(decodeAccountAuditList({ items: [] }), [])
  assert.deepEqual(decodeAccountAuditList({ items: [{ ...validAudit, id: "legacy/audit" }] }), [
    { ...validAudit, id: "legacy/audit" },
  ])
})

test("audit list decoder rejects invalid roots, items, fields, types, and timestamps", () => {
  for (const payload of [
    null,
    {},
    { items: {} },
    { items: [null] },
    { items: [{ ...validAudit, status: undefined }] },
    { items: [{ ...validAudit, answeredCount: "2" }] },
    { items: [{ ...validAudit, createdAt: "yesterday" }] },
    { items: [{ ...validAudit, createdAt: "2026-02-30T10:00:00.000Z" }] },
  ]) {
    assert.throws(() => decodeAccountAuditList(payload), ApiPayloadError)
  }
})

test("account audit list decodes unknown payload and returns fresh DTO values", async (t) => {
  const previousUrl = process.env.NEXT_PUBLIC_API_URL
  process.env.NEXT_PUBLIC_API_URL = "https://api.example.test"
  t.after(() => {
    if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL
    else process.env.NEXT_PUBLIC_API_URL = previousUrl
  })
  t.mock.method(globalThis, "fetch", async () => Response.json({ items: [validAudit] }))

  const result = await listAccountAudits()
  assert.deepEqual(result, [validAudit])
  assert.notEqual(result[0], validAudit)
})

test("account audit list rejects malformed summaries", async (t) => {
  const previousUrl = process.env.NEXT_PUBLIC_API_URL
  process.env.NEXT_PUBLIC_API_URL = "https://api.example.test"
  t.after(() => {
    if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL
    else process.env.NEXT_PUBLIC_API_URL = previousUrl
  })
  t.mock.method(globalThis, "fetch", async () => Response.json({ items: [{ ...validAudit, answeredCount: -1 }] }))
  await assert.rejects(listAccountAudits(), ApiPayloadError)
})

test("account audit list preserves HTTP status errors", async (t) => {
  const previousUrl = process.env.NEXT_PUBLIC_API_URL
  process.env.NEXT_PUBLIC_API_URL = "https://api.example.test"
  t.after(() => {
    if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL
    else process.env.NEXT_PUBLIC_API_URL = previousUrl
  })
  t.mock.method(globalThis, "fetch", async () => new Response(null, { status: 503 }))
  await assert.rejects(listAccountAudits(), { message: "Audit history request failed: 503" })
})

test("account audit list rejects invalid JSON and preserves cancellation", async (t) => {
  const previousUrl = process.env.NEXT_PUBLIC_API_URL
  process.env.NEXT_PUBLIC_API_URL = "https://api.example.test"
  t.after(() => {
    if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL
    else process.env.NEXT_PUBLIC_API_URL = previousUrl
  })
  t.mock.method(globalThis, "fetch", async () => new Response("not JSON"))
  await assert.rejects(listAccountAudits(), ApiPayloadError)

  const preAborted = new AbortController()
  preAborted.abort()
  const fetch = t.mock.method(globalThis, "fetch", async () => Response.json({ items: [] }))
  await assert.rejects(listAccountAudits(preAborted.signal), { name: "AbortError" })
  assert.equal(fetch.mock.callCount(), 0)

  const lateAborted = new AbortController()
  t.mock.method(globalThis, "fetch", async () => ({
    status: 200, ok: true, json: async () => {
      lateAborted.abort()
      return { items: [validAudit] }
    },
  }) as Response)
  await assert.rejects(listAccountAudits(lateAborted.signal), { name: "AbortError" })
})
