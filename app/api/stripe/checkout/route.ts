import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { authService } from "@/lib/grpc/client"
import { stripe, STRIPE_PRICE_ID } from "@/lib/stripe"

const GRPC_API_KEY = process.env.GRPC_API_KEY || ""

export async function POST() {
  if (!stripe || !STRIPE_PRICE_ID) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 })
  }

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const userResponse = await authService.getUser(
      { userId: session.user.id },
      GRPC_API_KEY
    )
    const user = userResponse.user

    let customerId = user.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: { userId: user.id },
      })
      customerId = customer.id

      await authService.updateUserSubscription(
        {
          userId: user.id,
          subscriptionStatus: user.subscriptionStatus,
          stripeCustomerId: customerId,
        },
        GRPC_API_KEY
      )
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
      mode: "subscription",
      success_url: `${process.env.AUTH_URL}/settings?subscription=success`,
      cancel_url: `${process.env.AUTH_URL}/settings?subscription=cancelled`,
      metadata: { userId: user.id },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 })
  }
}
