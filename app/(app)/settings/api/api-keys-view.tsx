"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  KeyIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { toast } from "sonner"
import { createApiKey, deleteApiKey } from "@/lib/actions/api-keys"

interface ApiKeysViewProps {
  initialApiKeys: {
    id: string
    name: string
    keyPrefix: string
    createdAt: Date
    lastUsed: Date | null
  }[]
}

export function ApiKeysView({ initialApiKeys }: ApiKeysViewProps) {
  const router = useRouter()
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

  return (
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
              className="input input-bordered flex-1 bg-base-100 text-base-content placeholder:text-base-content/50"
            />
            <button
              onClick={handleCreateKey}
              disabled={isCreating}
              className="btn btn-primary gap-2"
            >
              {isCreating ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <KeyIcon className="h-5 w-5" />
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
                  <p className="text-xs text-base-content/60" suppressHydrationWarning>
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
  )
}
