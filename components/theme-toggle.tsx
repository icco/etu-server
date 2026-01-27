"use client"

import { MoonIcon, SunIcon } from "@heroicons/react/24/outline"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a placeholder with the same dimensions to avoid layout shift
    return (
      <div className="w-12 h-6 rounded-full bg-base-300 animate-pulse" />
    )
  }

  const isDark = resolvedTheme === "dark"

  const handleChange = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <label className="swap swap-rotate">
      <input
        type="checkbox"
        checked={isDark}
        onChange={handleChange}
        className="theme-controller"
        value={resolvedTheme}
      />
      <SunIcon className="swap-off h-5 w-5" />
      <MoonIcon className="swap-on h-5 w-5" />
    </label>
  )
}
