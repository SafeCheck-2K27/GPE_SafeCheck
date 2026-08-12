import { describe, expect, it } from "vitest"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import AppError from "../../src/app/error"

describe("route error boundary", () => {
  it("offers safe recovery actions", () => {
    const sensitiveErrorMessage = "private database connection details"
    const markup = renderToStaticMarkup(
      createElement(AppError, {
        error: new Error(sensitiveErrorMessage),
        reset: () => undefined,
      }),
    )

    expect(markup).toMatch(/role="alert"/)
    expect(markup).toMatch(/Une erreur est survenue/)
    expect(markup).toMatch(/Réessayer/)
    expect(markup).toMatch(/href="\/accueil"/)
    expect(markup).not.toMatch(new RegExp(sensitiveErrorMessage))
  })
})
