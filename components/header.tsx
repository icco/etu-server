import Link from "next/link"
import { ArrowLeftIcon } from "@heroicons/react/24/outline"

interface HeaderProps {
  /** Optional back link URL. Shows a back arrow when provided. */
  backHref?: string
  /** URL the logo links to. Defaults to "/" */
  logoHref?: string
  /** Navigation component to display in the center (hidden on mobile) */
  nav?: React.ReactNode
  /** Content to display on the right side of the header (mobile nav, user menu, etc.) */
  children?: React.ReactNode
}

export function Header({ backHref, logoHref = "/", nav, children }: HeaderProps) {
  return (
    <header className="bg-base-100 shadow-sm sticky top-0 z-50">
      <div className="navbar container mx-auto px-4 md:px-6">
        <div className="flex-1">
          {backHref && (
            <Link href={backHref} className="btn btn-ghost btn-square">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
          )}
          <Link href={logoHref} className="btn btn-ghost text-xl">
            Etu
          </Link>
        </div>
        {nav && <div className="flex-none hidden md:flex">{nav}</div>}
        {children && (
          <div className="flex-none gap-2">
            {children}
          </div>
        )}
      </div>
    </header>
  )
}
