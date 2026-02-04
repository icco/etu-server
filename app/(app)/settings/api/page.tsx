import type { Metadata } from "next"
import { getApiKeys } from "@/lib/actions/api-keys"
import { ApiKeysView } from "./api-keys-view"

export const metadata: Metadata = {
  title: "API Keys | Etu",
}

export default async function ApiKeysPage() {
  const apiKeys = await getApiKeys()

  return <ApiKeysView initialApiKeys={apiKeys} />
}
