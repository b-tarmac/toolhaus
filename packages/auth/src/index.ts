import { useUser } from "@clerk/nextjs";

export type UserPlan = "free" | "pro";

export interface PlanMetadata {
  plan?: UserPlan;
  planExpiresAt?: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

/**
 * Client-side hook. Returns true if the signed-in user has an active Pro plan.
 * Reads plan from Clerk publicMetadata (synced by the Stripe webhook).
 * Must be used inside a ClerkProvider.
 */
export function useIsPro(): boolean {
  const { user } = useUser();
  const meta = user?.publicMetadata as PlanMetadata | undefined;
  if (meta?.plan !== "pro") return false;
  if (meta?.planExpiresAt && Date.now() / 1000 > meta.planExpiresAt) return false;
  return true;
}

/**
 * Derive isPro from a user object already in scope (no hook needed).
 * Works with any object that has a publicMetadata.plan field.
 */
export function getIsPro(
  user: { publicMetadata?: Record<string, unknown> } | null | undefined
): boolean {
  const meta = user?.publicMetadata as PlanMetadata | undefined;
  if (meta?.plan !== "pro") return false;
  if (meta?.planExpiresAt && Date.now() / 1000 > meta.planExpiresAt) return false;
  return true;
}
