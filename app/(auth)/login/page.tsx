"use client"

import { useState } from "react"
import Link from "next/link"
import { useFormStatus } from "react-dom"
import { PencilSquareIcon } from "@heroicons/react/24/solid"
import { login } from "@/lib/actions/auth"
import { toast } from "sonner"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn btn-primary w-full">
      {pending && <span className="loading loading-spinner loading-sm"></span>}
      {pending ? "Signing in..." : "Sign In"}
    </button>
  )
}

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      toast.error(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-4 justify-center">
              <PencilSquareIcon className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">Etu</h1>
            </div>

            <h2 className="card-title justify-center">Welcome back</h2>
            <p className="text-base-content/60 text-center mb-4">
              Sign in to access your blips
            </p>

            <form action={handleSubmit} className="space-y-4">
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text">Email</span>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input input-bordered w-full"
                  placeholder="you@example.com"
                />
              </label>

              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text">Password</span>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input input-bordered w-full"
                  placeholder="••••••••"
                />
              </label>

              {error && <p className="text-sm text-error">{error}</p>}

              <SubmitButton />
            </form>

            <p className="text-center text-sm text-base-content/60 mt-4">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="link link-primary">
                Create one
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-base-content/60 mt-4">
          <Link href="/" className="link link-hover">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}
