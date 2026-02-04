import Link from "next/link"
import {
  LightBulbIcon,
  ArrowPathIcon,
  BoltIcon,
  LockClosedIcon,
  CheckIcon,
  CommandLineIcon,
} from "@heroicons/react/24/outline"
import { auth } from "@/lib/auth"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { UserMenu } from "@/components/user-menu"
import { AppNav } from "@/components/app-nav"
import { MobileNav } from "@/components/mobile-nav"

export default async function LandingPage() {
  const session = await auth()

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <Header
        logoHref="/"
        nav={session?.user ? <AppNav /> : undefined}
      >
        {session?.user && <MobileNav />}
        {session?.user ? (
          <UserMenu />
        ) : (
          <>
            <Link href="/docs" className="btn btn-ghost">
              Docs
            </Link>
            <Link href="/login" className="btn btn-ghost">
              Sign In
            </Link>
          </>
        )}
      </Header>

      <main className="flex-1">
        {/* Hero Section - Clear value prop, single CTA */}
        <section className="container mx-auto px-6 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Stop Losing Your Best Ideas
            </h1>
            <p className="text-xl text-base-content/70 mb-10 leading-relaxed">
              Etu brings your notes back when you need them. Capture thoughts in seconds,
              and the system resurfaces them over time—turning scattered ideas into creative breakthroughs.
            </p>
            <Link href={session ? "/notes" : "/register"} className="btn btn-primary btn-lg px-8">
              Start Free for 14 Days
            </Link>
            <p className="text-sm text-base-content/50 mt-4">No credit card required</p>
          </div>
        </section>

        {/* Problem Section */}
        <section className="bg-base-300/50 py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Your Notes App Is a Graveyard
              </h2>
              <p className="text-lg text-base-content/70 leading-relaxed">
                You capture a brilliant idea. It disappears into folders you&apos;ll never open again.
                Months later, you have the same thought—unaware you already wrote it down.
                <strong className="text-base-content"> Sound familiar?</strong>
              </p>
            </div>
          </div>
        </section>

        {/* Solution Section - How it works */}
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              Etu Brings Ideas Back to Life
            </h2>
            <div className="grid md:grid-cols-3 gap-10">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <LightBulbIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Capture in Seconds</h3>
                <p className="text-base-content/60">
                  Write a quick note with Markdown. Add tags. Press Cmd+Enter. Done.
                  Zero friction between thought and capture.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ArrowPathIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Ideas Resurface</h3>
                <p className="text-base-content/60">
                  Old notes appear in your feed over time. See past thoughts with fresh eyes.
                  Connect dots you couldn&apos;t before.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BoltIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Turn Into Action</h3>
                <p className="text-base-content/60">
                  Refine ideas each time they resurface. Watch scattered thoughts evolve
                  into articles, projects, and decisions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="bg-base-100 py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold mb-2">10,000+</div>
                  <div className="text-base-content/80">Notes captured</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">Open Source</div>
                  <div className="text-base-content/80">Self-host anytime</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">$5/year</div>
                  <div className="text-base-content/80">Simple pricing</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              Everything You Need, Nothing You Don&apos;t
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: "Markdown support", desc: "Write with formatting that travels anywhere" },
                { title: "Tag organization", desc: "Find notes by topic with autocomplete tags" },
                { title: "Full-text search", desc: "Search across all your notes instantly" },
                { title: "Image attachments", desc: "Add screenshots and photos to any note" },
                { title: "Keyboard shortcuts", desc: "Press 'n' for new note, '/' to search" },
                { title: "Dark mode", desc: "Easy on your eyes, day or night" },
                { title: "API access", desc: "Use the CLI or build your own integrations", link: "/docs" },
                { title: "Data export", desc: "Your data is yours—export anytime" },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 items-start">
                  <CheckIcon className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">
                      {item.link ? (
                        <Link href={item.link} className="hover:underline">
                          {item.title}
                        </Link>
                      ) : (
                        item.title
                      )}
                    </h4>
                    <p className="text-base-content/60 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CLI Section */}
        <section className="bg-base-100 py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CommandLineIcon className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Power Users Love the CLI
                </h2>
                <p className="text-lg text-base-content/70">
                  The Etu command-line interface brings journaling to your terminal.
                  Perfect for keyboard workflows, scripting, and quick captures.
                </p>
              </div>
              
              <div className="bg-base-200 rounded-lg p-8">
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="font-semibold mb-2">Quick Installation</h3>
                    <code className="text-sm bg-base-300 px-3 py-2 rounded block">
                      brew tap icco/tap<br />
                      brew install etu
                    </code>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Create Notes Instantly</h3>
                    <code className="text-sm bg-base-300 px-3 py-2 rounded block">
                      etu create
                    </code>
                    <p className="text-sm text-base-content/60 mt-2">
                      Interactive TUI with live preview
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <p className="text-sm text-base-content/70">
                    <strong>Search &amp; Filter:</strong> <code className="bg-base-300 px-2 py-0.5 rounded text-xs">etu search &quot;project ideas&quot;</code>
                  </p>
                  <p className="text-sm text-base-content/70">
                    <strong>List Entries:</strong> <code className="bg-base-300 px-2 py-0.5 rounded text-xs">etu list --from 2024-01-01</code>
                  </p>
                  <p className="text-sm text-base-content/70">
                    <strong>Time Since Last Post:</strong> <code className="bg-base-300 px-2 py-0.5 rounded text-xs">etu timesince</code>
                  </p>
                </div>

                <div className="text-center">
                  <Link href="/docs" className="btn btn-outline btn-sm">
                    View Full CLI Documentation
                  </Link>
                </div>
              </div>

              <p className="text-center text-sm text-base-content/60 mt-6">
                Open source on GitHub:{" "}
                <a 
                  href="https://github.com/icco/etu" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="link link-primary"
                >
                  github.com/icco/etu
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* FAQ / Objection Busters */}
        <section className="bg-base-300/50 py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                Common Questions
              </h2>
              <div className="space-y-6">
                <div className="collapse collapse-arrow bg-base-100">
                  <input type="radio" name="faq" defaultChecked />
                  <div className="collapse-title font-semibold">
                    How is this different from Notion or Obsidian?
                  </div>
                  <div className="collapse-content text-base-content/70">
                    <p>
                      Notion and Obsidian are powerful but complex. Etu does one thing well:
                      fast capture with automatic resurfacing. No folders to organize, no graph to maintain.
                      Just write and let the system bring ideas back when you need them.
                    </p>
                  </div>
                </div>
                <div className="collapse collapse-arrow bg-base-100">
                  <input type="radio" name="faq" />
                  <div className="collapse-title font-semibold">
                    What happens to my data?
                  </div>
                  <div className="collapse-content text-base-content/70">
                    <p>
                      Your notes are encrypted and stored securely. Etu is open source, so you can
                      self-host if you prefer. You can export all your data anytime in standard formats.
                    </p>
                  </div>
                </div>
                <div className="collapse collapse-arrow bg-base-100">
                  <input type="radio" name="faq" />
                  <div className="collapse-title font-semibold">
                    Why $5/year? That seems too cheap.
                  </div>
                  <div className="collapse-content text-base-content/70">
                    <p>
                      We believe note-taking shouldn&apos;t be expensive. The low price keeps us focused
                      on building a great product instead of upselling features. Plus, it&apos;s sustainable
                      for our infrastructure costs.
                    </p>
                  </div>
                </div>
                <div className="collapse collapse-arrow bg-base-100">
                  <input type="radio" name="faq" />
                  <div className="collapse-title font-semibold">
                    Can I use it on my phone?
                  </div>
                  <div className="collapse-content text-base-content/70">
                    <p>
                      Yes! The web app is fully responsive. We also offer API access so you can use
                      our CLI tool or connect with other apps. Native mobile apps are on the roadmap.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-6 py-24">
          <div className="max-w-3xl mx-auto text-center">
            <LockClosedIcon className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Your Ideas Deserve Better Than a Folder
            </h2>
            <p className="text-lg text-base-content/70 mb-10">
              Start capturing thoughts today. Watch them resurface and evolve into something bigger.
            </p>
            <Link href={session?.user ? "/notes" : "/register"} className="btn btn-primary btn-lg px-8">
              Try Etu Free
            </Link>
            <p className="text-sm text-base-content/50 mt-4">14-day free trial, then $5/year</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
