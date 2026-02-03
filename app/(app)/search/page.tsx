import type { Metadata } from "next"
import { Suspense } from "react"
import { searchNotes, getTags } from "@/lib/actions/notes"
import { SearchView } from "./search-view"

export const metadata: Metadata = {
  title: "Search | Etu",
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams
  const query = params.q?.trim() || ""

  const [notesData, tags] = await Promise.all([
    query ? searchNotes({ query, limit: 50 }) : Promise.resolve({ notes: [], total: 0 }),
    getTags(),
  ])

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SearchView
        initialNotes={notesData.notes}
        initialTags={tags}
        query={query}
      />
    </Suspense>
  )
}
