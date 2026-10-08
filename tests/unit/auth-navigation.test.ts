import assert from "node:assert/strict"
import { test } from "node:test"
import { getAuthDestination, internalAuthHref } from "../../src/components/safecheck/auth-navigation"

for (const flow of ["signup", "login"] as const) {
  test(`${flow} preserves the requested tutorial including query and fragment`, () => {
    assert.equal(getAuthDestination("/tutoriels/passwords?step=2#practice", flow), "/tutoriels/passwords?step=2#practice")
  })
  test(`${flow} rejects external destinations and retains its normal default`, () => {
    assert.equal(getAuthDestination("https://evil.test", flow), flow === "signup" ? "/compte" : "/accueil")
    assert.equal(getAuthDestination(undefined, flow), flow === "signup" ? "/compte" : "/accueil")
  })
}

test("auth destinations accept only root-relative internal paths", () => {
  for (const target of ["//evil.test", "/\\evil.test", "javascript:alert(1)", "tutoriels/test", " /compte", "/\nevil.test", "/%2fevil.test", "/%5cevil.test", "/%252fevil.test", "/%0aevil.test", "/bad%escape"]) {
    assert.equal(internalAuthHref(target), undefined, target)
  }
  assert.equal(internalAuthHref("/compte"), "/compte")
  assert.equal(internalAuthHref("/tutoriels/hello?return=https://example.test"), "/tutoriels/hello?return=https://example.test")
})
