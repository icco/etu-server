import { test, expect } from "@playwright/test"

test.describe("History Page", () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate via the login page (mock mode accepts any credentials)
    await page.goto("/login")
    await page.getByLabel("Email").fill("test@example.com")
    await page.getByLabel("Password").fill("testpassword")
    await page.getByRole("button", { name: "Sign In" }).click()

    // Wait for redirect to notes page
    await page.waitForURL("/notes")

    // Navigate to history page
    await page.goto("/history")
  })

  test("displays history heading", async ({ page }) => {
    await expect(page.locator("h1").filter({ hasText: "History" })).toBeVisible({ timeout: 10000 })
    await expect(page).toHaveScreenshot("history-heading.png")
  })

  test("displays notes grouped by date", async ({ page }) => {
    // Wait for notes to load
    await expect(page.locator("h1").filter({ hasText: "History" })).toBeVisible({ timeout: 10000 })

    // Verify mock notes are displayed
    await expect(page.locator(".card").first()).toBeVisible()

    // Check for date grouping headers
    await expect(page.locator("h3").first()).toBeVisible()
    await expect(page).toHaveScreenshot("history-grouped.png")
  })

  test("has navigation links", async ({ page, viewport }) => {
    // Skip on mobile - mobile nav is tested separately in mobile-navigation.spec.ts
    test.skip(viewport !== null && viewport.width < 768, "Mobile navigation tested separately")

    await expect(page.locator("h1").filter({ hasText: "History" })).toBeVisible({ timeout: 10000 })

    // Check for nav links
    await expect(page.getByRole("link", { name: /notes/i })).toBeVisible()
    await expect(page.getByRole("link", { name: /search/i })).toBeVisible()
    await expect(page.getByRole("link", { name: /tags/i })).toBeVisible()
  })

  test("has FAB for new note", async ({ page }) => {
    await expect(page.locator("h1").filter({ hasText: "History" })).toBeVisible({ timeout: 10000 })

    // Find the FAB button
    const fabButton = page.locator(".fab button")
    await expect(fabButton).toBeVisible()
  })

  test("clicking FAB opens new note dialog", async ({ page }) => {
    await expect(page.locator("h1").filter({ hasText: "History" })).toBeVisible({ timeout: 10000 })

    // Click FAB
    await page.locator(".fab button").click()

    // Wait for modal to open
    await expect(page.locator("dialog.modal-open")).toBeVisible({ timeout: 5000 })
    await expect(page).toHaveScreenshot("history-new-dialog.png")
  })

  test("clicking note opens view modal", async ({ page }) => {
    await expect(page.locator("h1").filter({ hasText: "History" })).toBeVisible({ timeout: 10000 })

    // Click on first note card
    await page.locator(".card").first().click()

    // Wait for modal to open
    await expect(page.locator("dialog.modal-open")).toBeVisible({ timeout: 5000 })
    await expect(page).toHaveScreenshot("history-view-modal.png")
  })
})
