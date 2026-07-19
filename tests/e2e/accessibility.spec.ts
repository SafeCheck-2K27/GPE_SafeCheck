import { expect, test } from "@playwright/test"
import { monitorHydration } from "./support"

test("login dialog traps focus, closes with Escape and restores focus", async ({ page }) => {
  const expectNoHydrationErrors = monitorHydration(page)

  await page.goto("/accueil")
  const trigger = page.getByRole("button", { name: "Connexion", exact: true })
  await trigger.focus()
  await trigger.click()

  const dialog = page.getByRole("dialog", { name: "Connexion" })
  await expect(dialog).toHaveAttribute("aria-modal", "true")
  await expect.poll(() => dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true)

  for (let index = 0; index < 12; index += 1) {
    await page.keyboard.press("Tab")
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true)
  }

  await page.keyboard.press("Escape")
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
  expectNoHydrationErrors()
})

test("critical content remains reachable at mobile, tablet and desktop widths", async ({ page }) => {
  const expectNoHydrationErrors = monitorHydration(page)
  const viewports = [
    { width: 320, height: 720 },
    { width: 360, height: 800 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1280, height: 800 },
  ]

  for (const theme of ["light", "dark"] as const) {
    await page.goto("/accueil")
    await page.evaluate((selectedTheme) => localStorage.setItem("theme", selectedTheme), theme)

    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      await page.goto("/accueil")
      await expect(page.locator("html")).toHaveClass(new RegExp(theme))

      const heading = page.getByRole("heading", { name: /La cybersécurité/ })
      await expect(heading).toBeVisible()
      const bounds = await heading.boundingBox()
      expect(bounds).not.toBeNull()
      expect(bounds!.x).toBeGreaterThanOrEqual(0)
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width)
      await expect(page.getByRole("button", { name: /Passer le questionnaire/ })).toBeVisible()

      if (viewport.width <= 390) {
        await expect(page.getByRole("button", { name: "Menu", exact: true })).toBeVisible()
      }
    }

    await page.setViewportSize({ width: 320, height: 720 })
    await page.goto("/vulnerabilite")
    await expect.poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
    ).toBeLessThanOrEqual(0)
  }

  expectNoHydrationErrors()
})

test("long signup form exposes visible labels as accessible names", async ({ page }) => {
  const expectNoHydrationErrors = monitorHydration(page)

  await page.goto("/compte/creer")
  await expect(page.getByLabel("Prénom", { exact: true })).toBeVisible()
  await expect(page.getByLabel("Nom", { exact: true })).toBeVisible()
  await expect(page.getByLabel("Adresse email", { exact: true })).toBeVisible()
  await expect(page.getByLabel("Mot de passe", { exact: true })).toBeVisible()

  expectNoHydrationErrors()
})
