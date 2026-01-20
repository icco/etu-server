import Link from "next/link"
import { PencilSquareIcon, MagnifyingGlassIcon, DevicePhoneMobileIcon, CodeBracketIcon } from "@heroicons/react/24/solid"
import { auth } from "@/lib/auth"

export default async function LandingPage() {
  const session = await auth()

  return (
    <div className="min-h-screen bg-base-200">
      <header className="navbar bg-base-100 shadow-sm sticky top-0 z-50">
        <div className="navbar-start">
          <div className="flex items-center gap-2">
            <PencilSquareIcon className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">Etu</span>
          </div>
        </div>
        <div className="navbar-end">
          <Link href={session ? "/notes" : "/login"} className="btn btn-primary">
            {session ? "Open App" : "Get Started"}
          </Link>
        </div>
      </header>

      <section className="container mx-auto px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Capture Life&apos;s Moments,
            <br />
            One Blip at a Time
          </h2>
          <p className="text-xl text-base-content/60 mb-8 leading-relaxed max-w-2xl mx-auto">
            Etu is your interstitial journaling companion. Quick notes, powerful search, and seamless
            access across all your devices.
          </p>
          <Link href={session ? "/notes" : "/register"} className="btn btn-primary btn-lg">
            Start Journaling Today
          </Link>
          <p className="text-sm text-base-content/60 mt-4">
            $5/year • Open source • Self-hostable
          </p>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20 border-t border-base-300">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-semibold text-center mb-12">
            What is Interstitial Journaling?
          </h3>
          <div className="card bg-base-100 shadow-xl mb-12">
            <div className="card-body">
              <p className="text-lg leading-relaxed mb-4">
                Interstitial journaling is the practice of capturing quick thoughts and observations
                throughout your day—in the moments <em>between</em> activities. Unlike traditional
                journaling that requires dedicated time and reflection, interstitial journaling embraces
                brevity and spontaneity.
              </p>
              <p className="text-lg leading-relaxed">
                Each entry (we call them &quot;blips&quot;) is a snapshot: a thought, a task, an
                observation, or a moment worth remembering. Over time, these small captures create a
                rich, searchable history of your life and thinking.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20 bg-base-300/30">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-semibold text-center mb-16">
            Powerful Features
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body">
                <PencilSquareIcon className="h-10 w-10 text-primary" />
                <h4 className="card-title">Quick Capture</h4>
                <p className="text-base-content/60">
                  Write in Markdown. Add tags. Save instantly. No friction between thought and capture.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body">
                <MagnifyingGlassIcon className="h-10 w-10 text-primary" />
                <h4 className="card-title">Powerful Search</h4>
                <p className="text-base-content/60">
                  Find anything instantly. Search by content, tags, or date. Your thoughts, rediscovered.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body">
                <DevicePhoneMobileIcon className="h-10 w-10 text-primary" />
                <h4 className="card-title">Everywhere</h4>
                <p className="text-base-content/60">
                  Web, CLI, and mobile apps. Capture from wherever you are, sync automatically.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body">
                <CodeBracketIcon className="h-10 w-10 text-primary" />
                <h4 className="card-title">Open Source</h4>
                <p className="text-base-content/60">
                  Built in the open. Contribute on GitHub. Self-host if you want full control.
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
                  <span>Unlimited blips and tags</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Full-text search across all notes</span>
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
                  <span>Data export anytime</span>
                </li>
              </ul>
              <Link href="/register" className="btn btn-primary w-full">
                Subscribe Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer footer-center bg-base-100 text-base-content p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full max-w-6xl">
          <div className="flex items-center gap-2">
            <PencilSquareIcon className="h-6 w-6 text-primary" />
            <span className="text-sm opacity-60">&copy; 2026 Nat Welch.</span>
          </div>
          <div className="flex gap-6 text-sm">
            <a
              href="https://github.com/icco/etu"
              target="_blank"
              rel="noopener noreferrer"
              className="link link-hover"
            >
              GitHub
            </a>
            <a
              href="https://writing.natwelch.com/post/765"
              target="_blank"
              rel="noopener noreferrer"
              className="link link-hover"
            >
              Blog Post
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
