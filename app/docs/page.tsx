import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Proto Documentation - Etu',
  description: 'API protocol buffer documentation for Etu',
}

export default function ProtoDocsPage() {
  // Redirect to the static HTML file served from public/
  redirect('/docs/index.html')
}
