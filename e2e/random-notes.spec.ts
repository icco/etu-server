import { test, expect } from "@playwright/test"

test.describe("Random Notes Home Page", () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate via the login page (mock mode accepts any credentials)
    await page.goto("/login")
    await page.getByLabel("Email").fill("test@example.com")
    await page.getByLabel("Password").fill("testpassword")
    await page.getByRole("button", { name: "Sign In" }).click()

    // After login, explicitly navigate to the home page
    // (auth flow may redirect to /notes, so we navigate to / explicitly)
    await page.goto("/")
  })

  test("displays random blips heading", async ({ page }) => {
    // Wait for the random notes view to load
    await expect(page.locator("h1").filter({ hasText: "Random Blips" })).toBeVisible({ timeout: 10000 })
    await expect(page).toHaveScreenshot("random-notes-heading.png")
  })

  test("displays random notes with mock data", async ({ page }) => {
    // Wait for notes to load
    await expect(page.locator("h1").filter({ hasText: "Random Blips" })).toBeVisible({ timeout: 10000 })

    // Verify mock notes are displayed (at least some should appear)
    await expect(page.locator(".card").first()).toBeVisible()
    await expect(page).toHaveScreenshot("random-notes-list.png")
  })

  test("shows history link in header", async ({ page }) => {
    await expect(page.locator("h1").filter({ hasText: "Random Blips" })).toBeVisible({ timeout: 10000 })

    // Check for history link
    await expect(page.getByRole("link", { name: /history/i })).toBeVisible()
    await expect(page).toHaveScreenshot("random-notes-header.png")
  })

  test("clicking history link navigates to notes page", async ({ page }) => {
    await expect(page.locator("h1").filter({ hasText: "Random Blips" })).toBeVisible({ timeout: 10000 })

    // Click history link
    await page.getByRole("link", { name: /history/i }).click()

    // Should navigate to /notes
    await expect(page).toHaveURL("/notes")
  })

  test("shows refresh button", async ({ page }) => {
    await expect(page.locator("h1").filter({ hasText: "Random Blips" })).toBeVisible({ timeout: 10000 })

    // Scroll to bottom to see refresh button
    await page.locator("text=Refresh Random Selection").scrollIntoViewIfNeeded()
    await expect(page.getByRole("button", { name: /refresh random selection/i })).toBeVisible()
    await expect(page).toHaveScreenshot("random-notes-refresh.png")
  })

  test("clicking refresh button reloads the page", async ({ page }) => {
    await expect(page.locator("h1").filter({ hasText: "Random Blips" })).toBeVisible({ timeout: 10000 })

    // Scroll to the refresh button
    const refreshButton = page.getByRole("button", { name: /refresh random selection/i })
    await refreshButton.scrollIntoViewIfNeeded()

    // Click the refresh button
    await refreshButton.click()

    // Page should reload - verify the heading is still visible after refresh
    await expect(page.locator("h1").filter({ hasText: "Random Blips" })).toBeVisible({ timeout: 10000 })
  })
})
