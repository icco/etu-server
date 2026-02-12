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

  test("displays notes grid and latest blip with mocked data", async ({ page }) => {
    // Wait for notes to load - use first() since "ideas" may appear in grid or latest
    await expect(page.locator("text=ideas").first()).toBeVisible({ timeout: 10000 })

    // Verify mock notes are displayed (3x2 grid + latest blip section)
    // Scope to .card to avoid matching hidden text inside <dialog> modals
    await expect(page.locator(".card").filter({ hasText: "projects" }).first()).toBeVisible()
    await expect(page.locator(".card").filter({ hasText: "work" }).first()).toBeVisible()
    await expect(page).toHaveScreenshot("notes-list.png")
  })

  test("displays note content", async ({ page }) => {
    await expect(page.locator("text=ideas").first()).toBeVisible({ timeout: 10000 })

    // Check for actual note content from mock data
    await expect(page.locator("text=building").first()).toBeVisible()
    await expect(page).toHaveScreenshot("notes-content.png")
  })

  test("new note dialog opens via FAB", async ({ page }) => {
    await expect(page.locator("text=ideas").first()).toBeVisible({ timeout: 10000 })

    // Find the FAB button (floating action button in bottom corner)
    const fabButton = page.locator(".fab button")
    await expect(fabButton).toBeVisible()
    await fabButton.click()

    // Wait for the daisyUI modal to open (modal-open class is added)
    await expect(page.locator("dialog.modal-open")).toBeVisible({ timeout: 5000 })
    await expect(page).toHaveScreenshot("notes-new-dialog.png")
  })

  test("note modal renders markdown correctly", async ({ page }) => {
    await expect(page.locator("text=ideas").first()).toBeVisible({ timeout: 10000 })

    // Click on the note card that contains "building" to open the full view modal
    const buildingNoteCard = page.locator(".card", { hasText: "building" }).first()
    await expect(buildingNoteCard).toBeVisible()
    await buildingNoteCard.click()

    // Wait for the modal to open
    await expect(page.locator("dialog.modal-open")).toBeVisible({ timeout: 5000 })

    // Verify markdown is rendered - the prose class contains the rendered content
    const proseContent = page.locator("dialog.modal-open .prose")
    await expect(proseContent).toBeVisible()

    // The mock note has **building** which should render as <strong>
    await expect(proseContent.locator("strong")).toContainText("building")

    await expect(page).toHaveScreenshot("notes-modal-markdown.png")
  })

  test("can attach image to note and see it after save", async ({ page }) => {
    await expect(page.locator("text=ideas").first()).toBeVisible({ timeout: 10000 })

    // Open new note dialog via FAB
    const fabButton = page.locator(".fab button")
    await fabButton.click()
    await expect(page.locator("dialog.modal-open")).toBeVisible({ timeout: 5000 })

    // Use unique content to avoid collision with retries
    const uniqueContent = `Image test note ${Date.now()}`

    // Fill in note content
    const textarea = page.locator("dialog.modal-open textarea")
    await textarea.fill(uniqueContent)

    // Upload an image via the file input
    // Create a small test PNG (1x1 red pixel)
    const pngBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==",
      "base64"
    )
    const fileInput = page.locator('dialog.modal-open input[type="file"][accept="image/*"]')
    await fileInput.setInputFiles({
      name: "test-image.png",
      mimeType: "image/png",
      buffer: pngBuffer,
    })

    // Verify the pending image preview appears
    await expect(page.locator("dialog.modal-open").getByText("New images to upload")).toBeVisible()
    const pendingImagePreview = page.locator("dialog.modal-open img").first()
    await expect(pendingImagePreview).toBeVisible()

    // Save the note
    await page.getByRole("button", { name: "Save Blip" }).click()

    // Wait for modal to close
    await expect(page.locator("dialog.modal-open")).not.toBeVisible({ timeout: 5000 })

    // Find the newly created note card (should be at the top of the list)
    const newNoteCard = page.locator(".card", { hasText: uniqueContent }).first()
    await expect(newNoteCard).toBeVisible({ timeout: 5000 })

    // Click on the new note to open it
    await newNoteCard.click()

    // Verify the image is displayed in the note modal
    await expect(page.locator("dialog.modal-open")).toBeVisible({ timeout: 5000 })
    await expect(page.locator("dialog.modal-open").getByText("Attached Images")).toBeVisible()
    const attachedImage = page.locator("dialog.modal-open .grid img")
    await expect(attachedImage).toBeVisible()
  })

  test("displays image with extracted text and audio with transcription", async ({ page }) => {
    await expect(page.locator("text=ideas").first()).toBeVisible({ timeout: 10000 })

    // Click on the first note card which has image and audio with transcripts (mock-note-1)
    const noteWithMedia = page.locator(".card", { hasText: "building" }).first()
    await expect(noteWithMedia).toBeVisible()
    await noteWithMedia.click()

    // Wait for the modal to open
    await expect(page.locator("dialog.modal-open")).toBeVisible({ timeout: 5000 })

    // Verify image section exists
    await expect(page.locator("dialog.modal-open").getByText("Attached Images")).toBeVisible()
    
    // Verify extracted text is shown with CollapsibleTranscript component
    const extractedTextLabel = page.locator("dialog.modal-open").getByText("Extracted text:")
    await expect(extractedTextLabel).toBeVisible()
    
    // Verify the "Show more" button exists for long extracted text
    // Buttons use aria-label="Expand transcription" / "Collapse transcription"
    const extractedTextExpand = page.locator("dialog.modal-open").getByRole("button", { name: /Expand transcription/ }).first()
    await expect(extractedTextExpand).toBeVisible()

    // Click to expand and verify full text is visible
    await extractedTextExpand.click()
    await expect(page.locator("dialog.modal-open").getByText(/CollapsibleTranscript component handles/)).toBeVisible()

    // Verify "Collapse" button appears after expanding
    const extractedTextCollapse = page.locator("dialog.modal-open").getByRole("button", { name: /Collapse transcription/ }).first()
    await expect(extractedTextCollapse).toBeVisible()

    // Collapse it again
    await extractedTextCollapse.click()
    await expect(extractedTextExpand).toBeVisible()

    // Verify audio section exists
    await expect(page.locator("dialog.modal-open").getByText("Attached Audio Files")).toBeVisible()

    // Verify audio player is present
    const audioPlayer = page.locator("dialog.modal-open audio")
    await expect(audioPlayer).toBeVisible()

    // Verify transcription is shown with CollapsibleTranscript component
    const transcriptionLabel = page.locator("dialog.modal-open").getByText("Transcription:")
    await expect(transcriptionLabel).toBeVisible()

    // Verify the expand button exists for long transcription
    const transcriptionExpand = page.locator("dialog.modal-open").getByRole("button", { name: /Expand transcription/ }).last()
    await expect(transcriptionExpand).toBeVisible()

    // Click to expand transcription
    await transcriptionExpand.click()
    await expect(page.locator("dialog.modal-open").getByText(/audio transcription/)).toBeVisible()

    // Take a screenshot
    await expect(page).toHaveScreenshot("notes-with-transcripts.png")
  })

  test("displays short transcripts without collapse button", async ({ page }) => {
    await expect(page.locator("text=ideas").first()).toBeVisible({ timeout: 10000 })

    // Click on the note with short extracted text (mock-note-2)
    const noteWithShortText = page.locator(".card", { hasText: "Meeting notes" }).first()
    await expect(noteWithShortText).toBeVisible()
    await noteWithShortText.click()

    // Wait for the modal to open
    await expect(page.locator("dialog.modal-open")).toBeVisible({ timeout: 5000 })

    // Verify image section exists
    await expect(page.locator("dialog.modal-open").getByText("Attached Images")).toBeVisible()
    
    // Verify extracted text is shown
    const extractedTextLabel = page.locator("dialog.modal-open").getByText("Extracted text:")
    await expect(extractedTextLabel).toBeVisible()
    
    // Verify short text is displayed
    await expect(page.locator("dialog.modal-open").getByText("Short extracted text.")).toBeVisible()
    
    // Verify NO "Show more" button exists for short text
    const showMoreButtons = page.locator("dialog.modal-open").getByRole("button", { name: /Show more/ })
    await expect(showMoreButtons).toHaveCount(0)

    // Take a screenshot
    await expect(page).toHaveScreenshot("notes-with-short-transcript.png")
  })
})
