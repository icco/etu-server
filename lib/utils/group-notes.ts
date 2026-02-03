import type { Note } from "@/lib/types"

export function groupNotesByDate(notes: Note[]): Map<string, Note[]> {
  const grouped = new Map<string, Note[]>()
  notes.forEach((note) => {
    const d = new Date(note.createdAt)
    const dateKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`
    if (!grouped.has(dateKey)) grouped.set(dateKey, [])
    grouped.get(dateKey)!.push(note)
  })
  return grouped
}
