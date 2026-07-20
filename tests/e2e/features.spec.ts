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

test("recommendation cards use valid interactive markup and keep both actions", async ({ page }) => {
  const expectNoHydrationErrors = monitorHydration(page)

  await page.goto("/recommandations?type=habitudes")
  await expect(page.locator("button button")).toHaveCount(0)
  const habitDetails = page.locator('button[aria-label^="En savoir plus sur"]')
  await expect(habitDetails.first()).toBeVisible()
  await habitDetails.first().click()
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.keyboard.press("Escape")
  const habitStatus = page.locator('button[aria-label^="Changer le statut de"]').first()
  await habitStatus.click()
  await expect(habitStatus).toHaveAttribute("aria-label", /Statut actuel : En cours/)

  await page.goto("/recommandations?type=techniques")
  await expect(page.locator("button button")).toHaveCount(0)
  const technicalDetails = page.locator('button[aria-label^="Voir les étapes de"]')
  await expect(technicalDetails.first()).toBeVisible()
  await technicalDetails.first().click()
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.keyboard.press("Escape")
  const technicalStatus = page.locator('button[aria-label^="Changer le statut de"]').first()
  await technicalStatus.click()
  await expect(technicalStatus).toHaveAttribute("aria-label", /Statut actuel : En cours/)

  expectNoHydrationErrors()
})

test("account section links preserve URL state, history and keyboard navigation", async ({ page }) => {
  const expectNoHydrationErrors = monitorHydration(page)
  await seedAuthenticatedUser(page)

  await page.goto("/compte?source=e2e&tab=preferences")
  const navigation = page.getByRole("navigation", {
    name: "Sections du compte",
  })
  const tabs = [
    { id: "dashboard", label: "Tableau de bord" },
    { id: "historique", label: "Historique & activité" },
    { id: "profil", label: "Profil & sécurité" },
    { id: "preferences", label: "Préférences" },
  ] as const

  await expect(navigation.getByRole("link")).toHaveCount(4)
  await expect(navigation.getByRole("button")).toHaveCount(0)

  for (const tab of tabs) {
    const link = navigation.getByRole("link", { name: tab.label, exact: true })
    await expect(link).toHaveAttribute(
      "href",
      `/compte?source=e2e&tab=${tab.id}`,
    )
    await link.click()
    await expect(page).toHaveURL(
      new RegExp(`source=e2e&tab=${tab.id}$`),
    )
    await expect(link).toHaveAttribute("aria-current", "page")
  }

  await page.reload()
  await expect(page).toHaveURL(/source=e2e&tab=preferences$/)
  await expect(
    navigation.getByRole("link", { name: "Préférences", exact: true }),
  ).toHaveAttribute("aria-current", "page")

  await page.goBack()
  await expect(page).toHaveURL(/source=e2e&tab=profil$/)
  await expect(
    navigation.getByRole("link", { name: "Profil & sécurité", exact: true }),
  ).toHaveAttribute("aria-current", "page")

  await page.goForward()
  await expect(page).toHaveURL(/source=e2e&tab=preferences$/)

  await page.goto("/compte?source=e2e&tab=invalide")
  await expect(page).toHaveURL(/source=e2e&tab=dashboard$/)
  const dashboardLink = navigation.getByRole("link", {
    name: "Tableau de bord",
    exact: true,
  })
  const historyLink = navigation.getByRole("link", {
    name: "Historique & activité",
    exact: true,
  })
  await expect(dashboardLink).toHaveAttribute("aria-current", "page")
  await dashboardLink.focus()
  await page.keyboard.press("Tab")
  await expect(historyLink).toBeFocused()
  await page.keyboard.press("Enter")
  await expect(page).toHaveURL(/source=e2e&tab=historique$/)
  await expect(historyLink).toHaveAttribute("aria-current", "page")
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
