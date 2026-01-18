import { Suspense } from "react"
import { getNotes, getTags } from "@/lib/actions/notes"
import { NotesView } from "./notes-view"

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; tags?: string; from?: string; to?: string }>
}) {
  const params = await searchParams
  
  const [notesData, tags] = await Promise.all([
    getNotes({
      search: params.search,
      tags: params.tags?.split(",").filter(Boolean),
      startDate: params.from ? new Date(params.from) : undefined,
      endDate: params.to ? new Date(params.to) : undefined,
    }),
    getTags(),
  ])

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <NotesView 
        initialNotes={notesData.notes} 
        initialTags={tags}
        searchParams={params}
      />
    </Suspense>
  )
}
