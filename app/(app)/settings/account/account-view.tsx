"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  KeyIcon,
  CheckIcon,
  PencilIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline"
import { toast } from "sonner"
import { updateName, updateImage, updateNotionKey, changePassword } from "@/lib/actions/user"
import { exportAllNotes } from "@/lib/actions/notes"

interface AccountViewProps {
  user: {
    id: string
    email: string | null
    name: string | null
    image: string | null
    createdAt: Date
    updatedAt: Date | null
    hasNotionKey: boolean
  }
}

export function AccountView({ user }: AccountViewProps) {
  const router = useRouter()

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

  // Export state
  const [isExporting, setIsExporting] = useState(false)

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

  const handleExportNotes = async () => {
    setIsExporting(true)
    try {
      const exportData = await exportAllNotes()
      
      // Create a blob from the JSON data
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      })
      
      // Create a download link and trigger download
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `etu-notes-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success(`Exported ${exportData.totalNotes} notes successfully`)
    } catch {
      toast.error("Failed to export notes")
    } finally {
      setIsExporting(false)
    }
  }

  return (
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

      {/* Export Data Card */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title gap-2">
            <ArrowDownTrayIcon className="h-5 w-5" />
            Export Data
          </h2>
          <div>
            <p className="text-sm text-base-content/60 mb-4">
              Download all your notes as a JSON file. This includes note content, tags, dates, and image metadata.
            </p>
            <button
              onClick={handleExportNotes}
              disabled={isExporting}
              className="btn btn-primary gap-2"
            >
              {isExporting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Exporting...
                </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  Export All Notes as JSON
                </>
              )}
            </button>
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
  )
}
