"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import { marked } from "marked"
import DOMPurify from "isomorphic-dompurify"
import { EllipsisHorizontalIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline"
import type { Note } from "@/lib/types"

interface NoteCardProps {
  note: Note
  onEdit: (note: Note) => void
  onDelete: (id: string) => Promise<void>
  searchQuery?: string
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const [viewOpen, setViewOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const formatNoteDate = (date: Date) => format(new Date(date), "yyyy-MM-dd HH:mm")

  const renderMarkdown = (content: string) => {
    return DOMPurify.sanitize(marked.parse(content) as string)
  }

  // Validate URL scheme to prevent XSS (e.g., javascript: URLs)
  const SAFE_URL_SCHEMES = ["http:", "https:", "blob:", "data:"]
  const isSafeUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url, window.location.origin)
      return SAFE_URL_SCHEMES.some((scheme) => parsed.protocol === scheme)
    } catch {
      return false
    }
  }

  // Compute safe images once to avoid repeated filtering
  const safeImages = useMemo(() => {
    if (!note.images) return []
    return note.images.filter((img) => isSafeUrl(img.url))
  }, [note.images])

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
        className="card bg-base-100 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer group"
        onClick={() => setViewOpen(true)}
      >
        <div className="card-body p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="text-sm text-base-content/60 mb-2" suppressHydrationWarning>{formatNoteDate(note.createdAt)}</div>
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {note.tags.map((tag) => (
                    <span key={tag} className="badge badge-ghost badge-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="dropdown dropdown-end">
              <button
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen(!menuOpen)
                }}
                className="btn btn-ghost btn-sm btn-square opacity-0 group-hover:opacity-100"
              >
                <EllipsisHorizontalIcon className="h-5 w-5" />
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
                  <ul className="dropdown-content menu bg-base-100 rounded-box z-50 w-32 p-2 shadow-lg">
                    <li>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setMenuOpen(false)
                          onEdit(note)
                        }}
                      >
                        <PencilIcon className="h-4 w-4" />
                        Edit
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete()
                        }}
                        disabled={isDeleting}
                        className="text-error"
                      >
                        {isDeleting ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          <TrashIcon className="h-4 w-4" />
                        )}
                        {isDeleting ? "Deleting..." : "Delete"}
                      </button>
                    </li>
                  </ul>
                </>
              )}
            </div>
          </div>

          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(note.content) }}
          />

          {/* Image thumbnails */}
          {safeImages.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {safeImages.slice(0, 4).map((img, idx) => (
                <div key={img.id} className="relative">
                  <img
                    src={img.url}
                    alt={img.extractedText || "Attached image"}
                    className="h-16 w-16 object-cover rounded-lg border border-base-300"
                  />
                  {idx === 3 && safeImages.length > 4 && (
                    <div className="absolute inset-0 bg-base-300/80 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-medium">+{safeImages.length - 4}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Full view dialog */}
      <dialog className={`modal ${viewOpen ? "modal-open" : ""}`}>
        <div className="modal-box w-11/12 max-w-2xl max-h-[85vh] flex flex-col p-0">
          <div className="p-6 border-b border-base-300">
            <h3 className="font-medium text-base-content/60" suppressHydrationWarning>
              {formatNoteDate(note.createdAt)}
            </h3>
          </div>

          {note.tags.length > 0 && (
            <div className="px-6 py-3 flex flex-wrap gap-2">
              {note.tags.map((tag) => (
                <span key={tag} className="badge badge-ghost">
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

            {/* Full size images in dialog */}
            {safeImages.length > 0 && (
              <div className="mt-6 space-y-4">
                <h4 className="text-sm font-medium text-base-content/60">Attached Images</h4>
                <div className="grid grid-cols-2 gap-4">
                  {safeImages.map((img) => (
                    <a
                      key={img.id}
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={img.url}
                        alt={img.extractedText || "Attached image"}
                        className="w-full rounded-lg border border-base-300 hover:opacity-90 transition-opacity"
                      />
                      {img.extractedText && (
                        <p className="text-xs text-base-content/50 mt-1 line-clamp-2">
                          {img.extractedText}
                        </p>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="modal-action px-4 pb-4">
            <button onClick={() => setViewOpen(false)} className="btn btn-ghost">
              Close
            </button>
            <button
              onClick={() => {
                setViewOpen(false)
                onEdit(note)
              }}
              className="btn btn-primary gap-2"
            >
              <PencilIcon className="h-4 w-4" />
              Edit
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setViewOpen(false)}>close</button>
        </form>
      </dialog>
    </>
  )
}
