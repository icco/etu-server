import { test, expect } from "@playwright/test"

test.describe("Auth Pages", () => {
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

  test("login page displays correctly", async ({ page }) => {
    await page.goto("/login")
    await expect(page.locator("h2").filter({ hasText: "Welcome back" })).toBeVisible()
    await expect(page.getByLabel("Email")).toBeVisible()
    await expect(page.getByLabel("Password")).toBeVisible()
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible()
    await expect(page).toHaveScreenshot("login-page.png")
  })

  test("register page displays correctly", async ({ page }) => {
    await page.goto("/register")
    await expect(page.locator("h2").filter({ hasText: "Create your account" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Create Account" })).toBeVisible()
    await expect(page).toHaveScreenshot("register-page.png")
  })

  test("login form shows validation", async ({ page }) => {
    await page.goto("/login")
    // Click sign in without filling form to trigger validation
    await page.getByRole("button", { name: "Sign In" }).click()
    // The browser's built-in validation will show
    await expect(page).toHaveScreenshot("login-validation.png")
  })
})
