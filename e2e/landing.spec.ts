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
    await expect(page.locator("h2").first()).toContainText("Your Thoughts")
    await expect(page.getByRole("link", { name: "Get Started" })).toBeVisible()
    await expect(page).toHaveScreenshot("landing-hero.png")
  })

  test("displays features section", async ({ page }) => {
    await page.goto("/")
    await page.locator("text=How It Works").scrollIntoViewIfNeeded()
    await expect(page.locator("text=Capture Instantly")).toBeVisible()
    await expect(page).toHaveScreenshot("landing-features.png", {
      fullPage: true,
    })
  })

  test("displays pricing section", async ({ page }) => {
    await page.goto("/")
    await page.locator("text=Simple, Honest Pricing").scrollIntoViewIfNeeded()
    await expect(page.locator("text=$5")).toBeVisible()
    await expect(page).toHaveScreenshot("landing-pricing.png")
  })
})
