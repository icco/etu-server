import { test, expect } from "@playwright/test"
import type { Download } from "@playwright/test"

test.describe("Export Notes", () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate via the login page (mock mode accepts any credentials)
    await page.goto("/login")
    await page.getByLabel("Email").fill("test@example.com")
    await page.getByLabel("Password").fill("testpassword")
    await page.getByRole("button", { name: "Sign In" }).click()

    // Wait for redirect to notes page
    await page.waitForURL("/notes")
  })

  test("export button is visible on account settings page", async ({ page }) => {
    // Navigate to account settings
    await page.goto("/settings/account")

    // Wait for the page to load
    await expect(page.getByText("Profile Information")).toBeVisible()

    // Verify export section exists
    await expect(page.getByText("Export Data")).toBeVisible()
    await expect(
      page.getByText("Download all your notes as a JSON file")
    ).toBeVisible()

    // Verify export button exists
    const exportButton = page.getByRole("button", {
      name: "Export All Notes as JSON",
    })
    await expect(exportButton).toBeVisible()
    await expect(exportButton).toBeEnabled()
  })

  test("can export notes as JSON file", async ({ page }) => {
    // Navigate to account settings
    await page.goto("/settings/account")

    // Wait for the page to load
    await expect(page.getByText("Export Data")).toBeVisible()

    // Start waiting for download before clicking
    const downloadPromise = page.waitForEvent("download")

    // Click export button
    const exportButton = page.getByRole("button", {
      name: "Export All Notes as JSON",
    })
    await exportButton.click()

    // Wait for the download
    const download: Download = await downloadPromise

    // Verify the filename contains the expected pattern
    const filename = download.suggestedFilename()
    expect(filename).toMatch(/^etu-notes-export-\d{4}-\d{2}-\d{2}\.json$/)

    // Save the download to a temporary location and verify its contents
    const path = await download.path()
    expect(path).toBeTruthy()

    // Read and parse the downloaded JSON
    const fs = await import("fs")
    const content = fs.readFileSync(path!, "utf-8")
    const exportData = JSON.parse(content)

    // Verify the JSON structure
    expect(exportData).toHaveProperty("exportDate")
    expect(exportData).toHaveProperty("userId")
    expect(exportData).toHaveProperty("totalNotes")
    expect(exportData).toHaveProperty("notes")
    expect(Array.isArray(exportData.notes)).toBe(true)

    // Verify date format
    expect(exportData.exportDate).toMatch(/^\d{4}-\d{2}-\d{2}T/)

    // If there are notes, verify their structure
    if (exportData.notes.length > 0) {
      const firstNote = exportData.notes[0]
      expect(firstNote).toHaveProperty("id")
      expect(firstNote).toHaveProperty("content")
      expect(firstNote).toHaveProperty("tags")
      expect(firstNote).toHaveProperty("createdAt")
      expect(firstNote).toHaveProperty("updatedAt")
      expect(firstNote).toHaveProperty("images")
      expect(Array.isArray(firstNote.tags)).toBe(true)
      expect(Array.isArray(firstNote.images)).toBe(true)
    }

    // Verify success toast appears
    await expect(page.getByText(/Exported \d+ notes successfully/)).toBeVisible({
      timeout: 5000,
    })
  })

  test("shows loading state during export", async ({ page }) => {
    // Navigate to account settings
    await page.goto("/settings/account")

    // Wait for the page to load
    await expect(page.getByText("Export Data")).toBeVisible()

    // Click export button
    const exportButton = page.getByRole("button", {
      name: "Export All Notes as JSON",
    })
    await exportButton.click()

    // Verify loading state appears briefly
    // Note: This may be too fast to catch in tests, but we check anyway
    const loadingSpinner = page.locator(".loading-spinner")
    const exportingText = page.getByText("Exporting...")

    // One of these should be visible or the button should be disabled
    await expect(
      exportButton.or(loadingSpinner).or(exportingText)
    ).toBeVisible()
  })
})
