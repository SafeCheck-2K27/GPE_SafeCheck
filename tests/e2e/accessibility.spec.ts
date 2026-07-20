import { expect, test } from "@playwright/test"
import { monitorHydration } from "./support"

test("login dialog is portaled, isolates the page and restores prior state", async ({ page }) => {
  const expectNoHydrationErrors = monitorHydration(page)

  await page.goto("/accueil")
  await page.evaluate(() => {
    const preserved = document.createElement("div")
    preserved.dataset.modalTestPreserved = ""
    preserved.setAttribute("inert", "")
    preserved.setAttribute("aria-hidden", "false")
    document.body.appendChild(preserved)
  })

  const trigger = page.getByRole("button", { name: "Connexion", exact: true })
  await trigger.focus()
  await trigger.click()

  const dialog = page.getByRole("dialog", { name: "Connexion" })
  const portalLayer = page.locator("body > [data-safecheck-modal]")
  await expect(portalLayer).toHaveCount(1)
  await expect(dialog).toHaveAttribute("aria-modal", "true")
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden")
  expect(
    await page.locator("body").evaluate((body) => {
      return Array.from(body.children)
        .filter((element) => !element.hasAttribute("data-safecheck-modal"))
        .every(
          (element) =>
            element instanceof HTMLElement &&
            element.inert &&
            element.getAttribute("aria-hidden") === "true",
        )
    }),
  ).toBe(true)
  await expect.poll(() => dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true)

  for (let index = 0; index < 12; index += 1) {
    await page.keyboard.press("Tab")
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true)
  }

  for (let index = 0; index < 12; index += 1) {
    await page.keyboard.press("Shift+Tab")
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true)
  }

  await page.evaluate(() => {
    const dynamic = document.createElement("button")
    dynamic.dataset.modalTestDynamic = ""
    document.body.appendChild(dynamic)
  })
  await expect
    .poll(() =>
      page.locator("[data-modal-test-dynamic]").evaluate((element) => ({
        inert: (element as HTMLElement).inert,
        ariaHidden: element.getAttribute("aria-hidden"),
      })),
    )
    .toEqual({ inert: true, ariaHidden: "true" })

  await dialog.getByRole("button", { name: "Annuler", exact: true }).click()
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden")
  await expect
    .poll(() =>
      page.locator("[data-modal-test-preserved]").evaluate((element) => ({
        inert: element.hasAttribute("inert"),
        ariaHidden: element.getAttribute("aria-hidden"),
      })),
    )
    .toEqual({ inert: true, ariaHidden: "false" })
  await expect
    .poll(() =>
      page.locator("[data-modal-test-dynamic]").evaluate((element) => ({
        inert: element.hasAttribute("inert"),
        ariaHidden: element.getAttribute("aria-hidden"),
      })),
    )
    .toEqual({ inert: false, ariaHidden: null })
  await page.evaluate(() => {
    document.querySelector("[data-modal-test-preserved]")?.remove()
    document.querySelector("[data-modal-test-dynamic]")?.remove()
  })

  await trigger.click()
  await expect(dialog).toBeVisible()
  await dialog.click({ position: { x: 2, y: 2 } })
  await expect(dialog).toBeHidden()

  await trigger.click()
  await expect(dialog).toBeVisible()

  await page.keyboard.press("Escape")
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
  expectNoHydrationErrors()
})

test("nested tutorial dialogs isolate only the lower modal and unwind cleanly", async ({ page }) => {
  const expectNoHydrationErrors = monitorHydration(page)

  await page.goto("/tutoriels?vue=tous")
  const tutorialTrigger = page
    .getByRole("button", { name: /Commencer|Reprendre|Revoir/ })
    .first()
  await tutorialTrigger.focus()
  await tutorialTrigger.click()

  const dialogs = page.getByRole("dialog")
  const modalLayers = page.locator(
    "body > [data-safecheck-modal]",
  )
  await expect(dialogs).toHaveCount(1)
  await expect(modalLayers).toHaveCount(1)

  const tutorialDialog = dialogs.first()
  const precisionTrigger = tutorialDialog.getByRole("button", {
    name: /Signaler une precision/,
  })
  await precisionTrigger.focus()
  await precisionTrigger.click()

  await expect(modalLayers).toHaveCount(2)
  await expect(dialogs).toHaveCount(1)
  await expect(dialogs).toHaveAccessibleName("Apporter une precision")
  await expect(modalLayers.first()).toHaveAttribute("inert", "")
  await expect(modalLayers.first()).toHaveAttribute("aria-hidden", "true")
  await expect(modalLayers.last()).not.toHaveAttribute("inert", "")
  await expect
    .poll(() =>
      modalLayers.last().evaluate((element) => element.contains(document.activeElement)),
    )
    .toBe(true)

  await page.keyboard.press("Escape")
  await expect(dialogs).toHaveCount(1)
  await expect(modalLayers).toHaveCount(1)
  await expect(modalLayers.first()).not.toHaveAttribute("inert", "")
  await expect(modalLayers.first()).not.toHaveAttribute("aria-hidden", "true")
  await expect(precisionTrigger).toBeFocused()
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden")

  await page.keyboard.press("Escape")
  await expect(dialogs).toHaveCount(0)
  await expect(tutorialTrigger).toBeFocused()
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden")
  await expect(page.locator("body > [inert]")).toHaveCount(0)
  expectNoHydrationErrors()
})

test("lexicon drawer keeps its viewport geometry in light and dark themes", async ({ page }) => {
  const expectNoHydrationErrors = monitorHydration(page)
  const cases = [
    { theme: "light", width: 390, height: 844 },
    { theme: "dark", width: 1280, height: 800 },
  ] as const

  for (const testCase of cases) {
    await page.setViewportSize({ width: testCase.width, height: testCase.height })
    await page.goto("/lexique")
    await page.evaluate(
      (theme) => window.localStorage.setItem("theme", theme),
      testCase.theme,
    )
    await page.goto("/lexique?terme=phishing")

    await expect(page.locator("html")).toHaveClass(new RegExp(testCase.theme))
    const drawer = page
      .getByRole("dialog", { name: /Définition de/ })
      .locator(":scope > div")
    await expect(drawer).toBeVisible()
    const bounds = await drawer.boundingBox()
    expect(bounds).not.toBeNull()
    expect(bounds!.x).toBeGreaterThanOrEqual(Math.max(0, testCase.width - 450))
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(testCase.width)
    expect(bounds!.height).toBe(testCase.height)

    await page.getByRole("dialog").getByRole("button", { name: "Fermer" }).click()
    await expect(page.getByRole("dialog")).toHaveCount(0)
  }

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
