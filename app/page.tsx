import Link from "next/link"
import { DocumentTextIcon, MagnifyingGlassIcon, DevicePhoneMobileIcon, CodeBracketIcon } from "@heroicons/react/24/outline"
import { auth } from "@/lib/auth"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getRandomNotes, getTags } from "@/lib/actions/notes"
import { RandomNotesView } from "./random-notes-view"

export default async function LandingPage() {
  const session = await auth()

  // If user is logged in, show random notes instead of landing page
  if (session?.user) {
    const [randomNotesData, tags] = await Promise.all([
      getRandomNotes(5),
      getTags(),
    ])
    
    return <RandomNotesView notes={randomNotesData.notes} tags={tags} />
  }

  // Show landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <Header logoHref="/">
        <Link href="/login" className="btn btn-primary">
          Get Started
        </Link>
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
                  Jot down fleeting thoughts as blips. Write in Markdown, add tags, no friction between idea and capture.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body">
                <MagnifyingGlassIcon className="h-10 w-10 text-primary" />
                <h4 className="card-title">Resurface & Refine</h4>
                <p className="text-base-content/60">
                  Old blips come back to find you. Review, connect ideas, and watch patterns emerge over time.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body">
                <DevicePhoneMobileIcon className="h-10 w-10 text-primary" />
                <h4 className="card-title">Access Everywhere</h4>
                <p className="text-base-content/60">
                  Web, CLI, and mobile apps. Capture from wherever inspiration strikes, sync automatically.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body">
                <CodeBracketIcon className="h-10 w-10 text-primary" />
                <h4 className="card-title">Your Data, Your Rules</h4>
                <p className="text-base-content/60">
                  Open source and self-hostable. Export anytime. Built in the open on GitHub.
                </p>
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
                  <span>Intelligent search and tagging</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Web, CLI, and mobile access</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>API keys for custom integrations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Full data export anytime</span>
                </li>
              </ul>
              <Link href="/register" className="btn btn-primary w-full">
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
