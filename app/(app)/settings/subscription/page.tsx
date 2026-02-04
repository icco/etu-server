import type { Metadata } from "next"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SubscriptionView } from "./subscription-view"

export const metadata: Metadata = {
  title: "Subscription | Etu",
}

export default async function SubscriptionPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  return <SubscriptionView user={user} />
}
