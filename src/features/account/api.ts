import { decodeAccountAuditList, type AuditSummaryDto } from "@/lib/contracts/audit"
import { apiFetchJson } from "@/lib/api-fetch"

export type AccountAudit = AuditSummaryDto

export async function listAccountAudits(signal?: AbortSignal): Promise<AccountAudit[]> {
  const response = await apiFetchJson("/audits", { signal })
  if (!response.ok) throw new Error(`Audit history request failed: ${response.status}`)

  return decodeAccountAuditList(response.payload)
}
