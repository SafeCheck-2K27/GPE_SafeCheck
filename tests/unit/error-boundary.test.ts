import assert from "node:assert/strict"
import { test } from "node:test"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import AppError from "../../src/app/error"

test("the route error boundary offers safe recovery actions", () => {
  const sensitiveErrorMessage = "private database connection details"
  const markup = renderToStaticMarkup(
    createElement(AppError, {
      error: new Error(sensitiveErrorMessage),
      reset: () => undefined,
    }),
  )

  assert.match(markup, /role="alert"/)
  assert.match(markup, /Une erreur est survenue/)
  assert.match(markup, /Réessayer/)
  assert.match(markup, /href="\/accueil"/)
  assert.doesNotMatch(markup, new RegExp(sensitiveErrorMessage))
})
