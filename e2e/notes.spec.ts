import { test, expect } from "@playwright/test"

// NOTE: These tests are skipped because the /notes route is protected by
// server-side auth (NextAuth middleware). The gRPC calls also happen server-side
// via @connectrpc/connect-node, so browser-level route mocking won't intercept them.
//
// To enable these tests, you would need either:
// 1. A test user with valid session cookies/storage state
// 2. An e2e auth bypass flag in the app
// 3. A mock gRPC backend server

test.describe("Notes Page", () => {
  test.skip("displays notes list with mocked data", async ({ page }) => {
    await page.goto("/notes")
    await page.waitForSelector("text=ideas")
    await expect(page.locator("text=ideas")).toBeVisible()
    await expect(page.locator("text=work")).toBeVisible()
    await expect(page).toHaveScreenshot("notes-list.png")
  })

  test.skip("displays empty state when no notes", async ({ page }) => {
    await page.goto("/notes")
    await page.waitForLoadState("networkidle")
    await expect(page).toHaveScreenshot("notes-empty.png")
  })

  test.skip("search filters notes", async ({ page }) => {
    await page.goto("/notes")
    await page.waitForSelector("text=ideas")

    const searchInput = page.getByPlaceholder(/search/i)
    await expect(searchInput).toBeVisible()
    await searchInput.fill("meeting")
    await expect(page).toHaveScreenshot("notes-search.png")
  })

  test.skip("new note dialog opens", async ({ page }) => {
    await page.goto("/notes")
    await page.waitForSelector("text=ideas")

    const newNoteButton = page.getByRole("button", { name: /new|add|create/i })
    await expect(newNoteButton).toBeVisible()
    await newNoteButton.click()
    await page.waitForSelector("[role=dialog]")
    await expect(page).toHaveScreenshot("notes-new-dialog.png")
  })
})
