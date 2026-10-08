import assert from "node:assert/strict"
import { test } from "node:test"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { SessionNotice } from "../../src/components/safecheck/SessionNotice"
import { I18nProvider } from "../../src/components/safecheck/I18nProvider"

function render(error: boolean, retrying: boolean) {
  return renderToStaticMarkup(createElement(I18nProvider, null,
    createElement(SessionNotice, { error, retrying, onRetry: async () => {} }),
  ))
}

test("session lookup error has a status and enabled recovery action without Guest messaging", () => {
  const markup = render(true, false)
  assert.match(markup, /role="status"/)
  assert.match(markup, /session n’a pas pu être vérifiée/)
  assert.match(markup, /Réessayer la vérification/)
  assert.doesNotMatch(markup, /disabled|invité|connecté/)
})

test("session recovery pending disables its retry and explains the operation", () => {
  const markup = render(true, true)
  assert.match(markup, /disabled/)
  assert.match(markup, /Vérification de la session…/)
})

test("settled sessions do not render recovery notices", () => {
  assert.equal(render(false, false), "")
})
