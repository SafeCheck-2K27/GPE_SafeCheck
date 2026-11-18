import assert from "node:assert/strict"
import { test } from "node:test"
import { AuthActionError } from "../../src/components/safecheck/auth-logic"
import { getAuthFormRecovery, submitAuthForm } from "../../src/components/safecheck/auth-form-recovery"

test("a confirmed credential POST is not repeated during session recovery", async () => {
  let posts = 0
  let confirms = 0
  const user = { id: "user", email: "person@example.test", pseudo: "Alias" }
  const submit = async () => { posts += 1; return user }
  const recovery = async () => { confirms += 1; return user }
  assert.equal(await submitAuthForm(submit, null), user)
  assert.equal(await submitAuthForm(submit, recovery), user)
  assert.equal(posts, 1)
  assert.equal(confirms, 1)
})

test("repeated confirmation failures retain recovery without accepting untrusted callbacks", () => {
  const recovery = async () => ({ id: "user", email: "person@example.test", pseudo: "Alias" })
  const failure = new AuthActionError("network", recovery)
  assert.equal(getAuthFormRecovery(failure, null), recovery)
  assert.equal(getAuthFormRecovery(new Error("retry failed"), recovery), recovery)
  assert.equal(getAuthFormRecovery({ recovery }, null), null)
})
