"use client"

import { format } from "date-fns"
import { CreditCardIcon } from "@heroicons/react/24/outline"

interface SubscriptionViewProps {
  user: {
    subscriptionStatus: string
    subscriptionEnd: Date | null
  }
}

export function SubscriptionView({ user }: SubscriptionViewProps) {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Subscription</h2>
        <div className="flex items-center gap-4">
          <span
            className={`badge ${user.subscriptionStatus === "active"
              ? "badge-success"
              : user.subscriptionStatus === "trial"
                ? "bg-warning text-black"
                : "badge-ghost"
              }`}
          >
            {user.subscriptionStatus.charAt(0).toUpperCase() + user.subscriptionStatus.slice(1)}
          </span>
          {user.subscriptionEnd && (
            <span className="text-sm text-base-content/60" suppressHydrationWarning>
              {user.subscriptionStatus === "active" ? "Renews" : "Ends"}{" "}
              {format(new Date(user.subscriptionEnd), "MMMM d, yyyy")}
            </span>
          )}
        </div>

        <div className="divider"></div>

        <div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-bold">$5</span>
            <span className="text-base-content/60">/ year</span>
          </div>
          <button className="btn btn-ghost w-full gap-2">
            <CreditCardIcon className="h-5 w-5" />
            Manage Subscription
          </button>
          <p className="text-xs text-base-content/60 text-center mt-2">
            Powered by Stripe
          </p>
        </div>
      </div>
    </div>
  )
}
