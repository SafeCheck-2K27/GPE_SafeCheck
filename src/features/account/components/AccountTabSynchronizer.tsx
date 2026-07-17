"use client"

import { useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  getAccountTab,
  getAccountTabHref,
  isAccountTabId,
} from "../tabs"
import type { AccountTabId } from "../types"

export function AccountTabSynchronizer({
  activeTab,
  onTabChange,
}: {
  activeTab: AccountTabId
  onTabChange: (tab: AccountTabId) => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryString = searchParams.toString()
  const tabParam = searchParams.get("tab")
  const requestedTab = getAccountTab(tabParam)

  useEffect(() => {
    if (tabParam !== null && !isAccountTabId(tabParam)) {
      router.replace(getAccountTabHref(pathname, queryString, requestedTab), {
        scroll: false,
      })
    }

    if (requestedTab !== activeTab) {
      queueMicrotask(() => onTabChange(requestedTab))
    }
  }, [
    activeTab,
    onTabChange,
    pathname,
    queryString,
    requestedTab,
    router,
    tabParam,
  ])

  return null
}
