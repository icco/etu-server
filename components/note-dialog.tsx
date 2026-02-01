"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { marked } from "marked"
import DOMPurify from "dompurify"
import { XMarkIcon, PhotoIcon } from "@heroicons/react/24/outline"
import type { NoteImage as GrpcNoteImage } from "@/lib/grpc/client"

// Pick only the fields this component uses
type NoteImage = Pick<GrpcNoteImage, "id" | "url" | "mimeType">

interface PendingImage {
  id: string
  data: string // base64
  mimeType: string
  previewUrl: string
}

interface NoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (
    content: string,
    tags: string[],
    newImages: { data: string; mimeType: string }[]
  ) => Promise<void>
  initialContent?: string
  initialTags?: string[]
  initialImages?: NoteImage[]
  existingTags?: string[]
  title?: string
}

export function NoteDialog({
  open,
  onOpenChange,
  onSave,
  initialContent = "",
  initialTags = [],
  initialImages = [],
  existingTags = [],
  title = "New Blip",
}: NoteDialogProps) {
  const [content, setContent] = useState(initialContent)
  const [tags, setTags] = useState<string[]>(initialTags)
  const [tagInput, setTagInput] = useState("")
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write")
  const [isSaving, setIsSaving] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Track preview URLs for cleanup to avoid memory leaks
  const previewUrlsRef = useRef<Set<string>>(new Set())

  // Only reset form when dialog opens, not on every render
  const prevOpenRef = useRef(false)
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      // Dialog just opened
      setContent(initialContent)
      setTags(initialTags)
      setTagInput("")
      setActiveTab("write")
      // Revoke any existing preview object URLs before clearing pending images
      previewUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url)
      })
      previewUrlsRef.current.clear()
      // Revoke any existing preview object URLs before clearing pending images
      previewUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url)
      })
      previewUrlsRef.current.clear()
      setPendingImages([])
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
    prevOpenRef.current = open
  }, [open, initialContent, initialTags])

  const filteredSuggestions = existingTags.filter(
    (t) => t.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(t)
  )

  // Memoize markdown parsing to only run when preview tab is active
  // This prevents expensive parsing on every keystroke while typing
  const parsedContent = useMemo(() => {
    if (activeTab !== "preview" || !content) return ""
    return DOMPurify.sanitize(marked.parse(content) as string)
  }, [content, activeTab])

  const handleSave = async () => {
    if (!content.trim()) return

    setIsSaving(true)
    try {
      const newImages = pendingImages.map((img) => ({
        data: img.data,
        mimeType: img.mimeType,
      }))
      await onSave(content.trim(), tags, newImages)
      setContent("")
      setTags([])
      // Revoke all preview URLs before clearing pending images
      previewUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url)
      })
      previewUrlsRef.current.clear()
      setPendingImages([])
    } finally {
      setIsSaving(false)
    }
  }

  // Image upload constraints (aligned with Next server action bodySizeLimit: '10mb')
  const MAX_IMAGE_COUNT = 10
  const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MiB per image
  const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"]

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newImages: PendingImage[] = []
    for (const file of Array.from(files)) {
      // Validate MIME type
      if (!ALLOWED_MIME_TYPES.includes(file.type)) continue

      // Validate file size
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        console.warn(`Skipping file "${file.name}": exceeds ${MAX_IMAGE_SIZE_BYTES / 1024 / 1024}MB limit`)
        continue
      }

      // Check total image count limit
      if (pendingImages.length + newImages.length >= MAX_IMAGE_COUNT) {
        console.warn(`Maximum of ${MAX_IMAGE_COUNT} images allowed`)
        break
      }

      const base64 = await fileToBase64(file)
      const previewUrl = URL.createObjectURL(file)
      // Track URL for cleanup
      previewUrlsRef.current.add(previewUrl)
      newImages.push({
        id: `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        data: base64,
        mimeType: file.type,
        previewUrl,
      })
    }

    setPendingImages((prev) => [...prev, ...newImages])
    // Reset file input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removePendingImage = (id: string) => {
    setPendingImages((prev) => {
      const img = prev.find((i) => i.id === id)
      if (img) {
        URL.revokeObjectURL(img.previewUrl)
        previewUrlsRef.current.delete(img.previewUrl)
      }
      return prev.filter((i) => i.id !== id)
    })
  }

  // Cleanup all tracked preview URLs on unmount
  useEffect(() => {
    const urlsRef = previewUrlsRef.current
    return () => {
      urlsRef.forEach((url) => URL.revokeObjectURL(url))
      urlsRef.clear()
    }
  }, [])

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Remove data URL prefix to get just the base64
        const base64 = result.split(",")[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault()
      handleSave()
    }
  }

  const addTag = (tag?: string) => {
    const newTag = (tag || tagInput).trim()
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag])
      setTagInput("")
      setShowSuggestions(false)
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  return (
    <dialog className={`modal ${open ? "modal-open" : ""}`}>
      <div className="modal-box w-full h-full max-w-none max-h-none md:w-11/12 md:max-w-3xl md:h-auto md:max-h-[90vh] md:rounded-2xl rounded-none flex flex-col p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={() => onOpenChange(false)} className="btn btn-ghost btn-sm btn-circle">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div role="tablist" className="tabs tabs-bordered">
          <button
            role="tab"
            onClick={() => setActiveTab("write")}
            className={`tab ${activeTab === "write" ? "tab-active" : ""}`}
          >
            Write
          </button>
          <button
            role="tab"
            onClick={() => setActiveTab("preview")}
            className={`tab ${activeTab === "preview" ? "tab-active" : ""}`}
          >
            Preview
          </button>
        </div>

        {/* Scrollable content area - contains editor, images, and tags */}
        <div className="flex-1 overflow-auto min-h-0 flex flex-col">
          {/* Content - fills available space on mobile */}
          <div className="p-4 flex-1 md:flex-none flex flex-col min-h-0">
            {activeTab === "write" ? (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write your thoughts in Markdown... (Cmd+Enter to save)"
                className="textarea textarea-bordered w-full flex-1 min-h-[150px] md:min-h-[300px] md:flex-none md:h-[300px] font-mono text-sm resize-none md:resize-y bg-base-100 text-base-content placeholder:text-base-content/50"
              />
            ) : (
              <div className="flex-1 min-h-[150px] md:flex-none p-4 bg-base-200 rounded-lg overflow-auto">
                {parsedContent ? (
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: parsedContent,
                    }}
                  />
                ) : (
                  <p className="text-base-content/60 italic">Nothing to preview yet...</p>
                )}
              </div>
            )}
          </div>

          {/* Images */}
          <div className="px-4 pb-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">Images</label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-ghost btn-sm gap-1"
              >
                <PhotoIcon className="h-4 w-4" />
                Add Image
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Existing images (read-only when editing) */}
            {initialImages.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs text-base-content/60">Existing images</span>
                <div className="flex flex-wrap gap-2">
                  {initialImages.map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.url}
                        alt=""
                        className="h-16 w-16 md:h-20 md:w-20 object-cover rounded-lg border border-base-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending images (new uploads) */}
            {pendingImages.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs text-base-content/60">New images to upload</span>
                <div className="flex flex-wrap gap-2">
                  {pendingImages.map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.previewUrl}
                        alt=""
                        className="h-16 w-16 md:h-20 md:w-20 object-cover rounded-lg border border-base-300"
                      />
                      <button
                        type="button"
                        onClick={() => removePendingImage(img.id)}
                        className="absolute -top-2 -right-2 btn btn-circle btn-xs btn-error"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="px-4 pb-4 space-y-3">
            <label className="block text-sm font-medium">Tags</label>
            <div className="flex gap-2">
              <div className="dropdown dropdown-top flex-1">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => {
                    setTagInput(e.target.value)
                    setShowSuggestions(e.target.value.length > 0)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  onFocus={() => tagInput && setShowSuggestions(true)}
                  placeholder="Add a tag..."
                  className="input input-bordered w-full bg-base-100 text-base-content placeholder:text-base-content/50"
                />
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <ul className="dropdown-content menu bg-base-100 rounded-box z-10 w-full p-2 shadow-lg max-h-40 overflow-auto">
                    {filteredSuggestions.slice(0, 5).map((tag) => (
                      <li key={tag}>
                        <button onClick={() => addTag(tag)}>{tag}</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button onClick={() => addTag()} className="btn btn-ghost">
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <div key={tag} className="badge badge-lg gap-1">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="btn btn-ghost btn-xs btn-circle">
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-action px-4 pb-4">
          <button onClick={() => onOpenChange(false)} className="btn btn-ghost">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!content.trim() || isSaving}
            className="btn btn-primary"
          >
            {isSaving && <span className="loading loading-spinner loading-sm"></span>}
            {isSaving ? "Saving..." : "Save Blip"}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={() => onOpenChange(false)}>close</button>
      </form>
    </dialog>
  )
}
