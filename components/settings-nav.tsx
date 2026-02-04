"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  KeyIcon,
  ChartBarIcon,
  UserIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline"

const tabs = [
  { id: "account", label: "Account", icon: UserIcon, href: "/settings/account" },
  { id: "stats", label: "Stats", icon: ChartBarIcon, href: "/settings/stats" },
  { id: "subscription", label: "Subscription", icon: CreditCardIcon, href: "/settings/subscription" },
  { id: "api", label: "API Keys", icon: KeyIcon, href: "/settings/api" },
]

export function SettingsNav() {
  const pathname = usePathname()

  return (
    <div role="tablist" className="tabs tabs-boxed mb-8">
      {tabs.map(({ id, label, icon: Icon, href }) => {
        const isActive = pathname === href
        return (
          <Link
            key={id}
            href={href}
            role="tab"
            className={`tab gap-2 ${isActive ? "tab-active" : ""}`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        )
      })}
    </div>
  )
}
