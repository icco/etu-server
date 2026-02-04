import { test, expect, Page } from "@playwright/test"

/**
 * Enable dark mode by clicking the theme toggle in the footer
 */
async function enableDarkMode(page: Page) {
  // Click the theme toggle (checkbox in footer)
  await page.locator("label.swap").click()
  // Wait for dark theme to be applied
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark")
  // Reset scroll position so subsequent screenshots start from the top
  await page.evaluate(() => window.scrollTo(0, 0))
}

test.describe("Dark Mode", () => {
  test.describe("Theme Toggle", () => {
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

    test("theme toggle is visible and functional", async ({ page }) => {
      await page.goto("/")

      // Verify toggle is visible in footer
      const toggle = page.locator("label.swap")
      await expect(toggle).toBeVisible()

      // Toggle to dark mode
      await toggle.click()
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark")

      // Toggle back to light mode
      await toggle.click()
      await expect(page.locator("html")).toHaveAttribute("data-theme", "light")
    })
  })

  test.describe("Landing Page Dark Mode", () => {
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

    test("displays hero section in dark mode", async ({ page }) => {
      await page.goto("/")
      await enableDarkMode(page)

      await expect(page.locator("h1").first()).toContainText("Stop Losing Your Best Ideas")
      await expect(page.getByRole("link", { name: "Start Free for 14 Days" })).toBeVisible()
      await expect(page).toHaveScreenshot("landing-hero-dark.png")
    })

    test("displays features section in dark mode", async ({ page }) => {
      await page.goto("/")
      await enableDarkMode(page)

      await page.locator("text=Etu Brings Ideas Back to Life").scrollIntoViewIfNeeded()
      await expect(page.locator("text=Capture in Seconds")).toBeVisible()
      await expect(page).toHaveScreenshot("landing-features-dark.png")
    })

    test("displays pricing section in dark mode", async ({ page }) => {
      await page.goto("/")
      await enableDarkMode(page)

      await page.locator("text=Simple pricing").scrollIntoViewIfNeeded()
      await expect(page.locator("text=$5/year").first()).toBeVisible()
      await expect(page).toHaveScreenshot("landing-pricing-dark.png")
    })
  })

  test.describe("Auth Pages Dark Mode", () => {
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

    test("displays login page in dark mode", async ({ page }) => {
      await page.goto("/login")
      await enableDarkMode(page)

      await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible()
      await expect(page.getByLabel("Email")).toBeVisible()
      await expect(page.getByLabel("Password")).toBeVisible()
      await expect(page).toHaveScreenshot("login-page-dark.png")
    })

    test("displays register page in dark mode", async ({ page }) => {
      await page.goto("/register")
      await enableDarkMode(page)

      await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible()
      await expect(page.getByLabel("Email")).toBeVisible()
      await expect(page.getByLabel("Password", { exact: true })).toBeVisible()
      await expect(page).toHaveScreenshot("register-page-dark.png")
    })
  })

  test.describe("Authenticated Pages Dark Mode", () => {
    test.beforeEach(async ({ page }) => {
      // Authenticate via the login page (mock mode accepts any credentials)
      await page.goto("/login")
      await page.getByLabel("Email").fill("test@example.com")
      await page.getByLabel("Password").fill("testpassword")
      await page.getByRole("button", { name: "Sign In" }).click()

      // Wait for redirect to notes page
      await page.waitForURL("/notes")
    })

    test("displays notes page in dark mode", async ({ page }) => {
      await enableDarkMode(page)

      // Verify notes page content (use stable tag visible on /notes in mock mode)
      await expect(page.locator("text=ideas").first()).toBeVisible({ timeout: 10000 })
      await expect(page).toHaveScreenshot("notes-list-dark.png")
    })

    test("displays settings page in dark mode", async ({ page }) => {
      await page.goto("/settings")
      await expect(page.locator("h2").filter({ hasText: "Profile Information" })).toBeVisible({
        timeout: 10000,
      })

      await enableDarkMode(page)

      // Verify all tabs are visible
      await expect(page.getByRole("tab", { name: "Account" })).toBeVisible()
      await expect(page.getByRole("tab", { name: "Stats" })).toBeVisible()
      await expect(page).toHaveScreenshot("settings-account-dark.png")
    })
  })
})
