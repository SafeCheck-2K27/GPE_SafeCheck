import type { AccountTabId } from "./types"

export const ACCOUNT_TAB_IDS = [
  "dashboard",
  "historique",
  "profil",
  "preferences",
] as const satisfies readonly AccountTabId[]

export function isAccountTabId(tab: string | null): tab is AccountTabId {
  return tab !== null && ACCOUNT_TAB_IDS.some((accountTab) => accountTab === tab)
}

export function getAccountTab(tab: string | null): AccountTabId {
  return isAccountTabId(tab) ? tab : "dashboard"
}

export function getAccountTabHref(
  pathname: string,
  queryString: string,
  tab: AccountTabId,
): string {
  const params = new URLSearchParams(queryString)
  params.set("tab", tab)

  return `${pathname}?${params.toString()}`
}
