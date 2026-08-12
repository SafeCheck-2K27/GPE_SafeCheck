import { test, expect } from "vitest"
import {
  getAccountTab,
  getAccountTabHref,
  isAccountTabId,
} from "../../src/features/account/tabs"

test("account tab validation accepts only supported tab ids", () => {
  expect(isAccountTabId("dashboard")).toBe(true)
  expect(isAccountTabId("historique")).toBe(true)
  expect(isAccountTabId("profil")).toBe(true)
  expect(isAccountTabId("preferences")).toBe(true)
  expect(isAccountTabId("unknown")).toBe(false)
  expect(isAccountTabId(null)).toBe(false)
})

test("invalid or missing account tabs fall back to dashboard", () => {
  expect(getAccountTab(null)).toBe("dashboard")
  expect(getAccountTab("unknown")).toBe("dashboard")
  expect(getAccountTab("profil")).toBe("profil")
})

test("account tab href updates tab while preserving other query parameters", () => {
  expect(
    getAccountTabHref("/compte", "source=audit&tab=profil", "preferences"),
  ).toBe("/compte?source=audit&tab=preferences")
  expect(getAccountTabHref("/compte", "", "historique")).toBe("/compte?tab=historique")
})