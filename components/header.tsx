import Link from "next/link"
import { ArrowLeftIcon } from "@heroicons/react/24/outline"

interface HeaderProps {
  /** Optional back link URL. Shows a back arrow when provided. */
  backHref?: string
  /** URL the logo links to. Defaults to "/" */
  logoHref?: string
  /** Content to display on the right side of the header */
  children?: React.ReactNode
}

export function Header({ backHref, logoHref = "/", children }: HeaderProps) {
  return (
    <header className="navbar bg-base-100 shadow-sm sticky top-0 z-50">
      <div className="navbar-start">
        {backHref && (
          <Link href={backHref} className="btn btn-ghost btn-square">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
        )}
        <Link href={logoHref} className="pl-4 text-2xl font-bold text-base-content">
          Etu
        </Link>
      </div>
      {children && (
        <div className="navbar-end gap-2">
          {children}
        </div>
      )}
    </header>
  )
}
