import { test, expect } from "@playwright/test"

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    // Mock auth to show logged-out state
    await page.route("**/api/auth/session", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({}),
      })
    })
  })

  test("displays hero section correctly", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("h1")).toContainText("Stop Losing Your Best Ideas")
    await expect(page.getByRole("link", { name: "Start Free for 14 Days" })).toBeVisible()
    await expect(page).toHaveScreenshot("landing-hero.png")
  })

  test("displays problem section", async ({ page }) => {
    await page.goto("/")
    await page.locator("text=Your Notes App Is a Graveyard").scrollIntoViewIfNeeded()
    await expect(page.locator("text=Your Notes App Is a Graveyard")).toBeVisible()
    await expect(page).toHaveScreenshot("landing-problem.png")
  })

  test("displays solution section", async ({ page }) => {
    await page.goto("/")
    await page.locator("text=Etu Brings Ideas Back to Life").scrollIntoViewIfNeeded()
    await expect(page.locator("text=Capture in Seconds")).toBeVisible()
    await expect(page).toHaveScreenshot("landing-solution.png")
  })

  test("displays FAQ section", async ({ page }) => {
    await page.goto("/")
    await page.locator("text=Common Questions").scrollIntoViewIfNeeded()
    await expect(page.locator("text=Common Questions")).toBeVisible()
    await expect(page).toHaveScreenshot("landing-faq.png")
  })
})

test.describe("Landing Page (Authenticated)", () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate via the login page
    await page.goto("/login")
    await page.getByLabel("Email").fill("test@example.com")
    await page.getByLabel("Password").fill("testpassword")
    await page.getByRole("button", { name: "Sign In" }).click()
    await page.waitForURL("/notes")
  })

  test("shows navigation links when logged in", async ({ page, viewport }) => {
    // Skip on mobile - mobile nav is tested separately in mobile-navigation.spec.ts
    test.skip(viewport !== null && viewport.width < 768, "Mobile navigation tested separately")

    await page.goto("/")
    // Check for app navigation links
    await expect(page.getByRole("link", { name: /notes/i })).toBeVisible()
    await expect(page.getByRole("link", { name: /history/i })).toBeVisible()
    await expect(page.getByRole("link", { name: /search/i })).toBeVisible()
    await expect(page.getByRole("link", { name: /tags/i })).toBeVisible()
    await expect(page).toHaveScreenshot("landing-authenticated.png")
  })
})
