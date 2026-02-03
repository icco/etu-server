"use client"

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"

interface NavSearchProps {
  /** Pre-fill the input (e.g. current query on search page) */
  defaultValue?: string
  /** Placeholder text */
  placeholder?: string
  /** Input class name for sizing */
  className?: string
}

export function NavSearch({
  defaultValue,
  placeholder = "Search blips…",
  className = "input input-bordered input-sm w-36 md:w-48",
}: NavSearchProps) {
  return (
    <form action="/search" method="GET" className="flex items-center gap-1">
      <label htmlFor="nav-search-q" className="sr-only">
        Search blips
      </label>
      <input
        id="nav-search-q"
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={className}
        aria-label="Search blips"
      />
      <button type="submit" className="btn btn-ghost btn-square btn-sm" aria-label="Submit search">
        <MagnifyingGlassIcon className="h-5 w-5" />
      </button>
    </form>
  )
}
