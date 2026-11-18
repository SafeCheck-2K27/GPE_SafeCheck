import assert from "node:assert/strict"
import { test } from "node:test"
import { getAccountSessionView } from "../../src/app/compte/_session-state"

test("account session failure is recoverable rather than shown as guest", () => {
  assert.equal(getAccountSessionView({ isHydrated: false, sessionError: true, authChanging: false, isLoggedIn: false, hasUser: false }), "error")
})

test("account hides personal data while loading or changing identity", () => {
  assert.equal(getAccountSessionView({ isHydrated: false, sessionError: false, authChanging: false, isLoggedIn: true, hasUser: true }), "loading")
  assert.equal(getAccountSessionView({ isHydrated: true, sessionError: false, authChanging: true, isLoggedIn: true, hasUser: true }), "loading")
})

test("account distinguishes authenticated users from confirmed guests", () => {
  assert.equal(getAccountSessionView({ isHydrated: true, sessionError: false, authChanging: false, isLoggedIn: true, hasUser: true }), "authenticated")
  assert.equal(getAccountSessionView({ isHydrated: true, sessionError: false, authChanging: false, isLoggedIn: false, hasUser: false }), "guest")
})
