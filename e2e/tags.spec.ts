import { test, expect } from "@playwright/test"

test.describe("Tags Page", () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate via the login page (mock mode accepts any credentials)
    await page.goto("/login")
    await page.getByLabel("Email").fill("test@example.com")
    await page.getByLabel("Password").fill("testpassword")
    await page.getByRole("button", { name: "Sign In" }).click()

    // Wait for redirect to notes page
    await page.waitForURL("/notes")

    // Navigate to tags page
    await page.goto("/tags")
  })

  test("displays tags heading", async ({ page }) => {
    await expect(page.locator("h1").filter({ hasText: "Tags" })).toBeVisible({ timeout: 10000 })
    await expect(page).toHaveScreenshot("tags-heading.png")
  })

  test("displays tags from mock data", async ({ page }) => {
    await expect(page.locator("h1").filter({ hasText: "Tags" })).toBeVisible({ timeout: 10000 })

    // Verify mock tags are displayed
    await expect(page.locator(".card").first()).toBeVisible()
    await expect(page).toHaveScreenshot("tags-list.png")
  })

  test("displays tag count badges", async ({ page }) => {
    await expect(page.locator("h1").filter({ hasText: "Tags" })).toBeVisible({ timeout: 10000 })

    // Check for count badges
    await expect(page.locator(".badge").first()).toBeVisible()
  })

  test("has navigation links", async ({ page }) => {
    await expect(page.locator("h1").filter({ hasText: "Tags" })).toBeVisible({ timeout: 10000 })

    // Check for nav links
    await expect(page.getByRole("link", { name: /notes/i })).toBeVisible()
    await expect(page.getByRole("link", { name: /history/i })).toBeVisible()
    await expect(page.getByRole("link", { name: /search/i })).toBeVisible()
  })

  test("clicking tag navigates to search", async ({ page }) => {
    await expect(page.locator("h1").filter({ hasText: "Tags" })).toBeVisible({ timeout: 10000 })

    // Click on a tag card
    await page.locator(".card").first().click()

    // Should navigate to search page with tag as query
    await expect(page).toHaveURL(/\/search\?q=/)
  })

  test("tag cards are styled correctly", async ({ page }) => {
    await expect(page.locator("h1").filter({ hasText: "Tags" })).toBeVisible({ timeout: 10000 })

    // Verify grid layout
    const grid = page.locator(".grid")
    await expect(grid).toBeVisible()

    // Verify tag icon is present in cards
    await expect(page.locator(".card svg").first()).toBeVisible()
  })
})
