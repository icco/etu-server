import { test, expect } from "@playwright/test"

test.describe("Mobile Navigation", () => {
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
    
    // Check that the mobile menu (hamburger) button is visible
    const mobileMenuButton = page.locator('[role="button"]').filter({ has: page.locator('svg') }).first()
    await expect(mobileMenuButton).toBeVisible()
  })

  test("can navigate to /notes from home page using mobile menu", async ({ page }) => {
    await page.goto("/")
    
    // Click the mobile menu button (hamburger icon)
    const mobileMenuButton = page.locator('.dropdown').filter({ has: page.locator('svg[class*="h-6 w-6"]') }).first()
    await mobileMenuButton.click()
    
    // Wait for dropdown to appear and click Notes link
    await page.getByRole("link", { name: /notes/i }).first().click()
    
    // Verify we navigated to /notes
    await expect(page).toHaveURL("/notes")
  })

  test("mobile menu shows all navigation options", async ({ page }) => {
    await page.goto("/")
    
    // Click the mobile menu button
    const mobileMenuButton = page.locator('.dropdown').filter({ has: page.locator('svg[class*="h-6 w-6"]') }).first()
    await mobileMenuButton.click()
    
    // Check all navigation links are visible in the menu
    const dropdown = page.locator('.dropdown-content')
    await expect(dropdown.getByRole("link", { name: /notes/i })).toBeVisible()
    await expect(dropdown.getByRole("link", { name: /history/i })).toBeVisible()
    await expect(dropdown.getByRole("link", { name: /search/i })).toBeVisible()
    await expect(dropdown.getByRole("link", { name: /tags/i })).toBeVisible()
  })

  test("mobile menu works on /notes page", async ({ page }) => {
    await page.goto("/notes")
    
    // Click the mobile menu button
    const mobileMenuButton = page.locator('.dropdown').filter({ has: page.locator('svg[class*="h-6 w-6"]') }).first()
    await mobileMenuButton.click()
    
    // Navigate to History
    await page.getByRole("link", { name: /history/i }).first().click()
    await expect(page).toHaveURL("/history")
  })
})
