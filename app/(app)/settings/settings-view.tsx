"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  ArrowLeftIcon,
  KeyIcon,
  ChartBarIcon,
  UserIcon,
  CreditCardIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  PencilSquareIcon,
  TagIcon,
} from "@heroicons/react/24/outline"
import { toast } from "sonner"
import { createApiKey, deleteApiKey } from "@/lib/actions/api-keys"

interface SettingsViewProps {
  user: {
    id: string
    email: string | null
    name: string | null
    subscriptionStatus: string
    subscriptionEnd: Date | null
    createdAt: Date
  }
  stats: {
    totalNotes: number
    totalTags: number
    totalWords: number
    firstNoteDate: Date | null
  }
  initialApiKeys: {
    id: string
    name: string
    keyPrefix: string
    createdAt: Date
    lastUsed: Date | null
  }[]
}

export function SettingsView({ user, stats, initialApiKeys }: SettingsViewProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"account" | "stats" | "subscription" | "api">("account")
  const [apiKeys, setApiKeys] = useState(initialApiKeys)
  const [newKeyName, setNewKeyName] = useState("")
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for the API key")
      return
    }

    setIsCreating(true)
    try {
      const result = await createApiKey(newKeyName.trim())
      setNewlyCreatedKey(result.key)
      setNewKeyName("")
      router.refresh()
      toast.success("API key created")
    } catch {
      toast.error("Failed to create API key")
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteKey = async (id: string) => {
    try {
      await deleteApiKey(id)
      setApiKeys((keys) => keys.filter((k) => k.id !== id))
      toast.success("API key revoked")
    } catch {
      toast.error("Failed to revoke API key")
    }
  }

  const handleCopyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key)
      setCopiedKey(key)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopiedKey(null), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }

  const handleExportJSON = async () => {
    // This would need a server action to get all notes
    toast.info("Export functionality coming soon")
  }

  return (
    <div className="min-h-screen bg-base-200">
      <header className="navbar bg-base-100 shadow-sm sticky top-0 z-50">
        <div className="navbar-start">
          <Link href="/notes" className="btn btn-ghost btn-square">
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <span className="text-xl font-bold">Settings</span>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-8 max-w-4xl">
        {/* Tabs */}
        <div role="tablist" className="tabs tabs-boxed mb-8">
          {[
            { id: "account", label: "Account", icon: UserIcon },
            { id: "stats", label: "Stats", icon: ChartBarIcon },
            { id: "subscription", label: "Subscription", icon: CreditCardIcon },
            { id: "api", label: "API Keys", icon: KeyIcon },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={`tab gap-2 ${activeTab === id ? "tab-active" : ""}`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>

        {/* Account Tab */}
        {activeTab === "account" && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Account Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-base-content/60">Email</label>
                  <p>{user.email}</p>
                </div>
                <div>
                  <label className="text-sm text-base-content/60">Account Created</label>
                  <p>{format(new Date(user.createdAt), "MMMM d, yyyy")}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === "stats" && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title gap-2">
                <ChartBarIcon className="h-5 w-5" />
                Usage Statistics
              </h2>

              <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
                <div className="stat">
                  <div className="stat-figure text-primary">
                    <PencilSquareIcon className="h-6 w-6" />
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
                  <div className="stat-value text-2xl">
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
        )}

        {/* Subscription Tab */}
        {activeTab === "subscription" && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Subscription</h2>
              <div className="flex items-center gap-4">
                <span
                  className={`badge ${
                    user.subscriptionStatus === "active"
                      ? "badge-success"
                      : user.subscriptionStatus === "trial"
                      ? "badge-warning"
                      : "badge-ghost"
                  }`}
                >
                  {user.subscriptionStatus.charAt(0).toUpperCase() + user.subscriptionStatus.slice(1)}
                </span>
                {user.subscriptionEnd && (
                  <span className="text-sm text-base-content/60">
                    {user.subscriptionStatus === "active" ? "Renews" : "Ends"}{" "}
                    {format(new Date(user.subscriptionEnd), "MMMM d, yyyy")}
                  </span>
                )}
              </div>

              <div className="divider"></div>

              <div>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold">$5</span>
                  <span className="text-base-content/60">/ year</span>
                </div>
                <button className="btn btn-ghost w-full gap-2">
                  <CreditCardIcon className="h-5 w-5" />
                  Manage Subscription
                </button>
                <p className="text-xs text-base-content/60 text-center mt-2">
                  Powered by Stripe
                </p>
              </div>
            </div>
          </div>
        )}

        {/* API Keys Tab */}
        {activeTab === "api" && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div>
                <h2 className="card-title">API Keys</h2>
                <p className="text-sm text-base-content/60">
                  Generate API keys for CLI and mobile access
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Create New API Key</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateKey()}
                    placeholder="e.g., My Laptop CLI"
                    className="input input-bordered flex-1"
                  />
                  <button
                    onClick={handleCreateKey}
                    disabled={isCreating}
                    className="btn btn-primary gap-2"
                  >
                    {isCreating ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      <KeyIcon className="h-4.5 w-4.5" />
                    )}
                    Generate
                  </button>
                </div>
              </div>

              {newlyCreatedKey && (
                <div className="alert alert-success">
                  <div className="flex flex-col gap-2 w-full">
                    <p className="text-sm font-semibold">
                      Save this key! It won&apos;t be shown again.
                    </p>
                    <div className="flex items-center gap-2 bg-base-100 rounded p-2 font-mono text-sm break-all">
                      <code className="flex-1">{newlyCreatedKey}</code>
                      <button
                        onClick={() => handleCopyKey(newlyCreatedKey)}
                        className="btn btn-ghost btn-sm btn-square"
                      >
                        {copiedKey === newlyCreatedKey ? (
                          <CheckIcon className="h-4 w-4 text-success" />
                        ) : (
                          <DocumentDuplicateIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="divider"></div>

              {apiKeys.length === 0 ? (
                <p className="text-sm text-base-content/60 text-center py-4">
                  No API keys yet. Create one to get started.
                </p>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Active Keys</label>
                  {apiKeys.map((key) => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">{key.name}</p>
                        <p className="text-xs text-base-content/60">
                          {key.keyPrefix}... • Created{" "}
                          {format(new Date(key.createdAt), "MMM d, yyyy")}
                          {key.lastUsed &&
                            ` • Last used ${format(new Date(key.lastUsed), "MMM d")}`}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteKey(key.id)}
                        className="btn btn-ghost btn-sm btn-square text-error"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
