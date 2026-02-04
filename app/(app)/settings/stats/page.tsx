import type { Metadata } from "next"
import { getStats } from "@/lib/actions/notes"
import { StatsView } from "./stats-view"

export const metadata: Metadata = {
  title: "Statistics | Etu",
}

export default async function StatsPage() {
  const stats = await getStats()

  return <StatsView stats={stats} />
}
