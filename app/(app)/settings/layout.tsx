import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { UserMenu } from "@/components/user-menu"
import { SettingsNav } from "@/components/settings-nav"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <Header backHref="/notes" logoHref="/notes">
        <UserMenu />
      </Header>

      <main className="flex-1 container mx-auto px-4 md:px-6 py-8 max-w-4xl">
        <SettingsNav />
        {children}
      </main>

      <Footer />
    </div>
  )
}
