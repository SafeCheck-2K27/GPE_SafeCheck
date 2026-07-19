import { expect, type Page } from "@playwright/test"

const HYDRATION_ERROR_PATTERN =
  /hydration|hydrating|server rendered html|did not match|react error/i

export function monitorHydration(page: Page) {
  const errors: string[] = []

  page.on("console", (message) => {
    if (message.type() === "error" && HYDRATION_ERROR_PATTERN.test(message.text())) {
      errors.push(message.text())
    }
  })
  page.on("pageerror", (error) => {
    errors.push(error.message)
  })

  return () => expect(errors, "browser hydration/runtime errors").toEqual([])
}

export async function seedAuthenticatedUser(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "safecheck.user.v1",
      JSON.stringify({ email: "e2e@safecheck.test", pseudo: "E2E" }),
    )
  })
}
