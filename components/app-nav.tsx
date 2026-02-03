"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  DocumentTextIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  TagIcon,
} from "@heroicons/react/24/outline"

const navLinks = [
  { href: "/notes", label: "Notes", icon: DocumentTextIcon },
  { href: "/history", label: "History", icon: ClockIcon },
  { href: "/search", label: "Search", icon: MagnifyingGlassIcon },
  { href: "/tags", label: "Tags", icon: TagIcon },
]

export function AppNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1">
      {navLinks.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname?.startsWith(`${href}/`)
        return (
          <Link
            key={href}
            href={href}
            className={`btn btn-ghost btn-sm gap-1 ${isActive ? "btn-active" : ""}`}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
