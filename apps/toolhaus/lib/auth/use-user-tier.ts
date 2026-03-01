"use client";

import { useAuth } from "@/lib/auth-context";
import type { UserTier } from "./tier";

/**
 * Client-side: get the current user's tier from publicMetadata.
 * Use in client components. Falls back to server-synced metadata.
 */
export function useUserTier(): UserTier {
  const { user } = useAuth();
  const meta = user?.publicMetadata as
    | { plan?: string; planExpiresAt?: number }
    | undefined;

  if (!user) return "anonymous";
  if (meta?.plan !== "pro") return "free";
  if (meta?.planExpiresAt && Date.now() / 1000 > meta.planExpiresAt)
    return "free";
  return "pro";
}
