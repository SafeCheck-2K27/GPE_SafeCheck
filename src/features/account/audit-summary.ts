import type { AccountAudit } from "./api"

export function calculateAuditCounters(audits: readonly AccountAudit[]) {
  return {
    total: audits.length,
    completed: audits.filter((audit) => audit.status === "completed").length,
    inProgress: audits.filter((audit) => audit.status === "in_progress").length,
  }
}

export function getAuditAccountAction(audit: Pick<AccountAudit, "id" | "status">) {
  const completed = audit.status === "completed"
  return {
    label: completed ? "Revoir" : "Reprendre",
    href: `${completed ? "/resultats" : "/audit"}?auditId=${encodeURIComponent(audit.id)}`,
  }
}

export function formatAnsweredCount(answeredCount: number): string {
  return `${answeredCount} question${answeredCount === 1 ? "" : "s"} répondue${answeredCount === 1 ? "" : "s"}`
}
