import assert from "node:assert/strict"
import { test, type TestContext } from "node:test"
import { apiFetchJson, API_REQUEST_TIMEOUT_MS, ApiTimeoutError } from "../../src/lib/api-fetch"
import { ApiPayloadError } from "../../src/lib/contracts/payload"

function configure(t: TestContext) {
  const previous = process.env.NEXT_PUBLIC_API_URL
  process.env.NEXT_PUBLIC_API_URL = "https://api.example.test/base"
  t.after(() => {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_API_URL
    else process.env.NEXT_PUBLIC_API_URL = previous
  })
}

test("HTTP core forwards request options and reads JSON once", async (t) => {
  configure(t)
  const signal = new AbortController().signal
  let reads = 0
  t.mock.method(globalThis, "fetch", async (url: URL, init: RequestInit) => {
    assert.equal(url.href, "https://api.example.test/items/1")
    assert.equal(init.method, "PUT")
    assert.equal(init.body, "{}")
    assert.deepEqual(init.headers, { "Content-Type": "application/json" })
    assert.notEqual(init.signal, signal)
    assert.equal(init.signal?.aborted, false)
    assert.equal(init.credentials, "include")
    assert.equal(init.cache, "no-store")
    return { status: 201, ok: true, json: async () => { reads++; return { id: 1 } } } as Response
  })
  assert.deepEqual(await apiFetchJson("/items/1", {
    method: "PUT", body: "{}", headers: { "Content-Type": "application/json" }, signal,
    credentials: "omit", cache: "force-cache",
  }), { status: 201, ok: true, payload: { id: 1 } })
  assert.equal(reads, 1)
})

test("HTTP core refuses pre-aborted calls without fetching", async (t) => {
  configure(t)
  const controller = new AbortController()
  controller.abort()
  const fetch = t.mock.method(globalThis, "fetch", async () => Response.json({}))
  await assert.rejects(apiFetchJson("/items", { signal: controller.signal }), { name: "AbortError" })
  assert.equal(fetch.mock.callCount(), 0)
})

test("HTTP core checks cancellation after fetch even when fetch ignores it", async (t) => {
  configure(t)
  const controller = new AbortController()
  let reads = 0
  t.mock.method(globalThis, "fetch", async () => {
    controller.abort()
    return { status: 200, ok: true, json: async () => { reads++; return {} } } as Response
  })
  await assert.rejects(apiFetchJson("/items", { signal: controller.signal }), { name: "AbortError" })
  assert.equal(reads, 0)
})

test("HTTP core checks cancellation after JSON settles, including malformed JSON", async (t) => {
  configure(t)
  for (const malformed of [false, true]) {
    const controller = new AbortController()
    t.mock.method(globalThis, "fetch", async () => ({
      status: 200, ok: true, json: async () => {
        controller.abort()
        if (malformed) throw new SyntaxError("bad JSON")
        return {}
      },
    }) as Response)
    await assert.rejects(apiFetchJson("/items", { signal: controller.signal }), { name: "AbortError" })
  }
})

test("HTTP core preserves fetch, body stream, and abort failures", async (t) => {
  configure(t)
  for (const fromBody of [false, true]) {
    for (const failure of [new TypeError("connection lost"), new DOMException("cancelled", "AbortError")]) {
      t.mock.method(globalThis, "fetch", async () => {
        if (!fromBody) throw failure
        const response = new Response(null, { status: 503 })
        t.mock.method(response, "json", async () => { throw failure })
        return response
      })
      await assert.rejects(apiFetchJson("/items"), (error) => error === failure)
    }
  }
})

test("HTTP core rejects malformed successful JSON but preserves HTTP error classification", async (t) => {
  configure(t)
  t.mock.method(globalThis, "fetch", async () => new Response("not JSON", { status: 200 }))
  await assert.rejects(apiFetchJson("/items"), ApiPayloadError)
  t.mock.method(globalThis, "fetch", async () => new Response("not JSON", { status: 503 }))
  assert.deepEqual(await apiFetchJson("/items"), { status: 503, ok: false, payload: null })
})

test("HTTP core retains structured HTTP error payloads and checks configuration", async (t) => {
  configure(t)
  t.mock.method(globalThis, "fetch", async () => Response.json({ code: "CONFLICT" }, { status: 409 }))
  assert.deepEqual(await apiFetchJson("/items"), { status: 409, ok: false, payload: { code: "CONFLICT" } })
  delete process.env.NEXT_PUBLIC_API_URL
  await assert.rejects(apiFetchJson("/items"), { message: "NEXT_PUBLIC_API_URL is not configured" })
})

for (const fromBody of [false, true]) {
  test(`HTTP deadline bounds a stalled ${fromBody ? "JSON body" : "fetch"} and ignores late settlement`, async (t) => {
    configure(t)
    t.mock.timers.enable({ apis: ["setTimeout"] })
    const session = new AbortController()
    let transport!: AbortSignal
    let finish!: (value: unknown) => void
    let reads = 0
    const stalled = new Promise<unknown>((resolve) => { finish = resolve })
    const response = { status: 200, ok: true, json: () => { reads++; return fromBody ? stalled : Promise.resolve({}) } } as Response
    t.mock.method(globalThis, "fetch", (_url: URL, init: RequestInit) => {
      transport = init.signal!
      return fromBody ? Promise.resolve(response) : stalled
    })
    const request = apiFetchJson("/items", { signal: session.signal })
    const rejected = assert.rejects(request, ApiTimeoutError)
    await Promise.resolve() // Let the fetch-success case start decoding the body.
    t.mock.timers.tick(API_REQUEST_TIMEOUT_MS - 1)
    assert.equal(transport.aborted, false)
    t.mock.timers.tick(1)
    await rejected
    assert.equal(transport.aborted, true)
    assert.ok(transport.reason instanceof ApiTimeoutError)
    assert.equal(session.signal.aborted, false)
    finish(fromBody ? {} : response)
    await Promise.resolve()
    assert.equal(reads, fromBody ? 1 : 0)
  })
}

test("HTTP session cancellation settles ignored transport immediately and keeps its reason", async (t) => {
  configure(t)
  t.mock.timers.enable({ apis: ["setTimeout"] })
  const session = new AbortController()
  const reason = new DOMException("Session changed", "AbortError")
  let transport!: AbortSignal
  t.mock.method(globalThis, "fetch", (_url: URL, init: RequestInit) => {
    transport = init.signal!
    return new Promise<Response>(() => {})
  })
  const request = apiFetchJson("/items", { signal: session.signal })
  const rejected = assert.rejects(request, (error) => error === reason)
  session.abort(reason)
  await rejected
  t.mock.timers.tick(API_REQUEST_TIMEOUT_MS)
  assert.equal(transport.reason, reason)
})

test("HTTP success and failure clear deadlines and caller abort listeners", async (t) => {
  configure(t)
  t.mock.timers.enable({ apis: ["setTimeout"] })
  const clear = t.mock.method(globalThis, "clearTimeout")
  for (const failure of [false, true]) {
    const session = new AbortController()
    const remove = t.mock.method(session.signal, "removeEventListener")
    let transport!: AbortSignal
    t.mock.method(globalThis, "fetch", async (_url: URL, init: RequestInit) => {
      transport = init.signal!
      if (failure) throw new TypeError("offline")
      return Response.json({})
    })
    if (failure) await assert.rejects(apiFetchJson("/items", { signal: session.signal }), TypeError)
    else await apiFetchJson("/items", { signal: session.signal })
    assert.equal(remove.mock.callCount(), 1)
    session.abort()
    t.mock.timers.tick(API_REQUEST_TIMEOUT_MS)
    assert.equal(transport.aborted, false)
  }
  assert.equal(clear.mock.callCount(), 2)
})
