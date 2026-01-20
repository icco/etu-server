"use client"

import { useState, useEffect, useRef } from "react"
import { marked } from "marked"
import DOMPurify from "dompurify"
import { XMarkIcon } from "@heroicons/react/24/outline"

interface NoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (content: string, tags: string[]) => Promise<void>
  initialContent?: string
  initialTags?: string[]
  existingTags?: string[]
  title?: string
}

export function NoteDialog({
  open,
  onOpenChange,
  onSave,
  initialContent = "",
  initialTags = [],
  existingTags = [],
  title = "New Blip",
}: NoteDialogProps) {
  const [content, setContent] = useState(initialContent)
  const [tags, setTags] = useState<string[]>(initialTags)
  const [tagInput, setTagInput] = useState("")
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write")
  const [isSaving, setIsSaving] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open) {
      setContent(initialContent)
      setTags(initialTags)
      setTagInput("")
      setActiveTab("write")
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [open, initialContent, initialTags])

  const filteredSuggestions = existingTags.filter(
    (t) => t.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(t)
  )

  const handleSave = async () => {
    if (!content.trim()) return

    setIsSaving(true)
    try {
      await onSave(content.trim(), tags)
      setContent("")
      setTags([])
    } finally {
      setIsSaving(false)
    }
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
      <div className="modal-box w-11/12 max-w-3xl max-h-[90vh] flex flex-col p-0">
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

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {activeTab === "write" ? (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write your thoughts in Markdown... (Cmd+Enter to save)"
              className="textarea textarea-bordered w-full h-[300px] font-mono text-sm resize-none"
            />
          ) : (
            <div className="min-h-[300px] p-4 bg-base-200 rounded-lg">
              {content ? (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(marked.parse(content) as string),
                  }}
                />
              ) : (
                <p className="text-base-content/60 italic">Nothing to preview yet...</p>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="p-4 border-t border-base-300 space-y-3">
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
                className="input input-bordered w-full"
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
