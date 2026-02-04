import { test, expect } from "@playwright/test"

test.describe("Search Page", () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate via the login page (mock mode accepts any credentials)
    await page.goto("/login")
    await page.getByLabel("Email").fill("test@example.com")
    await page.getByLabel("Password").fill("testpassword")
    await page.getByRole("button", { name: "Sign In" }).click()

    // Wait for redirect to notes page
    await page.waitForURL("/notes")

    // Navigate to search page
    await page.goto("/search")
  })

  test("displays search heading", async ({ page }) => {
    await expect(page.locator("h1").filter({ hasText: "Search" })).toBeVisible({ timeout: 10000 })
    await expect(page).toHaveScreenshot("search-heading.png")
  })

  test("displays empty state when no query", async ({ page }) => {
    await expect(page.locator("h1").filter({ hasText: "Search" })).toBeVisible({ timeout: 10000 })

    // Check for empty state message
    await expect(page.locator("text=Search your blips")).toBeVisible()
    await expect(page).toHaveScreenshot("search-empty.png")
  })

  test("has search input in header", async ({ page }) => {
    await expect(page.locator("h1").filter({ hasText: "Search" })).toBeVisible({ timeout: 10000 })

    // Check for search input (use first() as there may be multiple on page)
    await expect(page.locator('input[name="q"]').first()).toBeVisible()
  })

  test("displays results when searching", async ({ page }) => {
    // Navigate with a search query that matches mock data
    await page.goto("/search?q=ideas")

    // Wait for results
    await expect(page.locator("text=result").first()).toBeVisible({ timeout: 10000 })
    await expect(page).toHaveScreenshot("search-results.png")
  })

  test("displays no results message for non-matching query", async ({ page }) => {
    // Navigate with a query that won't match
    await page.goto("/search?q=xyznonexistent123")

    // Wait for no results message
    await expect(page.locator("text=No matching blips")).toBeVisible({ timeout: 10000 })
    await expect(page).toHaveScreenshot("search-no-results.png")
  })

  test("has navigation links", async ({ page, viewport }) => {
    // Skip on mobile - mobile nav is tested separately in mobile-navigation.spec.ts
    test.skip(viewport !== null && viewport.width < 768, "Mobile navigation tested separately")

    await expect(page.locator("h1").filter({ hasText: "Search" })).toBeVisible({ timeout: 10000 })

    // Check for nav links
    await expect(page.getByRole("link", { name: /notes/i })).toBeVisible()
    await expect(page.getByRole("link", { name: /history/i })).toBeVisible()
    await expect(page.getByRole("link", { name: /tags/i })).toBeVisible()
  })

  test("has FAB for new note", async ({ page }) => {
    await expect(page.locator("h1").filter({ hasText: "Search" })).toBeVisible({ timeout: 10000 })

    const fabButton = page.locator(".fab button")
    await expect(fabButton).toBeVisible()
  })

  test("search form submits correctly", async ({ page }) => {
    await expect(page.locator("h1").filter({ hasText: "Search" })).toBeVisible({ timeout: 10000 })

    // Fill search input and submit
    await page.locator('input[name="q"]').first().fill("test query")
    await page.locator('input[name="q"]').first().press("Enter")

    // Should navigate to search page with query
    await expect(page).toHaveURL(/\/search\?q=test\+query/)
  })

  test("trims whitespace from search query", async ({ page }) => {
    // Search with leading/trailing whitespace
    await page.goto("/search?q=%20%20building%20%20")

    // Should still find results (query gets trimmed)
    await expect(page.locator("text=result").first()).toBeVisible({ timeout: 10000 })
    // Verify the note with "building" content is shown
    await expect(page.locator("text=building").first()).toBeVisible()
  })

  test("search is case-insensitive", async ({ page }) => {
    // Search with uppercase
    await page.goto("/search?q=BUILDING")

    // Should find the note with lowercase "building"
    await expect(page.locator("text=result").first()).toBeVisible({ timeout: 10000 })
    await expect(page.locator("text=building").first()).toBeVisible()
  })

  test("finds notes by partial content match", async ({ page }) => {
    // Search for partial word
    await page.goto("/search?q=road")

    // Should find "roadmap" in mock data
    await expect(page.locator("text=result").first()).toBeVisible({ timeout: 10000 })
    await expect(page.locator("text=roadmap").first()).toBeVisible()
  })

  test("displays multiple matching results", async ({ page }) => {
    // Search for "personal" which appears in multiple mock notes
    await page.goto("/search?q=personal")

    // Should show multiple results
    await expect(page.locator("text=results").first()).toBeVisible({ timeout: 10000 })
  })

  test("empty search query shows empty state", async ({ page }) => {
    // Navigate with empty query
    await page.goto("/search?q=")

    // Should show empty state, not results
    await expect(page.locator("text=Search your blips")).toBeVisible({ timeout: 10000 })
  })

  test("whitespace-only query shows empty state", async ({ page }) => {
    // Navigate with whitespace-only query
    await page.goto("/search?q=%20%20%20")

    // Should show empty state after trimming
    await expect(page.locator("text=Search your blips")).toBeVisible({ timeout: 10000 })
  })
})
