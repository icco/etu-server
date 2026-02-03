import type { Metadata } from "next"
import { getTags } from "@/lib/actions/notes"
import { TagsView } from "./tags-view"

export const metadata: Metadata = {
  title: "Tags | Etu",
}

export default async function TagsPage() {
  const tags = await getTags()

  return <TagsView tags={tags} />
}
