import { test, expect } from "@playwright/test"

test.describe("Notes Page", () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate via the login page (mock mode accepts any credentials)
    await page.goto("/login")
    await page.getByLabel("Email").fill("test@example.com")
    await page.getByLabel("Password").fill("testpassword")
    await page.getByRole("button", { name: "Sign In" }).click()

    // Wait for redirect to notes page
    await page.waitForURL("/notes")
  })

  test("displays notes list with mocked data", async ({ page }) => {
    // Wait for notes to load - use first() since "ideas" appears multiple times
    await expect(page.locator("text=ideas").first()).toBeVisible({ timeout: 10000 })

    // Verify mock notes are displayed
    await expect(page.locator("text=projects").first()).toBeVisible()
    await expect(page.locator("text=work").first()).toBeVisible()
    await expect(page).toHaveScreenshot("notes-list.png")
  })

  test("displays note content", async ({ page }) => {
    await expect(page.locator("text=ideas").first()).toBeVisible({ timeout: 10000 })

    // Check for actual note content from mock data
    await expect(page.locator("text=building").first()).toBeVisible()
    await expect(page).toHaveScreenshot("notes-content.png")
  })

  test("search filters notes", async ({ page }) => {
    await expect(page.locator("text=ideas").first()).toBeVisible({ timeout: 10000 })

    // Look for search input (may be in a toggle)
    const searchToggle = page.locator("[aria-label*='search' i], button:has-text('Search')")
    if (await searchToggle.first().isVisible()) {
      await searchToggle.first().click()
    }

    const searchInput = page.getByPlaceholder(/search/i)
    await expect(searchInput).toBeVisible()
    await searchInput.fill("meeting")
    await searchInput.press("Enter")

    // Wait for filtered results
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot("notes-search.png")
  })

  test("new note dialog opens", async ({ page }) => {
    await expect(page.locator("text=ideas").first()).toBeVisible({ timeout: 10000 })

    // Find the primary button (New note button) in the header
    const newNoteButton = page.locator("button.btn-primary").first()
    await expect(newNoteButton).toBeVisible()
    await newNoteButton.click()

    // Wait for the daisyUI modal to open (modal-open class is added)
    await expect(page.locator("dialog.modal-open")).toBeVisible({ timeout: 5000 })
    await expect(page).toHaveScreenshot("notes-new-dialog.png")
  })
})
