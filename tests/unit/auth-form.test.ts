import assert from "node:assert/strict"
import { test } from "node:test"
import { AuthActionError } from "../../src/components/safecheck/auth-logic"
import {
  getLoginErrorKey,
  getSignupErrorKey,
  hasValidSignupCredentials,
  hasValidSignupProfile,
} from "../../src/components/safecheck/auth-form"

test("login errors retain their specific and unknown fallbacks", () => {
  assert.equal(getLoginErrorKey(new AuthActionError("invalid_credentials")), "login.errorCredentials")
  assert.equal(getLoginErrorKey(new AuthActionError("network")), "login.errorNetwork")
  assert.equal(getLoginErrorKey(new AuthActionError("generic")), "login.errorGeneric")
  assert.equal(getLoginErrorKey({ kind: "network" }), "login.errorGeneric")
  assert.equal(getLoginErrorKey(new Error("offline")), "login.errorGeneric")
})

test("signup errors retain network-specific and generic fallbacks", () => {
  assert.equal(getSignupErrorKey(new AuthActionError("network")), "signup.errorNetwork")
  assert.equal(getSignupErrorKey(new AuthActionError("invalid_credentials")), "signup.errorGeneric")
  assert.equal(getSignupErrorKey({ kind: "network" }), "signup.errorGeneric")
})

test("signup credentials trim only email and preserve password length policy", () => {
  assert.equal(hasValidSignupCredentials("  person@example.test  ", "12345678"), true)
  assert.equal(hasValidSignupCredentials("   ", "12345678"), false)
  assert.equal(hasValidSignupCredentials("person@example.test", "1234567"), false)
  assert.equal(hasValidSignupCredentials("person@example.test", " 123456 "), true)
})

test("signup profile requires a nonblank trimmed pseudo", () => {
  assert.equal(hasValidSignupProfile(" Alias "), true)
  assert.equal(hasValidSignupProfile("  "), false)
})
