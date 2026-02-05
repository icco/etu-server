import type { Metadata } from "next"
import { Suspense } from "react"
import { getNotes, getRandomNotes, getTags } from "@/lib/actions/notes"
import { NotesView } from "./notes-view"

export const metadata: Metadata = {
  title: "Notes | Etu",
}

export default async function NotesPage() {
  const [randomNotes, recentNotesData, tags] = await Promise.all([
    getRandomNotes({ count: 6 }),
    getNotes({ limit: 1 }),
    getTags(),
  ])

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <NotesView 
        initialRandomNotes={randomNotes} 
        initialRecentNote={recentNotesData.notes[0]} 
        initialTags={tags} 
      />
    </Suspense>
  )
}
