"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  DocumentTextIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  TagIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline"

const navLinks = [
  { href: "/notes", label: "Notes", icon: DocumentTextIcon },
  { href: "/history", label: "History", icon: ClockIcon },
  { href: "/search", label: "Search", icon: MagnifyingGlassIcon },
  { href: "/tags", label: "Tags", icon: TagIcon },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="dropdown dropdown-end md:hidden" data-testid="mobile-nav">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-sm btn-square" aria-label="Open navigation menu">
        <Bars3Icon className="h-6 w-6" />
      </div>
      <ul
        tabIndex={0}
        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
      >
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname?.startsWith(`${href}/`)
          return (
            <li key={href}>
              <Link href={href} className={isActive ? "active" : ""}>
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
