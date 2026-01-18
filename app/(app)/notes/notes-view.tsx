"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { 
  NotePencil, 
  MagnifyingGlass, 
  SignOut, 
  Gear, 
  X, 
  House 
} from "@phosphor-icons/react"
import { signOut } from "next-auth/react"
import { toast } from "sonner"
import { createNote, updateNote, deleteNote } from "@/lib/actions/notes"
import { NoteCard } from "@/components/note-card"
import { NoteDialog } from "@/components/note-dialog"

interface Note {
  id: string
  content: string
  createdAt: Date
  updatedAt: Date
  tags: string[]
}

interface Tag {
  id: string
  name: string
  count: number
}

interface NotesViewProps {
  initialNotes: Note[]
  initialTags: Tag[]
  searchParams: { search?: string; tags?: string; from?: string; to?: string }
}

function groupNotesByDate(notes: Note[]): Map<string, Note[]> {
  const grouped = new Map<string, Note[]>()
  
  notes.forEach((note) => {
    const dateKey = format(new Date(note.createdAt), "MMMM d, yyyy")
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, [])
    }
    grouped.get(dateKey)!.push(note)
  })
  
  return grouped
}

export function NotesView({ initialNotes, initialTags, searchParams }: NotesViewProps) {
  const router = useRouter()
  const _urlParams = useSearchParams()
  const [_isPending, startTransition] = useTransition()
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [searchQuery, setSearchQuery] = useState(searchParams.search || "")
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.tags?.split(",").filter(Boolean) || []
  )

  const notes = initialNotes
  const allTags = initialTags.map(t => t.name)
  const groupedNotes = groupNotesByDate(notes)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return

      if (e.key === "n" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setEditingNote(null)
        setDialogOpen(true)
      }

      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        document.getElementById("search-notes")?.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Update URL with filters
  const updateFilters = useCallback((newSearch?: string, newTags?: string[]) => {
    const params = new URLSearchParams()
    if (newSearch) params.set("search", newSearch)
    if (newTags?.length) params.set("tags", newTags.join(","))
    
    startTransition(() => {
      router.push(`/notes?${params.toString()}`)
    })
  }, [router])

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    // Debounce the URL update
    const timeout = setTimeout(() => {
      updateFilters(value, selectedTags)
    }, 300)
    return () => clearTimeout(timeout)
  }

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag]
    setSelectedTags(newTags)
    updateFilters(searchQuery, newTags)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedTags([])
    router.push("/notes")
  }

  const handleSaveNote = async (content: string, tags: string[]) => {
    try {
      if (editingNote) {
        await updateNote({ id: editingNote.id, content, tags })
        toast.success("Blip updated")
      } else {
        await createNote({ content, tags })
        toast.success("Blip saved")
      }
      setDialogOpen(false)
      setEditingNote(null)
      router.refresh()
    } catch {
      toast.error("Failed to save blip")
    }
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setDialogOpen(true)
  }

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id)
      toast.success("Blip deleted")
      router.refresh()
    } catch {
      toast.error("Failed to delete blip")
    }
  }

  const hasFilters = searchQuery || selectedTags.length > 0

  return (
    <>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <NotePencil size={28} weight="duotone" className="text-primary" />
              <h1 className="text-xl font-bold text-primary hidden sm:block">Etu</h1>
            </div>

            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlass
                  size={20}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  id="search-notes"
                  type="search"
                  placeholder="Search blips... (press /)"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingNote(null)
                  setDialogOpen(true)
                }}
                className="flex items-center gap-2 bg-accent text-accent-foreground hover:bg-accent/90 px-4 py-2 rounded-md font-medium transition-colors"
              >
                <NotePencil size={20} weight="bold" />
                <span className="hidden sm:inline">New Blip</span>
              </button>
              <Link
                href="/settings"
                className="p-2 hover:bg-muted rounded-md transition-colors"
              >
                <Gear size={24} />
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-2 hover:bg-muted rounded-md transition-colors"
              >
                <SignOut size={24} />
              </button>
            </div>
          </div>

          {/* Tags filter */}
          {allTags.length > 0 && (
            <div className="border-t border-border">
              <div className="container mx-auto px-4 md:px-6 py-3">
                <div className="flex gap-2 items-center overflow-x-auto">
                  <span className="text-sm text-muted-foreground shrink-0">Tags:</span>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors shrink-0 ${
                        selectedTags.includes(tag)
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted hover:bg-muted/80 text-foreground"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                  {hasFilters && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground ml-2"
                    >
                      <X size={14} />
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Main content */}
        <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
          {notes.length === 0 && !hasFilters ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <NotePencil size={64} weight="duotone" className="text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">No blips yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Start your interstitial journaling journey by capturing your first thought.
              </p>
              <button
                onClick={() => setDialogOpen(true)}
                className="flex items-center gap-2 bg-accent text-accent-foreground hover:bg-accent/90 px-6 py-3 rounded-md font-medium transition-colors"
              >
                <NotePencil size={20} weight="bold" />
                Create Your First Blip
              </button>
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <MagnifyingGlass size={64} weight="duotone" className="text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">No matching blips</h2>
              <p className="text-muted-foreground mb-6">Try adjusting your search or filters.</p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-8">
              {Array.from(groupedNotes.entries()).map(([date, dateNotes]) => (
                <div key={date}>
                  <div className="sticky top-[73px] bg-background/95 backdrop-blur-sm py-2 mb-4 z-10">
                    <h3 className="text-lg font-semibold text-foreground">{date}</h3>
                    <div className="h-px bg-border mt-2" />
                  </div>
                  <div className="space-y-4">
                    {dateNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onEdit={handleEditNote}
                        onDelete={handleDeleteNote}
                        searchQuery={searchQuery}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden z-50 pb-safe">
          <div className="flex items-center justify-around py-2">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex flex-col items-center gap-1 p-2"
            >
              <House size={24} />
              <span className="text-xs">Home</span>
            </button>
            <button
              onClick={() => document.getElementById("search-notes")?.focus()}
              className="flex flex-col items-center gap-1 p-2"
            >
              <MagnifyingGlass size={24} />
              <span className="text-xs">Search</span>
            </button>
            <button
              onClick={() => setDialogOpen(true)}
              className="bg-accent text-accent-foreground rounded-full w-14 h-14 flex items-center justify-center shadow-lg -mt-6"
            >
              <NotePencil size={28} weight="bold" />
            </button>
            <Link href="/settings" className="flex flex-col items-center gap-1 p-2">
              <Gear size={24} />
              <span className="text-xs">Settings</span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex flex-col items-center gap-1 p-2"
            >
              <SignOut size={24} />
              <span className="text-xs">Logout</span>
            </button>
          </div>
        </nav>
        <div className="h-20 md:hidden" />
      </div>

      <NoteDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingNote(null)
        }}
        onSave={handleSaveNote}
        initialContent={editingNote?.content}
        initialTags={editingNote?.tags}
        existingTags={allTags}
        title={editingNote ? "Edit Blip" : "New Blip"}
      />
    </>
  )
}
