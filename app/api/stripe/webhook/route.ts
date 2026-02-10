import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { authService, Timestamp } from "@/lib/grpc/client"
import { stripe } from "@/lib/stripe"
import logger from "@/lib/logger"

function getGrpcApiKey(): string {
  const key = process.env.GRPC_API_KEY
  if (!key) {
    throw new Error("GRPC_API_KEY environment variable is required")
  }
  return key
}

function dateToTimestamp(date: Date): Timestamp {
  const seconds = Math.floor(date.getTime() / 1000)
  const nanos = (date.getTime() % 1000) * 1000000
  return { seconds: seconds.toString(), nanos }
}

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
    logger.error({ error: err }, "Webhook signature verification failed")
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        if (userId) {
          await authService.updateUserSubscription(
            {
              userId,
              subscriptionStatus: "active",
              stripeCustomerId: session.customer as string,
            },
            getGrpcApiKey()
          )
        }
        break
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const userResponse = await authService.getUserByStripeCustomerId(
          { stripeCustomerId: customerId },
          getGrpcApiKey()
        )

        if (userResponse.user) {
          const status =
            subscription.status === "active"
              ? "active"
              : subscription.status === "trialing"
              ? "trial"
              : "inactive"

          // In Stripe SDK v20+, current_period_end is on subscription items
          const periodEnd = subscription.items.data[0]?.current_period_end

          await authService.updateUserSubscription(
            {
              userId: userResponse.user.id,
              subscriptionStatus: status,
              subscriptionEnd: periodEnd
                ? dateToTimestamp(new Date(periodEnd * 1000))
                : undefined,
            },
            getGrpcApiKey()
          )
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const userResponse = await authService.getUserByStripeCustomerId(
          { stripeCustomerId: customerId },
          getGrpcApiKey()
        )

        if (userResponse.user) {
          await authService.updateUserSubscription(
            {
              userId: userResponse.user.id,
              subscriptionStatus: "cancelled",
            },
            getGrpcApiKey()
          )
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error({
      error,
      eventType: event.type,
    }, "Webhook handler error")
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
