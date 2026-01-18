"use client"

import { useState } from "react"
import { format } from "date-fns"
import { marked } from "marked"
import DOMPurify from "dompurify"
import { DotsThree, Pencil, Trash } from "@phosphor-icons/react"

interface Note {
  id: string
  content: string
  createdAt: Date
  updatedAt: Date
  tags: string[]
}

interface NoteCardProps {
  note: Note
  onEdit: (note: Note) => void
  onDelete: (id: string) => Promise<void>
  searchQuery?: string
}

export function NoteCard({ note, onEdit, onDelete, searchQuery }: NoteCardProps) {
  const [viewOpen, setViewOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const formatTime = (date: Date) => format(new Date(date), "h:mm a")
  const formatFullDate = (date: Date) => format(new Date(date), "EEEE, MMMM d, yyyy 'at' h:mm a")

  const getPreview = (content: string, maxLength = 200) => {
    const stripped = content
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .trim()

    return stripped.length <= maxLength ? stripped : stripped.substring(0, maxLength) + "..."
  }

  const highlightText = (text: string) => {
    if (!searchQuery) return text

    try {
      const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      const parts = text.split(new RegExp(`(${escaped})`, "gi"))
      return parts.map((part, i) =>
        part.toLowerCase() === searchQuery.toLowerCase() ? (
          <mark key={i}>{part}</mark>
        ) : (
          part
        )
      )
    } catch {
      return text
    }
  }

  const renderMarkdown = (content: string) => {
    return DOMPurify.sanitize(marked.parse(content) as string)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(note.id)
    } finally {
      setIsDeleting(false)
      setMenuOpen(false)
    }
  }

  return (
    <>
      <div
        className="bg-card border border-border rounded-lg p-4 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        onClick={() => setViewOpen(true)}
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <div className="text-sm text-muted-foreground mb-2">{formatTime(note.createdAt)}</div>
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-muted rounded-full text-xs text-foreground"
                  >
                    {highlightText(tag)}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setMenuOpen(!menuOpen)
              }}
              className="p-1 opacity-0 group-hover:opacity-100 hover:bg-muted rounded transition-all"
            >
              <DotsThree size={20} weight="bold" />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={(e) => {
                    e.stopPropagation()
                    setMenuOpen(false)
                  }}
                />
                <div className="absolute right-0 top-8 z-50 bg-popover border border-border rounded-md shadow-lg py-1 min-w-[120px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setMenuOpen(false)
                      onEdit(note)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete()
                    }}
                    disabled={isDeleting}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    <Trash size={16} />
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="text-foreground leading-relaxed">{highlightText(getPreview(note.content))}</div>
      </div>

      {/* Full view dialog */}
      {viewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setViewOpen(false)} />
          <div className="relative bg-card border border-border rounded-lg w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-medium text-muted-foreground">
                {formatFullDate(note.createdAt)}
              </h2>
            </div>

            {note.tags.length > 0 && (
              <div className="px-6 py-3 flex flex-wrap gap-2">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-muted rounded-full text-sm text-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex-1 overflow-auto px-6 py-4">
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(note.content) }}
              />
            </div>

            <div className="p-4 border-t border-border flex justify-end gap-2">
              <button
                onClick={() => setViewOpen(false)}
                className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setViewOpen(false)
                  onEdit(note)
                }}
                className="flex items-center gap-2 bg-accent text-accent-foreground hover:bg-accent/90 px-4 py-2 rounded-md transition-colors"
              >
                <Pencil size={16} />
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
