"use client"

import {
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  DocumentTextIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  TagIcon,
} from "@heroicons/react/24/outline"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function UserMenu() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (!pathname) return false
    if (pathname === href) return true
    // Match subpaths: /notes matches /notes/123 but not /notes-archive
    if (pathname.startsWith(`${href}/`)) return true
    return false
  }

  return (
    <div className="dropdown dropdown-end">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-circle btn-lg"
        aria-label="Open user menu"
      >
        <UserCircleIcon className="h-8 w-8" />
      </div>
      <ul
        tabIndex={0}
        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
      >
        <li>
          <Link href="/notes" className={isActive("/notes") ? "active" : ""}>
            <DocumentTextIcon className="h-4 w-4" />
            Notes
          </Link>
        </li>
        <li>
          <Link href="/history" className={isActive("/history") ? "active" : ""}>
            <ClockIcon className="h-4 w-4" />
            History
          </Link>
        </li>
        <li>
          <Link href="/search" className={isActive("/search") ? "active" : ""}>
            <MagnifyingGlassIcon className="h-4 w-4" />
            Search
          </Link>
        </li>
        <li>
          <Link href="/tags" className={isActive("/tags") ? "active" : ""}>
            <TagIcon className="h-4 w-4" />
            Tags
          </Link>
        </li>
        <li>
          <div className="divider my-0"></div>
        </li>
        <li>
          <Link href="/settings" className={isActive("/settings") ? "active" : ""}>
            <Cog6ToothIcon className="h-4 w-4" />
            Settings
          </Link>
        </li>
        <li>
          <button onClick={() => signOut({ callbackUrl: "/" })}>
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
            Logout
          </button>
        </li>
      </ul>
    </div>
  )
}
