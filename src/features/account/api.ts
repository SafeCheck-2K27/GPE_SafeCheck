import { decodeAccountAuditList, type AccountAuditPageDto, type AuditSummaryDto } from "@/lib/contracts/audit"
import { apiFetchJson } from "@/lib/api-fetch"

export type AccountAudit = AuditSummaryDto

export async function listAccountAudits(cursor?: string | null, signal?: AbortSignal): Promise<AccountAuditPageDto> {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""
  const response = await apiFetchJson(`/audits${query}`, { signal })
  if (!response.ok) throw new Error(`Audit history request failed: ${response.status}`)

  return decodeAccountAuditList(response.payload)
}
