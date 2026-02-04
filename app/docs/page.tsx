import Link from "next/link"
import { ArrowLeftIcon, KeyIcon, BookOpenIcon, CommandLineIcon } from "@heroicons/react/24/outline"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "API Documentation - Etu",
  description: "API documentation, CLI usage, client packages, and authentication for Etu",
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-base-content/70 hover:text-base-content mb-8"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Etu
        </Link>

        <h1 className="text-3xl font-bold mb-2">API Documentation</h1>
        <p className="text-base-content/70 mb-10">
          Etu exposes a Connect RPC API. Use the CLI tool, client packages, or call the proto services directly.
        </p>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CommandLineIcon className="h-5 w-5" />
            Command Line Interface (CLI)
          </h2>
          <p className="text-base-content/80 mb-4">
            The Etu CLI is a terminal-based client for managing your journal entries from the command line.
            It&apos;s perfect for quick captures, scripting, and keyboard-centric workflows.
          </p>
          
          <div className="bg-base-100 rounded-lg p-6 mb-4">
            <h3 className="font-semibold mb-3">Installation</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-base-content/70 mb-2">Via Homebrew (macOS/Linux):</p>
                <code className="block text-sm bg-base-300 px-4 py-2 rounded">
                  brew tap icco/tap<br />
                  brew install etu
                </code>
              </div>
              <div>
                <p className="text-sm text-base-content/70 mb-2">From source (requires Go 1.25+):</p>
                <code className="block text-sm bg-base-300 px-4 py-2 rounded">
                  git clone https://github.com/icco/etu<br />
                  cd etu<br />
                  go build -o etu .
                </code>
              </div>
            </div>
          </div>

          <div className="bg-base-100 rounded-lg p-6 mb-4">
            <h3 className="font-semibold mb-3">Configuration</h3>
            <p className="text-sm text-base-content/70 mb-3">
              The CLI requires an API key to authenticate with the Etu backend. You can configure it in two ways:
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-2">Option 1: Config file (~/.config/etu/config.json)</p>
                <code className="block text-sm bg-base-300 px-4 py-2 rounded whitespace-pre">
{`{
  "api_key": "your-64-char-hex-api-key",
  "grpc_target": "grpc.etu.natwelch.com:443"
}`}
                </code>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Option 2: Environment variables</p>
                <code className="block text-sm bg-base-300 px-4 py-2 rounded">
                  export ETU_API_KEY=&quot;your-api-key&quot;<br />
                  export ETU_GRPC_TARGET=&quot;grpc.etu.natwelch.com:443&quot;
                </code>
              </div>
            </div>
            <p className="text-sm text-base-content/60 mt-3">
              💡 Get your API key from <Link href="/settings" className="link link-primary">Settings → API Keys</Link>
            </p>
          </div>

          <div className="bg-base-100 rounded-lg p-6">
            <h3 className="font-semibold mb-3">Available Commands</h3>
            <ul className="space-y-3">
              <li>
                <code className="text-sm bg-base-300 px-2 py-1 rounded">etu create</code>
                <p className="text-sm text-base-content/70 mt-1">
                  Create a new journal entry with an interactive TUI. Supports attaching images and audio files.
                </p>
              </li>
              <li>
                <code className="text-sm bg-base-300 px-2 py-1 rounded">etu list</code>
                <p className="text-sm text-base-content/70 mt-1">
                  List journal entries with optional starting datetime filter.
                </p>
              </li>
              <li>
                <code className="text-sm bg-base-300 px-2 py-1 rounded">etu search</code>
                <p className="text-sm text-base-content/70 mt-1">
                  Search journal entries using fuzzy search across content and tags.
                </p>
              </li>
              <li>
                <code className="text-sm bg-base-300 px-2 py-1 rounded">etu delete</code>
                <p className="text-sm text-base-content/70 mt-1">
                  Delete a journal entry by ID.
                </p>
              </li>
              <li>
                <code className="text-sm bg-base-300 px-2 py-1 rounded">etu timesince</code>
                <p className="text-sm text-base-content/70 mt-1">
                  Output time elapsed since your last post (useful for scripts and prompts).
                </p>
              </li>
            </ul>
          </div>

          <div className="mt-4">
            <a
              href="https://github.com/icco/etu"
              target="_blank"
              rel="noopener noreferrer"
              className="link link-primary text-sm"
            >
              View CLI source code and full documentation →
            </a>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BookOpenIcon className="h-5 w-5" />
            Client packages
          </h2>
          <ul className="space-y-4">
            <li>
              <strong className="font-semibold">TypeScript / JavaScript</strong>
              <br />
              <code className="text-sm bg-base-300 px-2 py-1 rounded mt-1 inline-block">
                @icco/etu-proto
              </code>
              <p className="text-sm text-base-content/70 mt-2">
                Generated Connect RPC client and types. Published to GitHub Packages.
              </p>
              <a
                href="https://github.com/icco/etu-backend/tree/main/packages/etu-proto"
                target="_blank"
                rel="noopener noreferrer"
                className="link link-primary text-sm"
              >
                Source (etu-backend)
              </a>
            </li>
            <li>
              <strong className="font-semibold">Go</strong>
              <br />
              <code className="text-sm bg-base-300 px-2 py-1 rounded mt-1 inline-block">
                github.com/icco/etu-backend/proto
              </code>
              <p className="text-sm text-base-content/70 mt-2">
                Go client and generated code from the same proto definitions.
              </p>
              <a
                href="https://github.com/icco/etu-backend"
                target="_blank"
                rel="noopener noreferrer"
                className="link link-primary text-sm"
              >
                etu-backend repository
              </a>
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <KeyIcon className="h-5 w-5" />
            Authentication
          </h2>
          <p className="text-base-content/80 mb-4">
            API requests use an <strong>API key</strong> in the <code className="bg-base-300 px-1.5 py-0.5 rounded">Authorization</code> header.
            The backend expects the raw key (not <code className="bg-base-300 px-1.5 py-0.5 rounded">Bearer &lt;key&gt;</code>).
          </p>
          <ol className="list-decimal list-inside space-y-2 text-base-content/80">
            <li>
              Log in at <Link href="/login" className="link link-primary">etu.app</Link> (or your instance).
            </li>
            <li>
              Go to <strong>Settings → API Keys</strong> and create a key. Copy it once—it won’t be shown again.
            </li>
            <li>
              Send it on every request: <code className="bg-base-300 px-1.5 py-0.5 rounded text-sm">Authorization: &lt;your-api-key&gt;</code>
            </li>
          </ol>
          <p className="text-sm text-base-content/60 mt-4">
            For user-scoped calls (notes, tags, etc.) the backend derives your user from the API key.
            The web app uses session cookies; the API uses the key only.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Proto reference</h2>
          <p className="text-base-content/70 mb-4">
            Full protocol buffer and service definitions.
          </p>
          <Link href="/docs/index.html" className="btn btn-primary">
            Open Proto Documentation
          </Link>
        </section>
      </div>
    </div>
  )
}
