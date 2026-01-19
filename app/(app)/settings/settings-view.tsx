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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center gap-4">
          <Link href="/notes" className="p-2 hover:bg-muted rounded-md transition-colors">
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-8 max-w-4xl">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: "account", label: "Account", icon: UserIcon },
            { id: "stats", label: "Stats", icon: ChartBarIcon },
            { id: "subscription", label: "Subscription", icon: CreditCardIcon },
            { id: "api", label: "API Keys", icon: KeyIcon },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap ${
                activeTab === id
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Account Tab */}
        {activeTab === "account" && (
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">Account Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground">Email</label>
                <p className="text-foreground">{user.email}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Account Created</label>
                <p className="text-foreground">{format(new Date(user.createdAt), "MMMM d, yyyy")}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <ChartBarIcon className="h-5 w-5" />
                Usage Statistics
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <PencilSquareIcon className="h-6 w-6 text-accent mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.totalNotes}</div>
                  <div className="text-sm text-muted-foreground">Total Blips</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <TagIcon className="h-6 w-6 text-accent mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.totalTags}</div>
                  <div className="text-sm text-muted-foreground">Unique Tags</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{stats.totalWords.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Words Written</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">
                    {stats.firstNoteDate
                      ? format(new Date(stats.firstNoteDate), "MMM yyyy")
                      : "—"}
                  </div>
                  <div className="text-sm text-muted-foreground">First Blip</div>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-medium mb-3">Export Your Data</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleExportJSON}
                    className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    Export as JSON
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Your data belongs to you. Export anytime.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Tab */}
        {activeTab === "subscription" && (
          <div className="bg-card border border-border rounded-lg p-6 space-y-6">
            <h2 className="text-lg font-semibold">Subscription</h2>
            <div className="flex items-center gap-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.subscriptionStatus === "active"
                    ? "bg-secondary text-secondary-foreground"
                    : user.subscriptionStatus === "trial"
                    ? "bg-accent/20 text-accent-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {user.subscriptionStatus.charAt(0).toUpperCase() + user.subscriptionStatus.slice(1)}
              </span>
              {user.subscriptionEnd && (
                <span className="text-sm text-muted-foreground">
                  {user.subscriptionStatus === "active" ? "Renews" : "Ends"}{" "}
                  {format(new Date(user.subscriptionEnd), "MMMM d, yyyy")}
                </span>
              )}
            </div>

            <div className="border-t border-border pt-6">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold">$5</span>
                <span className="text-muted-foreground">/ year</span>
              </div>
              <button className="flex items-center gap-2 w-full justify-center px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors">
                <CreditCardIcon className="h-5 w-5" />
                Manage Subscription
              </button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Powered by Stripe
              </p>
            </div>
          </div>
        )}

        {/* API Keys Tab */}
        {activeTab === "api" && (
          <div className="bg-card border border-border rounded-lg p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold">API Keys</h2>
              <p className="text-sm text-muted-foreground">
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
                  className="flex-1 px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  onClick={handleCreateKey}
                  disabled={isCreating}
                  className="flex items-center gap-2 bg-accent text-accent-foreground hover:bg-accent/90 px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                >
                  <KeyIcon className="h-4.5 w-4.5" />
                  Generate
                </button>
              </div>
            </div>

            {newlyCreatedKey && (
              <div className="bg-accent/10 border-2 border-accent rounded-lg p-4 space-y-2">
                <p className="text-sm font-semibold text-accent-foreground">
                  Save this key! It won&apos;t be shown again.
                </p>
                <div className="flex items-center gap-2 bg-background rounded p-2 font-mono text-sm break-all">
                  <code className="flex-1">{newlyCreatedKey}</code>
                  <button
                    onClick={() => handleCopyKey(newlyCreatedKey)}
                    className="p-1 hover:bg-muted rounded"
                  >
                    {copiedKey === newlyCreatedKey ? (
                      <CheckIcon className="h-4 w-4 text-secondary" />
                    ) : (
                      <DocumentDuplicateIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="border-t border-border pt-4">
              {apiKeys.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No API keys yet. Create one to get started.
                </p>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Active Keys</label>
                  {apiKeys.map((key) => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">{key.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {key.keyPrefix}... • Created{" "}
                          {format(new Date(key.createdAt), "MMM d, yyyy")}
                          {key.lastUsed &&
                            ` • Last used ${format(new Date(key.lastUsed), "MMM d")}`}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteKey(key.id)}
                        className="p-2 text-destructive hover:bg-muted rounded transition-colors"
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
