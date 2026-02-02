import Link from "next/link"
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  DevicePhoneMobileIcon,
  CodeBracketIcon,
  TagIcon,
  PhotoIcon,
  ChartBarIcon,
  KeyIcon,
  CommandLineIcon,
} from "@heroicons/react/24/outline"
import { auth } from "@/lib/auth"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { UserMenu } from "@/components/user-menu"

export default async function LandingPage() {
  const session = await auth()

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <Header logoHref="/">
        {session?.user ? (
          <UserMenu />
        ) : (
          <Link href="/login" className="btn btn-primary">
            Get Started
          </Link>
        )}
      </Header>

      <main className="flex-1">
      <section className="container mx-auto px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Your Thoughts,
            <br />
            Resurfaced at the Right Time
          </h2>
          <p className="text-xl text-base-content/60 mb-8 leading-relaxed max-w-2xl mx-auto">
            Capture fleeting ideas as blips. Let the system bring them back when you need them.
            Turn scattered thoughts into finished work.
          </p>
          <Link href={session ? "/notes" : "/register"} className="btn btn-primary btn-lg">
            Start Capturing Ideas
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20 border-t border-base-300">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-semibold text-center mb-12">
            What Are Blips?
          </h3>
          <div className="card bg-base-100 shadow-xl mb-12">
            <div className="card-body">
              <p className="text-lg leading-relaxed mb-4">
                A blip is more than just a note—it&apos;s a <strong>unit of attention managed by software</strong>.
                When you capture a fleeting thought, Etu doesn&apos;t just store it away to be forgotten.
                Instead, the system brings it back to you at the right moments.
              </p>
              <p className="text-lg leading-relaxed mb-4">
                Whether it&apos;s a seed for an article, a creative insight, or a pattern you&apos;re tracking,
                blips resurface over time. Each time you see an old blip, you can refine it, connect it to other
                ideas, or let it naturally evolve into something bigger.
              </p>
              <p className="text-lg leading-relaxed">
                This is <strong>programmable attention</strong>—using software not just to remember, but to help
                you think. Your scattered thoughts become a system for creative synthesis.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20 bg-base-300/30">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-semibold text-center mb-16">
            How It Works
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body">
                <DocumentTextIcon className="h-10 w-10 text-primary" />
                <h4 className="card-title">Capture Instantly</h4>
                <p className="text-base-content/60">
                  Write blips in Markdown with live preview. Add tags with autocomplete, attach images, and save with Cmd+Enter—no friction between idea and capture.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body">
                <MagnifyingGlassIcon className="h-10 w-10 text-primary" />
                <h4 className="card-title">Search & Resurface</h4>
                <p className="text-base-content/60">
                  Full-text search, filter by tags or date range, and browse a tags page with counts. Old blips resurface on your home feed so you revisit and refine ideas.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body">
                <DevicePhoneMobileIcon className="h-10 w-10 text-primary" />
                <h4 className="card-title">Access Everywhere</h4>
                <p className="text-base-content/60">
                  Web app, CLI, and mobile. Generate API keys in Settings to use with the Etu CLI and mobile app. Responsive design with keyboard shortcuts (n for new, / to search).
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body">
                <CodeBracketIcon className="h-10 w-10 text-primary" />
                <h4 className="card-title">Your Data, Your Rules</h4>
                <p className="text-base-content/60">
                  Open source and self-hostable. Light/dark theme, full data export, and optional Notion sync. Built in the open on GitHub.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20 border-t border-base-300">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-semibold text-center mb-12">
            Everything You Need
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex gap-3">
              <DocumentTextIcon className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Notes & Markdown</h4>
                <p className="text-sm text-base-content/60">Timeline view with date grouping, full note view with rendered Markdown, edit and delete anytime.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <TagIcon className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Tags & Filtering</h4>
                <p className="text-sm text-base-content/60">Tag autocomplete, filter by one or more tags, dedicated tags page with note counts, date range filters.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <PhotoIcon className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Images in Blips</h4>
                <p className="text-sm text-base-content/60">Attach images to any blip. They’re stored with your note and shown in the full note view.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <ChartBarIcon className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Stats & Account</h4>
                <p className="text-sm text-base-content/60">Dashboard with total notes, tags, and word count. Edit profile, avatar, password, and manage subscription.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <KeyIcon className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">API Keys & Notion</h4>
                <p className="text-sm text-base-content/60">Create and revoke API keys for CLI and mobile. Optional Notion API key to sync notes to your workspace.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CommandLineIcon className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Keyboard Shortcuts</h4>
                <p className="text-sm text-base-content/60">Press n for a new blip, / to focus search. Cmd+Enter in the editor to save. Fast capture without leaving the keyboard.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-semibold text-center mb-12">
            Simple, Honest Pricing
          </h3>
          <div className="card bg-base-100 shadow-xl border-2 border-primary">
            <div className="card-body text-center">
              <div className="text-5xl font-bold mb-2">$5</div>
              <div className="text-xl text-base-content/60 mb-6">per year</div>
              <ul className="text-left space-y-3 mb-8 max-w-md mx-auto">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Unlimited blips with resurfacing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Markdown, tags, and images in notes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Search, tag filters, and date range</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Web, CLI, and mobile (API keys)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Stats, profile, and Notion sync</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Light/dark theme, full export</span>
                </li>
              </ul>
              <Link href={session?.user ? "/notes" : "/register"} className="btn btn-primary w-full">
                Start Using Etu
              </Link>
            </div>
          </div>
        </div>
      </section>
      </main>

      <Footer />
    </div>
  )
}
