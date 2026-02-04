import type { Metadata } from "next"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AccountView } from "./account-view"

export const metadata: Metadata = {
  title: "Account Settings | Etu",
}

export default async function AccountPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  return <AccountView user={user} />
}
