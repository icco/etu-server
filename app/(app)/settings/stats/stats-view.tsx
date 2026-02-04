"use client"

import { format } from "date-fns"
import {
  ChartBarIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  TagIcon,
} from "@heroicons/react/24/outline"
import { toast } from "sonner"

interface StatsViewProps {
  stats: {
    totalNotes: number
    totalTags: number
    totalWords: number
    firstNoteDate: Date | null
  }
}

export function StatsView({ stats }: StatsViewProps) {
  const handleExportJSON = async () => {
    // This would need a server action to get all notes
    toast.info("Export functionality coming soon")
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title gap-2">
          <ChartBarIcon className="h-5 w-5" />
          Usage Statistics
        </h2>

        <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
          <div className="stat">
            <div className="stat-figure text-primary">
              <DocumentTextIcon className="h-6 w-6" />
            </div>
            <div className="stat-title">Total Blips</div>
            <div className="stat-value">{stats.totalNotes}</div>
          </div>
          <div className="stat">
            <div className="stat-figure text-primary">
              <TagIcon className="h-6 w-6" />
            </div>
            <div className="stat-title">Unique Tags</div>
            <div className="stat-value">{stats.totalTags}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Words Written</div>
            <div className="stat-value text-2xl">{stats.totalWords.toLocaleString()}</div>
          </div>
          <div className="stat">
            <div className="stat-title">First Blip</div>
            <div className="stat-value text-2xl" suppressHydrationWarning>
              {stats.firstNoteDate
                ? format(new Date(stats.firstNoteDate), "MMM yyyy")
                : "—"}
            </div>
          </div>
        </div>

        <div className="divider"></div>

        <div>
          <h3 className="text-sm font-medium mb-3">Export Your Data</h3>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleExportJSON} className="btn btn-ghost gap-2">
              <ArrowDownTrayIcon className="h-4 w-4" />
              Export as JSON
            </button>
          </div>
          <p className="text-xs text-base-content/60 mt-2">
            Your data belongs to you. Export anytime.
          </p>
        </div>
      </div>
    </div>
  )
}
