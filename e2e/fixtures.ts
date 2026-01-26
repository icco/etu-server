import { test as base } from "@playwright/test"
import type { Page } from "@playwright/test"

// Mock data for tests
export const mockNotes = [
  {
    id: "note-1",
    content: "This is my first thought about **building** something great.\n\nIt has multiple paragraphs.",
    tags: ["ideas", "projects"],
    createdAt: new Date("2026-01-25T10:00:00Z"),
    updatedAt: new Date("2026-01-25T10:00:00Z"),
  },
  {
    id: "note-2",
    content: "Meeting notes from today:\n- Discussed roadmap\n- Aligned on priorities",
    tags: ["work", "meetings"],
    createdAt: new Date("2026-01-24T14:30:00Z"),
    updatedAt: new Date("2026-01-24T14:30:00Z"),
  },
  {
    id: "note-3",
    content: "Remember to call mom on Sunday",
    tags: ["personal", "reminders"],
    createdAt: new Date("2026-01-23T09:15:00Z"),
    updatedAt: new Date("2026-01-23T09:15:00Z"),
  },
]

export const mockUser = {
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
}

// Extended test fixture with API mocking
export const test = base.extend<{
  mockApi: (page: Page) => Promise<void>
}>({
  mockApi: async ({}, use) => {
    const setupMocks = async (page: Page) => {
      // Mock the gRPC/Connect API endpoints
      await page.route("**/etu.v1.EtuService/**", async (route) => {
        const url = route.request().url()

        if (url.includes("ListNotes")) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              notes: mockNotes.map(n => ({
                ...n,
                createdAt: n.createdAt.toISOString(),
                updatedAt: n.updatedAt.toISOString(),
              })),
            }),
          })
        } else if (url.includes("GetNote")) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ note: mockNotes[0] }),
          })
        } else if (url.includes("CreateNote")) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              note: {
                id: "new-note",
                content: "New note content",
                tags: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            }),
          })
        } else {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({}),
          })
        }
      })

      // Mock auth session check
      await page.route("**/api/auth/session", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            user: mockUser,
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          }),
        })
      })
    }

    await use(setupMocks)
  },
})

export { expect } from "@playwright/test"
