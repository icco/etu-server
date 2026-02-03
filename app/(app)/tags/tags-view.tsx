"use client"

import Link from "next/link"
import { TagIcon } from "@heroicons/react/24/outline"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { UserMenu } from "@/components/user-menu"
import { AppNav } from "@/components/app-nav"
import { MobileNav } from "@/components/mobile-nav"

interface Tag {
  id: string
  name: string
}

interface TagsViewProps {
  tags: Tag[]
}

export function TagsView({ tags }: TagsViewProps) {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <Header logoHref="/" nav={<AppNav />}>
        <MobileNav />
        <UserMenu />
      </Header>

      <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center gap-2">
            <TagIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Tags</h1>
          </div>

          {tags.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <TagIcon className="h-16 w-16 text-base-content/40 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No tags yet</h2>
              <p className="text-base-content/60 mb-6 max-w-md">
                Tags will appear here once you add them to your blips.
              </p>
              <Link href="/notes" className="btn btn-primary">
                Go to Notes
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/search?q=${encodeURIComponent(`tag:${tag.name}`)}`}
                  className="card bg-base-100 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  <div className="card-body p-4">
                    <div className="flex items-center gap-2">
                      <TagIcon className="h-5 w-5 text-primary" />
                      <span className="font-medium">{tag.name}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
