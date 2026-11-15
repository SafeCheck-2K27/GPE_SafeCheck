import assert from "node:assert/strict"
import { test } from "node:test"
import { decodeAccountAuditList } from "../../src/lib/contracts/audit"
import { ApiPayloadError } from "../../src/lib/contracts/payload"
import { listAccountAudits } from "../../src/features/account/api"

const validAudit = {
  id: "audit-1", status: "in_progress", createdAt: "2026-09-29T10:00:00.000Z", updatedAt: "2026-09-29T10:00:00.000Z",
  questionnaireVersion: 1, scoringVersion: 1, answeredCount: 2,
}
const page = (items = [validAudit], nextCursor: string | null = null) => ({
  items, nextCursor, counts: { total: items.length, completed: 0, inProgress: items.length },
})

test("audit list decoder accepts empty pages and historical non-UUID identifiers", () => {
  assert.deepEqual(decodeAccountAuditList(page([], null)), page([], null))
  assert.deepEqual(decodeAccountAuditList(page([{ ...validAudit, id: "legacy/audit" }], "next")), page([{ ...validAudit, id: "legacy/audit" }], "next"))
})

test("audit list decoder rejects malformed pages and summaries", () => {
  for (const payload of [
    null, {}, { ...page(), items: {} }, { ...page(), items: [null] },
    page([{ ...validAudit, status: undefined }]), page([{ ...validAudit, answeredCount: "2" }]),
    page([{ ...validAudit, createdAt: "yesterday" }]), page([{ ...validAudit, createdAt: "2026-02-30T10:00:00.000Z" }]),
    { ...page(), nextCursor: 4 }, { ...page(), counts: { total: 3, completed: 0, inProgress: 1 } },
  ]) assert.throws(() => decodeAccountAuditList(payload), ApiPayloadError)
})

test("account audit API decodes a page and sends the continuation cursor", async (t) => {
  const previousUrl = process.env.NEXT_PUBLIC_API_URL
  process.env.NEXT_PUBLIC_API_URL = "https://api.example.test"
  t.after(() => {
    if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL
    else process.env.NEXT_PUBLIC_API_URL = previousUrl
  })
  const fetch = t.mock.method(globalThis, "fetch", async () => Response.json(page([validAudit], "eyJjdXJzb3IifQ")))

  const result = await listAccountAudits("cursor/1")
  assert.deepEqual(result, page([validAudit], "eyJjdXJzb3IifQ"))
  assert.match(String(fetch.mock.calls[0].arguments[0]), /\/audits\?cursor=cursor%2F1$/)
  assert.notEqual(result.items[0], validAudit)
})

test("account audit list rejects malformed summaries and preserves HTTP status errors", async (t) => {
  const previousUrl = process.env.NEXT_PUBLIC_API_URL
  process.env.NEXT_PUBLIC_API_URL = "https://api.example.test"
  t.after(() => {
    if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL
    else process.env.NEXT_PUBLIC_API_URL = previousUrl
  })
  t.mock.method(globalThis, "fetch", async () => Response.json(page([{ ...validAudit, answeredCount: -1 }])))
  await assert.rejects(listAccountAudits(), ApiPayloadError)
  t.mock.method(globalThis, "fetch", async () => new Response(null, { status: 503 }))
  await assert.rejects(listAccountAudits(), { message: "Audit history request failed: 503" })
})

test("account audit list preserves invalid JSON and cancellation", async (t) => {
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
  const fetch = t.mock.method(globalThis, "fetch", async () => Response.json(page([])))
  await assert.rejects(listAccountAudits(null, preAborted.signal), { name: "AbortError" })
  assert.equal(fetch.mock.callCount(), 0)

  const lateAborted = new AbortController()
  t.mock.method(globalThis, "fetch", async () => ({ status: 200, ok: true, json: async () => {
    lateAborted.abort()
    return page()
  } }) as Response)
  await assert.rejects(listAccountAudits(null, lateAborted.signal), { name: "AbortError" })
})
