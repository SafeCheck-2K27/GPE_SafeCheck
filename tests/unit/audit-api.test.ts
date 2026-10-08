import assert from "node:assert/strict"
import { test } from "node:test"
import { AuditApiError, createAudit, getAudit, saveAnswer, submitAudit } from "../../src/features/audit/api"

const created = {
  id: "audit-id", status: "in_progress", createdAt: "2026-10-05T12:00:00.000Z",
  updatedAt: "2026-10-05T12:00:00.000Z",
  questionnaireVersion: 1, scoringVersion: 1,
}
const audit = { ...created, answeredCount: 1, answers: [{ questionId: 1, value: "a" }] }
const saved = { questionId: 1, value: "a", answeredCount: 1 }

const endpoints = [
  { name: "create", call: () => createAudit(), payload: created },
  { name: "get", call: () => getAudit("audit-id"), payload: audit },
  { name: "save", call: () => saveAnswer("audit-id", 1, "a"), payload: saved },
  { name: "submit", call: () => submitAudit("audit-id"), payload: { ...audit, status: "completed" } },
]

for (const endpoint of endpoints) {
  test(`${endpoint.name} decodes a valid response`, async (t) => {
    const previousUrl = process.env.NEXT_PUBLIC_API_URL
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.test"
    t.after(() => {
      if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL
      else process.env.NEXT_PUBLIC_API_URL = previousUrl
    })
    t.mock.method(globalThis, "fetch", async () => Response.json(endpoint.payload))
    assert.deepEqual(await endpoint.call(), endpoint.payload)
  })

  test(`${endpoint.name} rejects malformed successful responses`, async (t) => {
    const previousUrl = process.env.NEXT_PUBLIC_API_URL
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.test"
    t.after(() => {
      if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL
      else process.env.NEXT_PUBLIC_API_URL = previousUrl
    })
    for (const payload of [null, [], {}, { ...endpoint.payload, answeredCount: "1", createdAt: "invalid", value: "unknown" }]) {
      t.mock.method(globalThis, "fetch", async () => Response.json(payload))
      await assert.rejects(endpoint.call(), { name: "ApiPayloadError" })
    }
    t.mock.method(globalThis, "fetch", async () => new Response("invalid json"))
    await assert.rejects(endpoint.call(), { name: "ApiPayloadError" })
  })
}

test("audit business errors preserve status, code and safe missing question ids", async (t) => {
  const previousUrl = process.env.NEXT_PUBLIC_API_URL
  process.env.NEXT_PUBLIC_API_URL = "https://api.example.test"
  t.after(() => {
    if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL
    else process.env.NEXT_PUBLIC_API_URL = previousUrl
  })
  for (const [status, code, call] of [
    [404, "AUDIT_NOT_FOUND", () => getAudit("missing")],
    [409, "AUDIT_COMPLETED", () => saveAnswer("completed", 1, "a")],
    [400, "AUDIT_INCOMPLETE", () => submitAudit("incomplete")],
  ] as const) {
    t.mock.method(globalThis, "fetch", async () => Response.json({
      code, details: { missingQuestionIds: [1, "2", 3, 1.5, null] },
    }, { status }))
    await assert.rejects(call(), (error: unknown) => {
      assert.ok(error instanceof AuditApiError)
      assert.equal(error.status, status)
      assert.equal(error.code, code)
      assert.deepEqual(error.missingQuestionIds, [1, 3])
      return true
    })
  }
  t.mock.method(globalThis, "fetch", async () => new Response("invalid json", { status: 500 }))
  await assert.rejects(createAudit(), (error: unknown) => {
    assert.ok(error instanceof AuditApiError)
    assert.equal(error.status, 500)
    assert.equal(error.code, "API_ERROR")
    return true
  })
})

test("audit requests forward cancellation for GET, create, answer and submit", async (t) => {
  const previousUrl = process.env.NEXT_PUBLIC_API_URL
  process.env.NEXT_PUBLIC_API_URL = "https://api.example.test"
  t.after(() => {
    if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL
    else process.env.NEXT_PUBLIC_API_URL = previousUrl
  })
  const signal = new AbortController().signal
  const requests: { url: string; method: string }[] = []
  t.mock.method(globalThis, "fetch", async (url: URL, init: RequestInit) => {
    assert.equal(init.signal?.aborted, false)
    assert.equal(init.credentials, "include")
    assert.equal(init.cache, "no-store")
    requests.push({ url: url.pathname, method: init.method ?? "GET" })
    if (init.method === "PUT") assert.deepEqual(JSON.parse(init.body as string), { value: "a" })
    return Response.json(init.method === "PUT" ? saved : url.pathname === "/audits" ? created : audit)
  })
  await getAudit("audit/id", signal)
  await createAudit(signal)
  await saveAnswer("audit/id", 1, "a", signal)
  await submitAudit("audit/id", signal)
  assert.deepEqual(requests, [
    { url: "/audits/audit%2Fid", method: "GET" },
    { url: "/audits", method: "POST" },
    { url: "/audits/audit%2Fid/answers/1", method: "PUT" },
    { url: "/audits/audit%2Fid/submit", method: "POST" },
  ])
})

test("audit requests reject cancellation even when a late response body ignores abort", async (t) => {
  const previousUrl = process.env.NEXT_PUBLIC_API_URL
  process.env.NEXT_PUBLIC_API_URL = "https://api.example.test"
  t.after(() => {
    if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL
    else process.env.NEXT_PUBLIC_API_URL = previousUrl
  })
  const controller = new AbortController()
  let resolveBody!: (value: unknown) => void
  const body = new Promise<unknown>((resolve) => { resolveBody = resolve })
  t.mock.method(globalThis, "fetch", async () => ({ ok: true, json: () => body }))
  const loading = getAudit("old-audit", controller.signal)
  controller.abort()
  resolveBody({ id: "old-audit" })
  await assert.rejects(loading, { name: "AbortError" })
})

test("an already invalidated audit request never reaches fetch", async (t) => {
  const controller = new AbortController()
  controller.abort()
  const fetchMock = t.mock.method(globalThis, "fetch", async () => Response.json({}))
  await assert.rejects(createAudit(controller.signal), { name: "AbortError" })
  assert.equal(fetchMock.mock.callCount(), 0)
})
