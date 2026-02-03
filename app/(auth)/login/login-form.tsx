"use client"

import { useState } from "react"
import Link from "next/link"
import { useFormStatus } from "react-dom"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
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

export function LoginForm() {
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
    <div className="min-h-screen bg-base-200 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body p-8 sm:p-10">
            <h2 className="card-title justify-center">Welcome back</h2>
            <p className="text-base-content/70 text-center mb-4">
              Sign in to access your blips
            </p>

            <form action={handleSubmit} className="space-y-4">
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text text-base-content/90 font-medium">Email</span>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input input-bordered w-full bg-base-200 text-base-content placeholder:text-base-content/50"
                  placeholder="you@example.com"
                />
              </label>

              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text text-base-content/90 font-medium">Password</span>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input input-bordered w-full bg-base-200 text-base-content placeholder:text-base-content/50"
                  placeholder="••••••••"
                />
              </label>

              {error && <p className="text-sm text-error">{error}</p>}

              <div className="pt-2">
                <SubmitButton />
              </div>
            </form>

            <div className="text-center mt-4">
              <p className="text-sm text-base-content/90 mb-2">Don&apos;t have an account?</p>
              <Link href="/register" className="btn btn-outline btn-sm w-full">
                Create one
              </Link>
            </div>
          </div>
        </div>

      </div>
      </div>

      <Footer />
    </div>
  )
}
