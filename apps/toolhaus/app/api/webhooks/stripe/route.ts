import { headers } from "next/headers";
import { clerkClient } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import {
  constructWebhookEvent,
  activateProPlan,
  deactivateProPlanByCustomerId,
} from "@portfolio/billing";
import {
  sendProUpgradeWelcome,
  sendProCancellation,
  sendPaymentFailed,
} from "@/lib/email";
import type Stripe from "stripe";

async function getUserEmailAndName(clerkId: string): Promise<{
  email: string;
  firstName: string;
} | null> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(clerkId);
    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) return null;
    const firstName = user.firstName || user.username || "there";
    return { email, firstName };
  } catch {
    return null;
  }
}

async function getClerkIdFromCustomerId(customerId: string): Promise<string | null> {
  const result = await db.execute({
    sql: "SELECT clerk_id FROM users WHERE stripe_customer_id = ?",
    args: [customerId],
  });
  return (result.rows[0]?.clerk_id as string) ?? null;
}

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return Response.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return Response.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(stripe, body, signature, webhookSecret);
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

      await activateProPlan(
        db,
        clerkUserId,
        session.customer as string,
        session.subscription as string | null
      );

      const userInfo = await getUserEmailAndName(clerkUserId);
      if (userInfo) {
        sendProUpgradeWelcome(userInfo.email, userInfo.firstName).catch((e) =>
          console.error("Pro upgrade email failed:", e)
        );
      }
    } else if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const clerkId = await getClerkIdFromCustomerId(customerId);
      await deactivateProPlanByCustomerId(db, customerId);

      if (clerkId) {
        const userInfo = await getUserEmailAndName(clerkId);
        if (userInfo) {
          sendProCancellation(userInfo.email, userInfo.firstName).catch((e) =>
            console.error("Pro cancellation email failed:", e)
          );
        }
      }
    } else if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      const clerkId = await getClerkIdFromCustomerId(customerId);
      if (clerkId) {
        const userInfo = await getUserEmailAndName(clerkId);
        if (userInfo) {
          sendPaymentFailed(userInfo.email, userInfo.firstName).catch((e) =>
            console.error("Payment failed email failed:", e)
          );
        }
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return Response.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return Response.json({ received: true });
}
