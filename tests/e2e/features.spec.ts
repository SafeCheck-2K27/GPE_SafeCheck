import { expect, test } from "@playwright/test"
import { monitorHydration, seedAuthenticatedUser } from "./support"

test("essential query initializes search and its dialog closes with Escape", async ({ page }) => {
  const expectNoHydrationErrors = monitorHydration(page)

  await page.goto("/essentiels?q=gestionnaire")
  const search = page.getByPlaceholder("Rechercher un essentiel…")
  await expect(search).toHaveValue("gestionnaire")

  await page.getByRole("button", { name: /Utiliser un gestionnaire de mots de passe/ }).click()
  const dialog = page.getByRole("dialog", { name: /Utiliser un gestionnaire de mots de passe/ })
  await expect(dialog).toHaveAttribute("aria-modal", "true")
  await page.keyboard.press("Escape")
  await expect(dialog).toBeHidden()
  expectNoHydrationErrors()
})

test("account tabs synchronize URL and browser history", async ({ page }) => {
  const expectNoHydrationErrors = monitorHydration(page)
  await seedAuthenticatedUser(page)

  await page.goto("/compte?source=e2e&tab=dashboard")
  await page.getByRole("button", { name: "Préférences", exact: true }).click()
  await expect(page).toHaveURL(/source=e2e&tab=preferences/)
  await expect(page.getByRole("button", { name: "Préférences", exact: true })).toHaveAttribute("aria-current", "page")

  await page.goBack()
  await expect(page).toHaveURL(/source=e2e&tab=dashboard/)
  await expect(page.getByRole("button", { name: "Tableau de bord", exact: true })).toHaveAttribute("aria-current", "page")
  expectNoHydrationErrors()
})

test("mock login persists a session and logout clears it", async ({ page }) => {
  const expectNoHydrationErrors = monitorHydration(page)

  await page.goto("/accueil")
  await page.getByRole("button", { name: "Connexion", exact: true }).click()
  const dialog = page.getByRole("dialog", { name: "Connexion" })
  await dialog.getByLabel("Adresse email").fill("e2e@safecheck.test")
  await dialog.locator("#navbar-login-password").fill("password")
  await dialog.getByRole("button", { name: "Se connecter", exact: true }).click()

  const logout = page.getByRole("button", { name: "Déconnexion", exact: true })
  await expect(logout).toBeVisible()
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("safecheck.user.v1"))).not.toBeNull()

  await logout.click()
  await expect(page).toHaveURL(/\/$/)
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("safecheck.user.v1"))).toBeNull()
  expectNoHydrationErrors()
})
