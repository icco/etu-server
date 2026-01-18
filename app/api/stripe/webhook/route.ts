import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { db } from "@/lib/db"
import { stripe } from "@/lib/stripe"

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 })
  }

  const body = await req.text()
  const sig = req.headers.get("stripe-signature")
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        if (userId) {
          await db.user.update({
            where: { id: userId },
            data: {
              subscriptionStatus: "active",
              stripeCustomerId: session.customer as string,
            },
          })
        }
        break
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const user = await db.user.findUnique({
          where: { stripeCustomerId: customerId },
        })

        if (user) {
          const status =
            subscription.status === "active"
              ? "active"
              : subscription.status === "trialing"
              ? "trial"
              : "inactive"

          await db.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus: status,
              subscriptionEnd: subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000)
                : null,
            },
          })
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const user = await db.user.findUnique({
          where: { stripeCustomerId: customerId },
        })

        if (user) {
          await db.user.update({
            where: { id: user.id },
            data: { subscriptionStatus: "cancelled", subscriptionEnd: null },
          })
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
