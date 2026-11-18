import assert from "node:assert/strict"
import { test } from "node:test"
import type { AccountAudit } from "../../src/features/account/api"
import {
  calculateAuditCounters,
  formatAnsweredCount,
  getAuditAccountAction,
} from "../../src/features/account/audit-summary"

function audit(id: string, status: AccountAudit["status"], answeredCount = 0): AccountAudit {
  return {
    id,
    status,
    createdAt: "2026-09-29T10:00:00.000Z",
    updatedAt: "2026-09-29T10:00:00.000Z",
    questionnaireVersion: 1, scoringVersion: 1,
    answeredCount,
  }
}

test("empty audit list yields zero counters and the empty state", () => {
  const counters = calculateAuditCounters([])
  assert.deepEqual(counters, { total: 0, completed: 0, inProgress: 0 })
  assert.equal(counters.total === 0, true)
})

test("completed audits count without in-progress audits", () => {
  assert.deepEqual(calculateAuditCounters([
    audit("a", "completed"), audit("b", "completed"),
  ]), { total: 2, completed: 2, inProgress: 0 })
})

test("in-progress audits count without completed audits", () => {
  assert.deepEqual(calculateAuditCounters([
    audit("a", "in_progress"), audit("b", "in_progress"),
  ]), { total: 2, completed: 0, inProgress: 2 })
})

test("mixed audits produce all three counters without changing the list", () => {
  const audits = [audit("a", "completed"), audit("b", "in_progress"), audit("c", "completed")]
  assert.deepEqual(calculateAuditCounters(audits), { total: 3, completed: 2, inProgress: 1 })
  assert.deepEqual(audits.map((item) => item.id), ["a", "b", "c"])
})

test("in-progress audit action resumes the same audit", () => {
  assert.deepEqual(getAuditAccountAction(audit("audit-1", "in_progress")), {
    label: "Reprendre",
    href: "/audit?auditId=audit-1",
  })
})

test("completed audit action reviews the same audit", () => {
  assert.deepEqual(getAuditAccountAction(audit("audit-2", "completed")), {
    label: "Revoir",
    href: "/resultats?auditId=audit-2",
  })
})

test("audit action URL encodes an unexpected identifier", () => {
  assert.equal(getAuditAccountAction(audit("a&b?", "completed")).href, "/resultats?auditId=a%26b%3F")
})

test("answered count displays zero, partial and full audit counts", () => {
  assert.equal(formatAnsweredCount(0), "0 questions répondues")
  assert.equal(formatAnsweredCount(3), "3 questions répondues")
  assert.equal(formatAnsweredCount(10), "10 questions répondues")
})

test("answered count uses singular for one answer", () => {
  assert.equal(formatAnsweredCount(1), "1 question répondue")
})
