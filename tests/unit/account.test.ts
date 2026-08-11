import assert from "node:assert/strict"
import { test } from "node:test"
import {
  getAccountTab,
  getAccountTabHref,
  isAccountTabId,
} from "../../src/features/account/tabs"

test("account tab validation accepts only supported tab ids", () => {
  assert.equal(isAccountTabId("dashboard"), true)
  assert.equal(isAccountTabId("historique"), true)
  assert.equal(isAccountTabId("profil"), true)
  assert.equal(isAccountTabId("preferences"), true)
  assert.equal(isAccountTabId("unknown"), false)
  assert.equal(isAccountTabId(null), false)
})

test("invalid or missing account tabs fall back to dashboard", () => {
  assert.equal(getAccountTab(null), "dashboard")
  assert.equal(getAccountTab("unknown"), "dashboard")
  assert.equal(getAccountTab("profil"), "profil")
})

test("account tab href updates tab while preserving other query parameters", () => {
  assert.equal(
    getAccountTabHref("/compte", "source=audit&tab=profil", "preferences"),
    "/compte?source=audit&tab=preferences",
  )
  assert.equal(getAccountTabHref("/compte", "", "historique"), "/compte?tab=historique")
})
