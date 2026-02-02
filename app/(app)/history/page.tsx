import { Suspense } from "react"
import { getNotes, getTags } from "@/lib/actions/notes"
import { HistoryView } from "./history-view"

export default async function HistoryPage() {
  const [notesData, tags] = await Promise.all([
    getNotes({ limit: 10, offset: 0 }),
    getTags(),
  ])

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <HistoryView
        initialNotes={notesData.notes}
        initialTotal={notesData.total}
        initialTags={tags}
      />
    </Suspense>
  )
}
