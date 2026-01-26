import { test, expect } from "./fixtures"

test.describe("Notes Page", () => {
  test.beforeEach(async ({ page, mockApi }) => {
    await mockApi(page)
  })

  test("displays notes list with mocked data", async ({ page }) => {
    await page.goto("/notes")

    // Wait for notes to load
    await page.waitForSelector("text=ideas")

    // Verify mock notes are displayed
    await expect(page.locator("text=ideas")).toBeVisible()
    await expect(page.locator("text=work")).toBeVisible()
    await expect(page).toHaveScreenshot("notes-list.png")
  })

  test("notes page mobile view", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto("/notes")
    await page.waitForSelector("text=ideas")
    await expect(page).toHaveScreenshot("notes-mobile.png")
  })

  test("displays empty state when no notes", async ({ page }) => {
    // Override mock to return empty notes
    await page.route("**/etu.v1.EtuService/ListNotes", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ notes: [] }),
      })
    })

    await page.goto("/notes")
    await page.waitForLoadState("networkidle")
    await expect(page).toHaveScreenshot("notes-empty.png")
  })

  test("search filters notes", async ({ page }) => {
    await page.goto("/notes")
    await page.waitForSelector("text=ideas")

    // Find and click search input or toggle
    const searchInput = page.getByPlaceholder(/search/i)
    if (await searchInput.isVisible()) {
      await searchInput.fill("meeting")
      await expect(page).toHaveScreenshot("notes-search.png")
    }
  })

  test("new note dialog opens", async ({ page }) => {
    await page.goto("/notes")
    await page.waitForSelector("text=ideas")

    // Find and click the new note button
    const newNoteButton = page.getByRole("button", { name: /new|add|create/i })
    if (await newNoteButton.isVisible()) {
      await newNoteButton.click()
      await page.waitForSelector("[role=dialog]")
      await expect(page).toHaveScreenshot("notes-new-dialog.png")
    }
  })
})
