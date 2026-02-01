"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  KeyIcon,
  ChartBarIcon,
  UserIcon,
  CreditCardIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  TagIcon,
  PencilIcon,
} from "@heroicons/react/24/outline"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { UserMenu } from "@/components/user-menu"
import { toast } from "sonner"
import { createApiKey, deleteApiKey } from "@/lib/actions/api-keys"
import { updateName, updateImage, updateNotionKey, changePassword } from "@/lib/actions/user"

interface SettingsViewProps {
  user: {
    id: string
    email: string | null
    name: string | null
    image: string | null
    subscriptionStatus: string
    subscriptionEnd: Date | null
    createdAt: Date
    updatedAt: Date | null
    hasNotionKey: boolean
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

  // Profile editing state
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState(user.name || "")
  const [isUpdatingName, setIsUpdatingName] = useState(false)

  // Image editing state
  const [isEditingImage, setIsEditingImage] = useState(false)
  const [editImage, setEditImage] = useState(user.image || "")
  const [isUpdatingImage, setIsUpdatingImage] = useState(false)

  // Notion key editing state
  const [isEditingNotionKey, setIsEditingNotionKey] = useState(false)
  const [editNotionKey, setEditNotionKey] = useState("")
  const [isUpdatingNotionKey, setIsUpdatingNotionKey] = useState(false)

  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

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

  const handleUpdateName = async () => {
    if (!editName.trim()) {
      toast.error("Name is required")
      return
    }

    setIsUpdatingName(true)
    try {
      const formData = new FormData()
      formData.set("name", editName.trim())
      const result = await updateName(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Name updated")
        setIsEditingName(false)
        router.refresh()
      }
    } catch {
      toast.error("Failed to update name")
    } finally {
      setIsUpdatingName(false)
    }
  }

  const handleCancelEditName = () => {
    setEditName(user.name || "")
    setIsEditingName(false)
  }

  const handleUpdateImage = async () => {
    setIsUpdatingImage(true)
    try {
      const formData = new FormData()
      formData.set("image", editImage.trim())
      const result = await updateImage(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Profile image updated")
        setIsEditingImage(false)
        router.refresh()
      }
    } catch {
      toast.error("Failed to update profile image")
    } finally {
      setIsUpdatingImage(false)
    }
  }

  const handleCancelEditImage = () => {
    setEditImage(user.image || "")
    setIsEditingImage(false)
  }

  const handleChangePassword = async () => {
    if (!newPassword) {
      toast.error("Password is required")
      return
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match")
      return
    }

    setIsUpdatingPassword(true)
    try {
      const formData = new FormData()
      formData.set("password", newPassword)
      const result = await changePassword(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Password changed successfully")
        setIsChangingPassword(false)
        setNewPassword("")
        setConfirmPassword("")
      }
    } catch {
      toast.error("Failed to change password")
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false)
    setNewPassword("")
    setConfirmPassword("")
  }

  const handleUpdateNotionKey = async () => {
    setIsUpdatingNotionKey(true)
    try {
      const formData = new FormData()
      formData.set("notionKey", editNotionKey.trim())
      const result = await updateNotionKey(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Notion key updated")
        setIsEditingNotionKey(false)
        router.refresh()
      }
    } catch {
      toast.error("Failed to update Notion key")
    } finally {
      setIsUpdatingNotionKey(false)
    }
  }

  const handleCancelEditNotionKey = () => {
    setEditNotionKey("")
    setIsEditingNotionKey(false)
  }

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <Header backHref="/notes" logoHref="/notes">
        <UserMenu />
      </Header>

      <main className="flex-1 container mx-auto px-4 md:px-6 py-8 max-w-4xl">
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
          <div className="space-y-6">
            {/* Profile Information Card */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Profile Information</h2>
                <div className="space-y-4">
                  {/* Name Field (editable) */}
                  <div>
                    <label className="text-sm text-base-content/60">Name</label>
                    {isEditingName ? (
                      <div className="flex gap-2 mt-1">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleUpdateName()
                            if (e.key === "Escape") handleCancelEditName()
                          }}
                          className="input input-bordered flex-1 bg-base-100 text-base-content"
                          placeholder="Enter your name"
                          autoFocus
                        />
                        <button
                          onClick={handleUpdateName}
                          disabled={isUpdatingName}
                          className="btn btn-primary btn-sm"
                        >
                          {isUpdatingName ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            <CheckIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={handleCancelEditName}
                          disabled={isUpdatingName}
                          className="btn btn-ghost btn-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="py-2">{user.name || "Not set"}</p>
                        <button
                          onClick={() => setIsEditingName(true)}
                          className="btn btn-ghost btn-sm gap-2"
                        >
                          <PencilIcon className="h-4 w-4" />
                          Edit
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Email Field (read-only) */}
                  <div>
                    <label className="text-sm text-base-content/60">Email</label>
                    <p className="py-2">{user.email}</p>
                  </div>

                  {/* Profile Image Field (editable) */}
                  <div>
                    <label className="text-sm text-base-content/60">Profile Image</label>
                    {isEditingImage ? (
                      <div className="flex gap-2 mt-1">
                        <input
                          type="url"
                          value={editImage}
                          onChange={(e) => setEditImage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleUpdateImage()
                            if (e.key === "Escape") handleCancelEditImage()
                          }}
                          className="input input-bordered flex-1 bg-base-100 text-base-content"
                          placeholder="Enter image URL"
                          autoFocus
                        />
                        <button
                          onClick={handleUpdateImage}
                          disabled={isUpdatingImage}
                          className="btn btn-primary btn-sm"
                        >
                          {isUpdatingImage ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            <CheckIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={handleCancelEditImage}
                          disabled={isUpdatingImage}
                          className="btn btn-ghost btn-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="py-2">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt="Profile"
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-base-content/60">Not set</span>
                          )}
                        </div>
                        <button
                          onClick={() => setIsEditingImage(true)}
                          className="btn btn-ghost btn-sm gap-2"
                        >
                          <PencilIcon className="h-4 w-4" />
                          Edit
                        </button>
                      </div>
                    )}
                  </div>

                  {/* User ID Field (read-only) */}
                  <div>
                    <label className="text-sm text-base-content/60">User ID</label>
                    <p className="font-mono text-sm py-2">{user.id}</p>
                  </div>

                  {/* Account Created Field (read-only) */}
                  <div>
                    <label className="text-sm text-base-content/60">Account Created</label>
                    <p className="py-2" suppressHydrationWarning>
                      {format(new Date(user.createdAt), "MMMM d, yyyy")}
                    </p>
                  </div>

                  {/* Last Updated Field (read-only) */}
                  {user.updatedAt && (
                    <div>
                      <label className="text-sm text-base-content/60">Last Updated</label>
                      <p className="py-2" suppressHydrationWarning>
                        {format(new Date(user.updatedAt), "MMMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Integrations Card */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title gap-2">
                  <KeyIcon className="h-5 w-5" />
                  Integrations
                </h2>

                {/* Notion Integration */}
                <div>
                  <label className="text-sm text-base-content/60">Notion API Key</label>
                  <p className="text-xs text-base-content/50 mb-2">
                    Connect your Notion workspace to sync notes
                  </p>
                  {isEditingNotionKey ? (
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={editNotionKey}
                        onChange={(e) => setEditNotionKey(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdateNotionKey()
                          if (e.key === "Escape") handleCancelEditNotionKey()
                        }}
                        className="input input-bordered flex-1 bg-base-100 text-base-content"
                        placeholder="Enter your Notion API key"
                        autoFocus
                      />
                      <button
                        onClick={handleUpdateNotionKey}
                        disabled={isUpdatingNotionKey}
                        className="btn btn-primary btn-sm"
                      >
                        {isUpdatingNotionKey ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          <CheckIcon className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={handleCancelEditNotionKey}
                        disabled={isUpdatingNotionKey}
                        className="btn btn-ghost btn-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="py-2 font-mono text-sm">
                        {user.hasNotionKey ? "••••••••••••" : "Not configured"}
                      </p>
                      <button
                        onClick={() => setIsEditingNotionKey(true)}
                        className="btn btn-ghost btn-sm gap-2"
                      >
                        <PencilIcon className="h-4 w-4" />
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Security Card */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Security</h2>

                {isChangingPassword ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="input input-bordered w-full bg-base-100 text-base-content mt-1"
                        placeholder="Enter new password (min. 8 characters)"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleChangePassword()}
                        className="input input-bordered w-full bg-base-100 text-base-content mt-1"
                        placeholder="Confirm new password"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleChangePassword}
                        disabled={isUpdatingPassword}
                        className="btn btn-primary gap-2"
                      >
                        {isUpdatingPassword ? (
                          <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                          <CheckIcon className="h-5 w-5" />
                        )}
                        Update Password
                      </button>
                      <button
                        onClick={handleCancelPasswordChange}
                        disabled={isUpdatingPassword}
                        className="btn btn-ghost"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-base-content/60 mb-4">
                      Change your account password.
                    </p>
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="btn btn-ghost gap-2"
                    >
                      Change Password
                    </button>
                  </div>
                )}
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
        )}

        {/* Subscription Tab */}
        {activeTab === "subscription" && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Subscription</h2>
              <div className="flex items-center gap-4">
                <span
                  className={`badge ${user.subscriptionStatus === "active"
                    ? "badge-success"
                    : user.subscriptionStatus === "trial"
                      ? "bg-warning text-black"
                      : "badge-ghost"
                    }`}
                >
                  {user.subscriptionStatus.charAt(0).toUpperCase() + user.subscriptionStatus.slice(1)}
                </span>
                {user.subscriptionEnd && (
                  <span className="text-sm text-base-content/60" suppressHydrationWarning>
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
        )}
      </main>

      <Footer />
    </div>
  )
}
