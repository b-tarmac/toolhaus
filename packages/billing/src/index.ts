import Stripe from "stripe";
import type { Client as DbClient } from "@libsql/client";

// ─── Stripe client factory ────────────────────────────────────────────────────

/**
 * Creates a lazily-initialised Stripe client via a Proxy so it can be
 * imported at module load time without throwing when env vars are absent
 * (e.g. during static generation).
 */
export function createStripeClient(secretKey: string): Stripe {
  return new Stripe(secretKey, { typescript: true });
}

/**
 * Returns a lazy Stripe proxy that defers key validation to first use.
 * Useful as a module-level singleton: `export const stripe = createStripeClientLazy(...)`.
 */
export function createStripeClientLazy(getKey: () => string): Stripe {
  let _client: Stripe | null = null;
  function get(): Stripe {
    if (!_client) {
      const key = getKey();
      if (!key || !key.startsWith("sk_")) {
        throw new Error("STRIPE_SECRET_KEY is not configured or invalid");
      }
      _client = new Stripe(key, { typescript: true });
    }
    return _client;
  }
  return new Proxy({} as Stripe, {
    get(_, prop) {
      return (get() as unknown as Record<string, unknown>)[prop as string];
    },
  });
}

// ─── Webhook verification ─────────────────────────────────────────────────────

export function constructWebhookEvent(
  stripe: Stripe,
  body: string,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(body, signature, secret);
}

// ─── Plan activation helpers (used in Stripe webhook handlers) ────────────────

/**
 * Upserts the user row to plan=pro and syncs the plan to Clerk publicMetadata.
 * Called after a successful checkout or subscription renewal.
 */
export async function activateProPlan(
  db: DbClient,
  clerkUserId: string,
  customerId: string,
  subscriptionId: string | null
): Promise<void> {
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

  const { clerkClient } = await import("@clerk/nextjs/server");
  const client = await clerkClient();
  await client.users.updateUserMetadata(clerkUserId, {
    publicMetadata: { plan: "pro" },
  });
}

/**
 * Downgrades the user to plan=free by Stripe customer ID.
 * Called after a subscription cancellation or payment failure.
 */
export async function deactivateProPlanByCustomerId(
  db: DbClient,
  customerId: string
): Promise<void> {
  const result = await db.execute({
    sql: "SELECT clerk_id FROM users WHERE stripe_customer_id = ?",
    args: [customerId],
  });

  if (result.rows.length === 0) return;

  const clerkId = result.rows[0].clerk_id as string;
  await db.execute({
    sql: `UPDATE users SET plan = 'free', stripe_subscription_id = NULL, updated_at = unixepoch()
          WHERE clerk_id = ?`,
    args: [clerkId],
  });

  const { clerkClient } = await import("@clerk/nextjs/server");
  const client = await clerkClient();
  await client.users.updateUserMetadata(clerkId, {
    publicMetadata: { plan: "free" },
  });
}

/**
 * Downgrades the user to plan=free by Clerk user ID.
 * Used when you have the clerkId from the webhook metadata.
 */
export async function deactivateProPlanByClerkId(
  db: DbClient,
  clerkUserId: string
): Promise<void> {
  await db.execute({
    sql: `UPDATE users SET plan = 'free', stripe_subscription_id = NULL, updated_at = unixepoch()
          WHERE clerk_id = ?`,
    args: [clerkUserId],
  });

  const { clerkClient } = await import("@clerk/nextjs/server");
  const client = await clerkClient();
  await client.users.updateUserMetadata(clerkUserId, {
    publicMetadata: { plan: "free" },
  });
}
