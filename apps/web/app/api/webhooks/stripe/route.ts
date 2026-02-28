import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return Response.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return Response.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe webhook signature verification failed:", message);
    return Response.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const clerkUserId = session.metadata?.clerkUserId as string | undefined;

      if (!clerkUserId) {
        console.error("checkout.session.completed: missing clerkUserId in metadata");
        return Response.json({ received: true });
      }

      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string | null;

      await db.execute({
        sql: `INSERT INTO users (clerk_id, plan, stripe_customer_id, stripe_subscription_id, created_at, updated_at)
              VALUES (?, 'pro', ?, ?, unixepoch(), unixepoch())
              ON CONFLICT(clerk_id) DO UPDATE SET
                plan = 'pro',
                stripe_customer_id = excluded.stripe_customer_id,
                stripe_subscription_id = excluded.stripe_subscription_id,
                updated_at = unixepoch()`,
        args: [clerkUserId, customerId, subscriptionId ?? null],
      });

      await (await clerkClient()).users.updateUserMetadata(clerkUserId, {
        publicMetadata: { plan: "pro" },
      });
    } else if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const result = await db.execute({
        sql: "SELECT clerk_id FROM users WHERE stripe_customer_id = ?",
        args: [customerId],
      });

      if (result.rows.length > 0) {
        const clerkId = result.rows[0].clerk_id as string;
        await db.execute({
          sql: `UPDATE users SET plan = 'free', stripe_subscription_id = NULL, updated_at = unixepoch() WHERE clerk_id = ?`,
          args: [clerkId],
        });
        await (await clerkClient()).users.updateUserMetadata(clerkId, {
          publicMetadata: { plan: "free" },
        });
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return Response.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return Response.json({ received: true });
}
