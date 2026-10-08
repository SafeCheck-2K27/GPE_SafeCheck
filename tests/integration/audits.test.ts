import "dotenv/config"
import assert from "node:assert/strict"
import { after, beforeEach, describe, test } from "node:test"
import { cleanupIntegration, createIntegrationApp } from "../helpers/integration"

import { auditQuestions } from "../../src/features/audit/data"

describe("Audit HTTP guest lifecycle", { skip: !process.env.DATABASE_URL }, async () => {
  process.env.COOKIE_SECRET ||= "safecheck-integration-test-cookie-secret"
  process.env.WEB_ORIGIN ||= "http://localhost:3000"

  const { app, prisma } = await createIntegrationApp()
  const createdAuditIds: string[] = []

  after(() => cleanupIntegration({ app, prisma, auditIds: createdAuditIds }))

  const health = await app.inject({ method: "GET", url: "/health" })
  assert.equal(health.statusCode, 200)
  assert.deepEqual(health.json(), { status: "ok" })

  const preflight = await app.inject({
    method: "OPTIONS",
    url: "/audits/test/answers/1",
    headers: {
      origin: process.env.WEB_ORIGIN,
      "access-control-request-method": "PUT",
    },
  })
  assert.equal(preflight.statusCode, 204)
  assert.equal(preflight.headers["access-control-allow-origin"], process.env.WEB_ORIGIN)
  assert.equal(preflight.headers["access-control-allow-credentials"], "true")

  let auditId: string
  let guestCookie: string
  // Each behavior gets a newly created HTTP guest audit. Save/submit sequences remain
  // inside the behavior that verifies them, rather than supplying later siblings.
  beforeEach(async () => {
    const created = await app.inject({ method: "POST", url: "/audits" })
    assert.equal(created.statusCode, 201)
    auditId = created.json<{ id: string; status: string }>().id
    assert.match(auditId, /^[0-9a-f-]{36}$/)
    assert.equal(created.json().status, "in_progress")
    assert.equal(created.json().questionnaireVersion, 1)
    assert.equal(created.json().scoringVersion, 1)
    createdAuditIds.push(auditId)
    const persistedGuestAudit = await prisma.audit.findUniqueOrThrow({
      where: { id: auditId },
      select: { userId: true, guestSubject: true },
    })
    assert.equal(persistedGuestAudit.userId, null)
    assert.ok(persistedGuestAudit.guestSubject)

    const setCookie = created.headers["set-cookie"]
    assert.equal(typeof setCookie, "string")
    assert.match(setCookie as string, /HttpOnly/i)
    assert.match(setCookie as string, /SameSite=Lax/i)
    guestCookie = (setCookie as string).split(";")[0]
  })

  const requestAsOwner = (
    method: "GET" | "PUT" | "POST",
    url: string,
    payload?: { value: string },
  ) => app.inject({ method, url, headers: { cookie: guestCookie }, payload })

  const oldDate = new Date("2020-01-01T00:00:00.000Z")
  async function setOldTimestamp(id = auditId) {
    await prisma.audit.update({ where: { id }, data: { updatedAt: oldDate } })
  }
  async function timestamp(id = auditId) {
    return (await prisma.audit.findUniqueOrThrow({ where: { id } })).updatedAt
  }

  async function seedAnswer() {
    await prisma.auditAnswer.create({ data: { auditId, questionId: 1, value: "b" } })
  }
  async function saveAllAnswers() {
    for (const question of auditQuestions) {
      const response = await requestAsOwner("PUT", `/audits/${auditId}/answers/${question.id}`, { value: question.id === 1 ? "b" : "a" })
      assert.equal(response.statusCode, 200)
    }
  }

  await test("create and retrieve with the guest cookie", async () => {
    const fetched = await requestAsOwner("GET", `/audits/${auditId}`)
    assert.equal(fetched.statusCode, 200)
    assert.deepEqual(fetched.json().answers, [])
    assert.equal(fetched.json().answeredCount, 0)
  })

  await test("another guest cannot read, change, or submit the audit", async () => {
    const withoutCookie = await app.inject({
      method: "GET",
      url: `/audits/${auditId}`,
    })
    assert.equal(withoutCookie.statusCode, 404)

    const invalidCookie = await app.inject({
      method: "GET",
      url: `/audits/${auditId}`,
      headers: { cookie: `${guestCookie}tampered` },
    })
    assert.equal(invalidCookie.statusCode, 404)

    const secondGuest = await app.inject({ method: "POST", url: "/audits" })
    assert.equal(secondGuest.statusCode, 201)
    createdAuditIds.push(secondGuest.json().id)
    const secondCookie = (secondGuest.headers["set-cookie"] as string).split(";")[0]

    const otherRead = await app.inject({
      method: "GET",
      url: `/audits/${auditId}`,
      headers: { cookie: secondCookie },
    })
    const otherWrite = await app.inject({
      method: "PUT",
      url: `/audits/${auditId}/answers/1`,
      headers: { cookie: secondCookie },
      payload: { value: "a" },
    })
    const otherSubmit = await app.inject({
      method: "POST",
      url: `/audits/${auditId}/submit`,
      headers: { cookie: secondCookie },
    })
    assert.equal(otherRead.statusCode, 404)
    assert.equal(otherWrite.statusCode, 404)
    assert.equal(otherSubmit.statusCode, 404)
  })

  await test("save and update a persisted answer", async () => {
    await setOldTimestamp()
    const first = await requestAsOwner(
      "PUT",
      `/audits/${auditId}/answers/1`,
      { value: "a" },
    )
    assert.equal(first.statusCode, 200)
    assert.ok(await timestamp() > oldDate)
    assert.deepEqual(first.json(), {
      questionId: 1,
      value: "a",
      answeredCount: 1,
    })

    await setOldTimestamp()
    const changed = await requestAsOwner(
      "PUT",
      `/audits/${auditId}/answers/1`,
      { value: "b" },
    )
    assert.equal(changed.statusCode, 200)
    assert.ok(await timestamp() > oldDate)
    assert.equal(changed.json().answeredCount, 1)

    const fetched = await requestAsOwner("GET", `/audits/${auditId}`)
    assert.equal(fetched.statusCode, 200)
    assert.deepEqual(fetched.json().answers, [{ questionId: 1, value: "b" }])
  })

  await test("reject an invalid answer without changing persisted data", async () => {
    await seedAnswer()
    await setOldTimestamp()
    const invalid = await requestAsOwner(
      "PUT",
      `/audits/${auditId}/answers/1`,
      { value: "invalid" },
    )
    assert.equal(invalid.statusCode, 400)
    assert.deepEqual(await timestamp(), oldDate)
    const fetched = await requestAsOwner("GET", `/audits/${auditId}`)
    assert.deepEqual(fetched.json().answers, [{ questionId: 1, value: "b" }])
  })

  await test("refuse submission when required answers are missing", async () => {
    await seedAnswer()
    await setOldTimestamp()
    const submitted = await requestAsOwner(
      "POST",
      `/audits/${auditId}/submit`,
    )
    assert.equal(submitted.statusCode, 400)
    assert.equal(submitted.json().code, "AUDIT_INCOMPLETE")
    assert.deepEqual(await timestamp(), oldDate)
    assert.deepEqual(
      submitted.json().details.missingQuestionIds,
      auditQuestions.slice(1).map(({ id }) => id),
    )
    const fetched = await requestAsOwner("GET", `/audits/${auditId}`)
    assert.equal(fetched.json().status, "in_progress")
  })

  await test("submit all answers and retrieve the completed audit", async () => {
    await seedAnswer()
    for (const question of auditQuestions.slice(1)) {
      const saved = await requestAsOwner(
        "PUT",
        `/audits/${auditId}/answers/${question.id}`,
        { value: "a" },
      )
      assert.equal(saved.statusCode, 200)
    }

    await setOldTimestamp()
    const submitted = await requestAsOwner(
      "POST",
      `/audits/${auditId}/submit`,
    )
    assert.equal(submitted.statusCode, 200)
    assert.equal(submitted.json().status, "completed")
    assert.equal(submitted.json().answeredCount, auditQuestions.length)
    assert.ok(await timestamp() > oldDate)

    const fetched = await requestAsOwner("GET", `/audits/${auditId}`)
    assert.equal(fetched.statusCode, 200)
    assert.equal(fetched.json().status, "completed")
    assert.equal(fetched.json().answers.length, auditQuestions.length)
  })

  await test("reject any answer change after completion", async () => {
    await saveAllAnswers()
    assert.equal((await requestAsOwner("POST", `/audits/${auditId}/submit`)).statusCode, 200)
    await setOldTimestamp()
    const changed = await requestAsOwner(
      "PUT",
      `/audits/${auditId}/answers/1`,
      { value: "c" },
    )
    assert.equal(changed.statusCode, 409)
    assert.equal(changed.json().code, "AUDIT_COMPLETED")
    assert.deepEqual(await timestamp(), oldDate)

    const repeated = await requestAsOwner("POST", `/audits/${auditId}/submit`)
    assert.equal(repeated.statusCode, 200)
    assert.deepEqual(await timestamp(), oldDate)

    const fetched = await requestAsOwner("GET", `/audits/${auditId}`)
    assert.deepEqual(fetched.json().answers[0], { questionId: 1, value: "b" })
  })

  await test("stored unknown versions reject writes and scoring interpretation without mutation", async () => {
    const response = await requestAsOwner("POST", "/audits")
    const id = response.json().id as string
    createdAuditIds.push(id)
    for (const versions of [
      { questionnaireVersion: 2, scoringVersion: 1 },
      { questionnaireVersion: 1, scoringVersion: 2 },
    ]) {
      for (const status of ["IN_PROGRESS", "COMPLETED"] as const) {
        await prisma.audit.update({ where: { id }, data: { ...versions, status, updatedAt: oldDate } })
        const before = await prisma.audit.findUniqueOrThrow({ where: { id }, include: { answers: true } })
        const fetched = await requestAsOwner("GET", `/audits/${id}`)
        assert.equal(fetched.statusCode, 200)
        assert.equal(fetched.json().questionnaireVersion, versions.questionnaireVersion)
        assert.equal(fetched.json().scoringVersion, versions.scoringVersion)
        const written = await requestAsOwner("PUT", `/audits/${id}/answers/1`, { value: "a" })
        const submitted = await requestAsOwner("POST", `/audits/${id}/submit`)
        assert.equal(written.statusCode, 409)
        assert.equal(submitted.statusCode, 409)
        assert.equal(written.json().code, "AUDIT_VERSION_UNSUPPORTED")
        assert.equal(submitted.json().code, "AUDIT_VERSION_UNSUPPORTED")
        const after = await prisma.audit.findUniqueOrThrow({ where: { id }, include: { answers: true } })
        assert.deepEqual(after, before)
      }
    }
  })

  await test("serialize a pending answer write with submission", async () => {
    const createdForRace = await requestAsOwner("POST", "/audits")
    assert.equal(createdForRace.statusCode, 201)
    const raceAuditId = createdForRace.json().id as string
    createdAuditIds.push(raceAuditId)

    for (const question of auditQuestions) {
      const saved = await requestAsOwner(
        "PUT",
        `/audits/${raceAuditId}/answers/${question.id}`,
        { value: "a" },
      )
      assert.equal(saved.statusCode, 200)
    }

    let releaseAnswerLock = () => {}
    const holdAnswerLock = new Promise<void>((resolve) => {
      releaseAnswerLock = resolve
    })
    let answerLocked = () => {}
    const answerLockAcquired = new Promise<void>((resolve) => {
      answerLocked = resolve
    })
    const lockTransaction = prisma.$transaction(
      async (tx) => {
        await tx.$queryRaw`
          SELECT "value" FROM "audit_answers"
          WHERE "auditId" = ${raceAuditId} AND "questionId" = 1
          FOR UPDATE
        `
        answerLocked()
        await holdAnswerLock
      },
      { timeout: 10_000 },
    )

    let pendingWrite: Promise<Awaited<ReturnType<typeof requestAsOwner>>> | undefined
    let pendingSubmit: ReturnType<typeof requestAsOwner> | undefined
    try {
      await Promise.race([
        answerLockAcquired,
        lockTransaction.then(() => { throw new Error("answer lock transaction ended before acquiring its lock") }),
      ])
      pendingWrite = Promise.resolve(requestAsOwner("PUT", `/audits/${raceAuditId}/answers/1`, { value: "b" }))
      // The PUT must hold the audit row while its answer write is blocked.
      // Otherwise submit could finish and the PUT could change the result later.
      let auditRowLocked = false
      for (let attempt = 0; attempt < 50; attempt += 1) {
        try {
          await prisma.$queryRaw`
            SELECT "id" FROM "audits"
            WHERE "id" = ${raceAuditId} FOR UPDATE NOWAIT
          `
        } catch (error) {
          if (!String(error).includes("55P03")) throw error
          auditRowLocked = true
          break
        }
        await new Promise((resolve) => setTimeout(resolve, 20))
      }
      assert.equal(auditRowLocked, true, "pending PUT must lock the audit row")

      pendingSubmit = requestAsOwner("POST", `/audits/${raceAuditId}/submit`)
      const submittedBeforeWrite = await Promise.race([
        Promise.resolve(pendingSubmit).then(() => true),
        new Promise<false>((resolve) => setTimeout(() => resolve(false), 100)),
      ])
      assert.equal(submittedBeforeWrite, false)
    } finally {
      releaseAnswerLock()
      try { await lockTransaction } finally {
        await Promise.allSettled([...(pendingWrite ? [pendingWrite] : []), ...(pendingSubmit ? [Promise.resolve(pendingSubmit)] : [])])
      }
    }

    assert.ok(pendingWrite)
    const written = await pendingWrite
    assert.equal(written.statusCode, 200)
    assert.ok(pendingSubmit)
    const submitted = await pendingSubmit
    assert.equal(submitted.statusCode, 200)
    assert.equal(submitted.json().status, "completed")
    assert.deepEqual(submitted.json().answers[0], {
      questionId: 1,
      value: "b",
    })
  })
})
