"use client"

import { useState } from "react"
import Link from "next/link"
import { useFormStatus } from "react-dom"
import { PencilSquareIcon } from "@heroicons/react/24/solid"
import { register } from "@/lib/actions/auth"
import { toast } from "sonner"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn btn-primary w-full">
      {pending && <span className="loading loading-spinner loading-sm"></span>}
      {pending ? "Creating account..." : "Create Account"}
    </button>
  )
}

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string
    
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      toast.error("Passwords do not match")
      return
    }

    const result = await register(formData)
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

            <h2 className="card-title justify-center">Create your account</h2>
            <p className="text-base-content/60 text-center mb-4">
              Start capturing your thoughts today
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
                  minLength={8}
                  className="input input-bordered w-full"
                  placeholder="At least 8 characters"
                />
              </label>

              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text">Confirm Password</span>
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
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
              Already have an account?{" "}
              <Link href="/login" className="link link-primary">
                Sign in
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
