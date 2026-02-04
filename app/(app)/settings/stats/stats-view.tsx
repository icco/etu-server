"use client"

import {
  ArrowDownTrayIcon,
  DocumentTextIcon,
  TagIcon,
  GlobeAltIcon,
  UserIcon,
} from "@heroicons/react/24/outline"
import { toast } from "sonner"

interface Stats {
  totalBlips: number
  uniqueTags: number
  wordsWritten: number
}

interface StatsViewProps {
  userStats: Stats
  globalStats: Stats
}

export function StatsView({ userStats, globalStats }: StatsViewProps) {
  const handleExportJSON = async () => {
    // This would need a server action to get all notes
    toast.info("Export functionality coming soon")
  }

  return (
    <div className="space-y-6">
      {/* User Stats */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title gap-2">
            <UserIcon className="h-5 w-5" />
            Your Statistics
          </h2>

          <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
            <div className="stat">
              <div className="stat-figure text-primary">
                <DocumentTextIcon className="h-6 w-6" />
              </div>
              <div className="stat-title">Your Blips</div>
              <div className="stat-value">{userStats.totalBlips.toLocaleString()}</div>
            </div>
            <div className="stat">
              <div className="stat-figure text-primary">
                <TagIcon className="h-6 w-6" />
              </div>
              <div className="stat-title">Your Tags</div>
              <div className="stat-value">{userStats.uniqueTags.toLocaleString()}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Words Written</div>
              <div className="stat-value text-2xl">{userStats.wordsWritten.toLocaleString()}</div>
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

      {/* Global Stats */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title gap-2">
            <GlobeAltIcon className="h-5 w-5" />
            Community Statistics
          </h2>

          <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
            <div className="stat">
              <div className="stat-figure text-secondary">
                <DocumentTextIcon className="h-6 w-6" />
              </div>
              <div className="stat-title">Total Blips</div>
              <div className="stat-value">{globalStats.totalBlips.toLocaleString()}</div>
            </div>
            <div className="stat">
              <div className="stat-figure text-secondary">
                <TagIcon className="h-6 w-6" />
              </div>
              <div className="stat-title">Total Tags</div>
              <div className="stat-value">{globalStats.uniqueTags.toLocaleString()}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Words Written</div>
              <div className="stat-value text-2xl">{globalStats.wordsWritten.toLocaleString()}</div>
            </div>
          </div>

          <p className="text-xs text-base-content/60 mt-4">
            Stats from all Etu users across the platform
          </p>
        </div>
      </div>
    </div>
  )
}
