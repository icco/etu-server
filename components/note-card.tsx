"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { marked } from "marked"
import DOMPurify from "isomorphic-dompurify"
import { EllipsisHorizontalIcon, PencilIcon, TrashIcon, MusicalNoteIcon } from "@heroicons/react/24/outline"
import type { Note } from "@/lib/types"
import { CollapsibleTranscript } from "@/components/collapsible-transcript"

interface NoteCardProps {
  note: Note
  onEdit: (note: Note) => void
  onDelete: (id: string) => Promise<void>
  /** When true, show a short preview (line-clamp, tighter layout) for grid use */
  compact?: boolean
}

export function NoteCard({ note, onEdit, onDelete, compact }: NoteCardProps) {
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

  // Compute safe audios once to avoid repeated filtering
  const safeAudios = useMemo(() => {
    if (!note.audios) return []
    return note.audios.filter((audio) => isSafeUrl(audio.url))
  }, [note.audios])

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
        <div className={compact ? "card-body p-4 flex flex-col" : "card-body p-4 flex flex-col"}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className={compact ? "text-xs text-base-content/60 mb-1" : "text-sm text-base-content/60 mb-2"} suppressHydrationWarning>{formatNoteDate(note.createdAt)}</div>
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
            className={compact ? "prose prose-sm max-w-none line-clamp-2 flex-1" : "prose prose-sm max-w-none"}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(note.content) }}
          />

          {/* Image thumbnails - hide in compact mode for dense grid */}
          {!compact && safeImages.length > 0 && (
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

          {/* Audio indicator - show icon and count */}
          {!compact && safeAudios.length > 0 && (
            <div className="flex items-center gap-2 mt-3 text-base-content/60">
              <MusicalNoteIcon className="h-4 w-4" />
              <span className="text-sm">
                {safeAudios.length} audio file{safeAudios.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {/* Tags at bottom right */}
          {note.tags.length > 0 && (
            <div className={compact ? "flex flex-wrap gap-1 mt-auto pt-2 justify-end" : "flex flex-wrap gap-2 mt-3 justify-end"}>
              {note.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/search?q=${encodeURIComponent(`tag:${tag}`)}`}
                  onClick={(e) => e.stopPropagation()}
                  className={compact ? "badge badge-ghost badge-xs hover:badge-primary" : "badge badge-ghost badge-sm hover:badge-primary"}
                >
                  {tag}
                </Link>
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
                        <div className="mt-2">
                          <CollapsibleTranscript text={img.extractedText} label="Extracted text:" maxLength={150} />
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Audio files in dialog */}
            {safeAudios.length > 0 && (
              <div className="mt-6 space-y-4">
                <h4 className="text-sm font-medium text-base-content/60">Attached Audio Files</h4>
                <div className="space-y-3">
                  {safeAudios.map((audio) => {
                    // Generate WebVTT caption from transcription if available
                    // Use charset in data URL to avoid base64 encoding issues with Unicode
                    const captionUrl = audio.transcribedText
                      ? `data:text/vtt;charset=utf-8,${encodeURIComponent(
                          `WEBVTT\n\n00:00:00.000 --> 99:59:59.999\n${audio.transcribedText}`
                        )}`
                      : undefined
                    
                    return (
                      <div key={audio.id} className="space-y-2">
                        <audio controls className="w-full" src={audio.url}>
                          {captionUrl && (
                            <track kind="captions" src={captionUrl} srcLang="en" label="Transcription" default />
                          )}
                          Your browser does not support the audio element.
                        </audio>
                        {audio.transcribedText && (
                          <CollapsibleTranscript text={audio.transcribedText} label="Transcription:" maxLength={200} />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Tags at bottom right */}
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6 justify-end">
                {note.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/search?q=${encodeURIComponent(`tag:${tag}`)}`}
                    className="badge badge-ghost hover:badge-primary"
                  >
                    {tag}
                  </Link>
                ))}
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
