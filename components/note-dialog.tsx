"use client"

import { useState, useEffect, useRef } from "react"
import { marked } from "marked"
import DOMPurify from "dompurify"
import { X } from "@phosphor-icons/react"

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

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="relative bg-card border border-border rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("write")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "write"
                ? "text-foreground border-b-2 border-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Write
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "preview"
                ? "text-foreground border-b-2 border-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
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
              className="w-full h-[300px] p-3 border border-input rounded-md bg-background font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          ) : (
            <div className="min-h-[300px] p-4 border border-border rounded-md bg-muted/30">
              {content ? (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(marked.parse(content) as string),
                  }}
                />
              ) : (
                <p className="text-muted-foreground italic">Nothing to preview yet...</p>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="p-4 border-t border-border space-y-3">
          <label className="block text-sm font-medium">Tags</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
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
                className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-10 max-h-40 overflow-auto">
                  {filteredSuggestions.slice(0, 5).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => addTag(tag)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => addTag()}
              className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-md transition-colors"
            >
              Add
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-sm"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="p-0.5 hover:bg-background/50 rounded-full"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-border">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!content.trim() || isSaving}
            className="bg-accent text-accent-foreground hover:bg-accent/90 px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Blip"}
          </button>
        </div>
      </div>
    </div>
  )
}
