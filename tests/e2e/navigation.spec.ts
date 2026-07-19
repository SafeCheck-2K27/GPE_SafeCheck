import { expect, test } from "@playwright/test"
import { monitorHydration } from "./support"

test("landing to accueil then accueil to audit", async ({ page }) => {
  const expectNoHydrationErrors = monitorHydration(page)

  await page.goto("/")
  await page.getByRole("button", { name: "Découvrir la plateforme", exact: true }).first().click()
  await expect(page).toHaveURL(/\/accueil$/)
  await expect(page.getByRole("heading", { name: /La cybersécurité/ })).toBeVisible()

  await page.getByRole("button", { name: /Passer le questionnaire/ }).click()
  await expect(page).toHaveURL(/\/audit$/)
  await expect(page.locator("main button[aria-pressed]")).toHaveCount(4)
  expectNoHydrationErrors()
})

test("audit to personalisation to results", async ({ page }) => {
  const expectNoHydrationErrors = monitorHydration(page)

  await page.goto("/audit")

  for (let questionIndex = 0; questionIndex < 10; questionIndex += 1) {
    const option = page.locator("main button[aria-pressed]").first()
    await option.click()
    await expect(option).toHaveAttribute("aria-pressed", "true")

    const nextButton = page.getByRole("button", {
      name: questionIndex === 9 ? "Voir mes résultats" : "Question suivante",
      exact: true,
    })
    await expect(nextButton).toBeEnabled()
    await nextButton.click()
  }

  await expect(page).toHaveURL(/\/personalisation\?score=100&answers=/)
  await page.getByRole("button", { name: "Passer cette étape", exact: true }).click()
  await expect(page).toHaveURL(/\/resultats\?score=100&answers=/)
  await expect(page.locator("main")).toBeVisible()
  expectNoHydrationErrors()
})

test("tutorial catalog search opens the canonical detail route", async ({ page }) => {
  const expectNoHydrationErrors = monitorHydration(page)

  await page.goto("/tutoriels?vue=tous")
  await page.getByRole("searchbox", { name: "Rechercher un tutoriel" }).fill("double authentification")
  await page.getByRole("link", { name: /Voir le detail du tutoriel/ }).first().click()

  await expect(page).toHaveURL(/\/tutoriels\/1$/)
  await expect(page.getByRole("heading", { level: 1, name: /double authentification/i })).toBeVisible()
  expectNoHydrationErrors()
})
