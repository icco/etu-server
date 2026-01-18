import Link from "next/link"
import { NotePencil, MagnifyingGlass, DeviceMobile, Code } from "@phosphor-icons/react/dist/ssr"
import { auth } from "@/lib/auth"

export default async function LandingPage() {
  const session = await auth()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <NotePencil size={32} weight="duotone" className="text-primary" />
            <h1 className="text-2xl font-bold text-primary">Etu</h1>
          </div>
          <Link
            href={session ? "/notes" : "/login"}
            className="bg-accent text-accent-foreground hover:bg-accent/90 px-4 py-2 rounded-md font-medium transition-colors"
          >
            {session ? "Open App" : "Get Started"}
          </Link>
        </div>
      </header>

      <section className="container mx-auto px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Capture Life&apos;s Moments,
            <br />
            One Blip at a Time
          </h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
            Etu is your interstitial journaling companion. Quick notes, powerful search, and seamless
            access across all your devices.
          </p>
          <Link
            href={session ? "/notes" : "/register"}
            className="inline-flex bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-4 rounded-md font-medium transition-colors"
          >
            Start Journaling Today
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            $5/year • Open source • Self-hostable
          </p>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-semibold text-center mb-12 text-foreground">
            What is Interstitial Journaling?
          </h3>
          <div className="bg-card border border-border rounded-lg p-8 mb-12">
            <p className="text-lg text-foreground leading-relaxed mb-4">
              Interstitial journaling is the practice of capturing quick thoughts and observations
              throughout your day—in the moments <em>between</em> activities. Unlike traditional
              journaling that requires dedicated time and reflection, interstitial journaling embraces
              brevity and spontaneity.
            </p>
            <p className="text-lg text-foreground leading-relaxed">
              Each entry (we call them &quot;blips&quot;) is a snapshot: a thought, a task, an
              observation, or a moment worth remembering. Over time, these small captures create a
              rich, searchable history of your life and thinking.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-semibold text-center mb-16 text-foreground">
            Powerful Features
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <NotePencil size={40} weight="duotone" className="text-accent mb-4" />
              <h4 className="text-xl font-semibold mb-2 text-foreground">Quick Capture</h4>
              <p className="text-muted-foreground">
                Write in Markdown. Add tags. Save instantly. No friction between thought and capture.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <MagnifyingGlass size={40} weight="duotone" className="text-accent mb-4" />
              <h4 className="text-xl font-semibold mb-2 text-foreground">Powerful Search</h4>
              <p className="text-muted-foreground">
                Find anything instantly. Search by content, tags, or date. Your thoughts, rediscovered.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <DeviceMobile size={40} weight="duotone" className="text-accent mb-4" />
              <h4 className="text-xl font-semibold mb-2 text-foreground">Everywhere</h4>
              <p className="text-muted-foreground">
                Web, CLI, and mobile apps. Capture from wherever you are, sync automatically.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <Code size={40} weight="duotone" className="text-accent mb-4" />
              <h4 className="text-xl font-semibold mb-2 text-foreground">Open Source</h4>
              <p className="text-muted-foreground">
                Built in the open. Contribute on GitHub. Self-host if you want full control.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-semibold text-center mb-12 text-foreground">
            Simple, Honest Pricing
          </h3>
          <div className="bg-card border-2 border-accent rounded-lg p-8 text-center">
            <div className="text-5xl font-bold text-foreground mb-2">$5</div>
            <div className="text-xl text-muted-foreground mb-6">per year</div>
            <ul className="text-left space-y-3 mb-8 max-w-md mx-auto">
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">✓</span>
                <span className="text-foreground">Unlimited blips and tags</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">✓</span>
                <span className="text-foreground">Full-text search across all notes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">✓</span>
                <span className="text-foreground">Web, CLI, and mobile access</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">✓</span>
                <span className="text-foreground">API keys for custom integrations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">✓</span>
                <span className="text-foreground">Data export anytime</span>
              </li>
            </ul>
            <Link
              href="/register"
              className="inline-flex bg-accent text-accent-foreground hover:bg-accent/90 w-full justify-center py-3 rounded-md font-medium transition-colors"
            >
              Subscribe Now
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <NotePencil size={24} weight="duotone" className="text-primary" />
              <span className="text-sm text-muted-foreground">© 2024 Etu. Open source journaling.</span>
            </div>
            <div className="flex gap-6 text-sm">
              <a
                href="https://github.com/icco/etu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://writing.natwelch.com/post/765"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent transition-colors"
              >
                Blog Post
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
