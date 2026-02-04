import { test, expect } from "@playwright/test"

test.describe("Settings Page", () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate via the login page (mock mode accepts any credentials)
    await page.goto("/login")
    await page.getByLabel("Email").fill("test@example.com")
    await page.getByLabel("Password").fill("testpassword")
    await page.getByRole("button", { name: "Sign In" }).click()

    // Wait for redirect to notes page
    await page.waitForURL("/notes")

    // Navigate to settings - now redirects to /settings/account
    await page.goto("/settings")
    await page.waitForURL("/settings/account")
    await expect(page.locator("h2").filter({ hasText: "Profile Information" })).toBeVisible({
      timeout: 10000,
    })
  })

  test("displays settings page with all tabs", async ({ page }) => {
    // Verify all tabs are visible
    await expect(page.getByRole("tab", { name: "Account" })).toBeVisible()
    await expect(page.getByRole("tab", { name: "Stats" })).toBeVisible()
    await expect(page.getByRole("tab", { name: "Subscription" })).toBeVisible()
    await expect(page.getByRole("tab", { name: "API Keys" })).toBeVisible()

    await expect(page).toHaveScreenshot("settings-account-tab.png")
  })

  test("displays profile information correctly", async ({ page }) => {
    // Check profile fields are displayed
    await expect(page.locator("text=Name")).toBeVisible()
    await expect(page.locator("text=Email")).toBeVisible()
    await expect(page.locator("text=User ID")).toBeVisible()
    await expect(page.locator("text=Account Created")).toBeVisible()
  })

  test("can edit name field", async ({ page }) => {
    // Find and click the Edit button for the Name field
    // Use a more specific selector that targets the label and its sibling button
    const nameRow = page.locator("label:has-text('Name')").locator("..").first()
    await nameRow.getByRole("button", { name: "Edit" }).first().click()

    // Input should now be visible
    const nameInput = page.getByPlaceholder("Enter your name")
    await expect(nameInput).toBeVisible()

    // Clear and enter new name
    await nameInput.fill("")
    await nameInput.fill("Updated Test User")

    // Click the save button (checkmark)
    await nameRow.locator("button.btn-primary").click()

    // Wait for the update to complete and page to refresh
    await expect(page.locator("text=Name updated")).toBeVisible({ timeout: 5000 })

    // Verify the new name is displayed after refresh
    await page.reload()
    await expect(page.locator("h2").filter({ hasText: "Profile Information" })).toBeVisible({
      timeout: 10000,
    })

    await expect(page).toHaveScreenshot("settings-name-updated.png")
  })

  test("can edit profile image URL", async ({ page }) => {
    // Find the Profile Image section
    const imageSection = page.locator("div").filter({ hasText: /^Profile Image/ }).first()
    await imageSection.getByRole("button", { name: "Edit" }).click()

    // Input should now be visible
    const imageInput = page.getByPlaceholder("Enter image URL")
    await expect(imageInput).toBeVisible()

    // Enter a valid image URL
    await imageInput.fill("https://example.com/avatar.png")

    // Click save
    await imageSection.locator("button.btn-primary").click()

    // Wait for success message
    await expect(page.locator("text=Profile image updated")).toBeVisible({ timeout: 5000 })

    await expect(page).toHaveScreenshot("settings-image-updated.png")
  })

  test("can clear profile image with empty string", async ({ page }) => {
    // Find the Profile Image section
    const imageSection = page.locator("div").filter({ hasText: /^Profile Image/ }).first()
    await imageSection.getByRole("button", { name: "Edit" }).click()

    // Clear the input
    const imageInput = page.getByPlaceholder("Enter image URL")
    await imageInput.fill("")

    // Click save
    await imageSection.locator("button.btn-primary").click()

    // Wait for success message
    await expect(page.locator("text=Profile image updated")).toBeVisible({ timeout: 5000 })
  })

  test("displays Integrations section with Notion key", async ({ page }) => {
    // Scroll to Integrations card
    await expect(page.locator("h2").filter({ hasText: "Integrations" })).toBeVisible()
    await expect(page.locator("text=Notion API Key")).toBeVisible()

    await expect(page).toHaveScreenshot("settings-integrations.png")
  })

  test("can edit Notion API key", async ({ page }) => {
    // Find Notion key section
    const notionSection = page.locator("div").filter({ hasText: /^Notion API Key/ }).first()
    await notionSection.getByRole("button", { name: "Edit" }).click()

    // Input should be visible
    const notionInput = page.getByPlaceholder("Enter your Notion API key")
    await expect(notionInput).toBeVisible()

    // Enter a notion key
    await notionInput.fill("secret_abcdef123456")

    // Click save
    await notionSection.locator("button.btn-primary").click()

    // Wait for success
    await expect(page.locator("text=Notion key updated")).toBeVisible({ timeout: 5000 })

    // After update, should show masked key
    await page.reload()
    await expect(page.locator("text=••••••••••••")).toBeVisible({ timeout: 10000 })
  })

  test("displays Security section with password change", async ({ page }) => {
    await expect(page.locator("h2").filter({ hasText: "Security" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Change Password" })).toBeVisible()

    await expect(page).toHaveScreenshot("settings-security.png")
  })

  test("can open password change form", async ({ page }) => {
    // Click Change Password button
    await page.getByRole("button", { name: "Change Password" }).click()

    // Password inputs should be visible
    await expect(page.getByPlaceholder("Enter new password")).toBeVisible()
    await expect(page.getByPlaceholder("Confirm new password")).toBeVisible()
    await expect(page.getByRole("button", { name: "Update Password" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible()

    await expect(page).toHaveScreenshot("settings-password-form.png")
  })

  test("password change validates matching passwords", async ({ page }) => {
    // Open password form
    await page.getByRole("button", { name: "Change Password" }).click()

    // Enter mismatched passwords
    await page.getByPlaceholder("Enter new password").fill("newpassword123")
    await page.getByPlaceholder("Confirm new password").fill("differentpassword")

    // Try to submit
    await page.getByRole("button", { name: "Update Password" }).click()

    // Should show error
    await expect(page.locator("text=Passwords don't match")).toBeVisible({ timeout: 5000 })
  })

  test("password change validates minimum length", async ({ page }) => {
    // Open password form
    await page.getByRole("button", { name: "Change Password" }).click()

    // Enter short password
    await page.getByPlaceholder("Enter new password").fill("short")
    await page.getByPlaceholder("Confirm new password").fill("short")

    // Try to submit
    await page.getByRole("button", { name: "Update Password" }).click()

    // Should show error
    await expect(page.locator("text=Password must be at least 8 characters")).toBeVisible({
      timeout: 5000,
    })
  })

  test("can change password successfully", async ({ page }) => {
    // Open password form
    await page.getByRole("button", { name: "Change Password" }).click()

    // Enter valid matching passwords
    await page.getByPlaceholder("Enter new password").fill("newvalidpassword123")
    await page.getByPlaceholder("Confirm new password").fill("newvalidpassword123")

    // Submit
    await page.getByRole("button", { name: "Update Password" }).click()

    // Should show success
    await expect(page.locator("text=Password changed successfully")).toBeVisible({ timeout: 5000 })

    // Form should close
    await expect(page.getByRole("button", { name: "Change Password" })).toBeVisible()
  })

  test("can navigate to Stats tab", async ({ page }) => {
    await page.getByRole("tab", { name: "Stats" }).click()

    // Verify URL changed
    await page.waitForURL("/settings/stats")

    // Verify stats content
    await expect(page.locator("text=Your Statistics")).toBeVisible()
    await expect(page.locator("text=Your Blips")).toBeVisible()
    await expect(page.locator("text=Your Tags")).toBeVisible()

    await expect(page).toHaveScreenshot("settings-stats-tab.png")
  })

  test("can navigate to Subscription tab", async ({ page }) => {
    await page.getByRole("tab", { name: "Subscription" }).click()

    // Verify URL changed
    await page.waitForURL("/settings/subscription")

    // Verify subscription content
    await expect(page.locator("h2").filter({ hasText: "Subscription" })).toBeVisible()
    await expect(page.locator("text=$5")).toBeVisible()

    await expect(page).toHaveScreenshot("settings-subscription-tab.png")
  })

  test("can navigate to API Keys tab", async ({ page }) => {
    await page.getByRole("tab", { name: "API Keys" }).click()

    // Verify URL changed
    await page.waitForURL("/settings/api")

    // Verify API keys content
    await expect(page.locator("h2").filter({ hasText: "API Keys" })).toBeVisible()
    await expect(page.locator("text=Create New API Key")).toBeVisible()

    await expect(page).toHaveScreenshot("settings-api-keys-tab.png")
  })

  test("can directly navigate to stats page via URL", async ({ page }) => {
    // Direct navigation to stats sub-page
    await page.goto("/settings/stats")
    await page.waitForURL("/settings/stats")

    // Verify stats content is visible
    await expect(page.locator("text=Your Statistics")).toBeVisible()

    // Verify Stats tab is active
    await expect(page.getByRole("tab", { name: "Stats" })).toHaveClass(/tab-active/)
  })

  test("can directly navigate to subscription page via URL", async ({ page }) => {
    // Direct navigation to subscription sub-page
    await page.goto("/settings/subscription")
    await page.waitForURL("/settings/subscription")

    // Verify subscription content is visible
    await expect(page.locator("h2").filter({ hasText: "Subscription" })).toBeVisible()

    // Verify Subscription tab is active
    await expect(page.getByRole("tab", { name: "Subscription" })).toHaveClass(/tab-active/)
  })

  test("can directly navigate to api keys page via URL", async ({ page }) => {
    // Direct navigation to API keys sub-page
    await page.goto("/settings/api")
    await page.waitForURL("/settings/api")

    // Verify API keys content is visible
    await expect(page.locator("h2").filter({ hasText: "API Keys" })).toBeVisible()

    // Verify API Keys tab is active
    await expect(page.getByRole("tab", { name: "API Keys" })).toHaveClass(/tab-active/)
  })
})
