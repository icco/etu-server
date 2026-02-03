import { test, expect } from "@playwright/test"

test.describe("Mobile Navigation", () => {
  // Skip tests on desktop - mobile nav is hidden with md:hidden
  test.skip(({ viewport }) => {
    return viewport !== null && viewport.width >= 768
  }, "Mobile navigation only visible on mobile viewports")

  test.beforeEach(async ({ page }) => {
    // Authenticate via the login page
    await page.goto("/login")
    await page.getByLabel("Email").fill("test@example.com")
    await page.getByLabel("Password").fill("testpassword")
    await page.getByRole("button", { name: "Sign In" }).click()
    await page.waitForURL("/notes")
  })

  test("mobile menu button is visible on home page", async ({ page }) => {
    await page.goto("/")

    // Check that the mobile menu button is visible using test ID
    const mobileMenuButton = page.getByTestId("mobile-nav").getByRole("button", { name: "Open navigation menu" })
    await expect(mobileMenuButton).toBeVisible()
  })

  test("can navigate to /notes from home page using mobile menu", async ({ page }) => {
    await page.goto("/")

    // Click the mobile menu button using test ID
    await page.getByTestId("mobile-nav").getByRole("button", { name: "Open navigation menu" }).click()

    // Wait for dropdown to appear and click Notes link
    await page.getByTestId("mobile-nav").locator('.dropdown-content').getByRole("link", { name: /notes/i }).click()

    // Verify we navigated to /notes
    await expect(page).toHaveURL("/notes")
  })

  test("mobile menu shows all navigation options", async ({ page }) => {
    await page.goto("/")

    // Click the mobile menu button
    await page.getByTestId("mobile-nav").getByRole("button", { name: "Open navigation menu" }).click()

    // Check all navigation links are visible in the menu
    const dropdown = page.getByTestId("mobile-nav").locator('.dropdown-content')
    await expect(dropdown.getByRole("link", { name: /notes/i })).toBeVisible()
    await expect(dropdown.getByRole("link", { name: /history/i })).toBeVisible()
    await expect(dropdown.getByRole("link", { name: /search/i })).toBeVisible()
    await expect(dropdown.getByRole("link", { name: /tags/i })).toBeVisible()
  })

  test("mobile menu works on /notes page", async ({ page }) => {
    await page.goto("/notes")

    // Click the mobile menu button
    await page.getByTestId("mobile-nav").getByRole("button", { name: "Open navigation menu" }).click()

    // Navigate to History
    await page.getByTestId("mobile-nav").locator('.dropdown-content').getByRole("link", { name: /history/i }).click()
    await expect(page).toHaveURL("/history")
  })
})
