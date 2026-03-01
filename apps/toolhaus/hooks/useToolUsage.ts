"use client";

import { useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useSessionId } from "./useSessionId";
import { incrementAnonToolUses } from "@/components/billing/FreeAccountNudge";

interface CheckResult {
  allowed: boolean;
  remaining: number | null;
  used?: number;
  limit?: number;
  tier?: string;
}

/**
 * Hook for tools with usage limits. Returns checkAndRecord which:
 * 1. Checks if the user is allowed to use the tool
 * 2. If allowed, records the usage (fire-and-forget)
 * 3. Returns { allowed, remaining }
 * Also increments anonymous use count for FreeAccountNudge.
 */
export function useToolUsage(toolSlug: string) {
  const sessionId = useSessionId();
  const { user } = useAuth();

  const checkAndRecord = useCallback(async (): Promise<CheckResult> => {
    const check = await fetch("/api/usage/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toolSlug, sessionId }),
    }).then((r) => r.json());

    if (check.allowed) {
      fetch("/api/usage/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolSlug, sessionId }),
      }).catch(() => {});
      if (!user) {
        incrementAnonToolUses();
      }
    }

    return {
      allowed: check.allowed ?? true,
      remaining: check.remaining ?? null,
      used: check.used,
      limit: check.limit,
      tier: check.tier,
    };
  }, [toolSlug, sessionId, user]);

  const checkOnly = useCallback(async (): Promise<CheckResult> => {
    const check = await fetch("/api/usage/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toolSlug, sessionId }),
    }).then((r) => r.json());

    return {
      allowed: check.allowed ?? true,
      remaining: check.remaining ?? null,
      used: check.used,
      limit: check.limit,
      tier: check.tier,
    };
  }, [toolSlug, sessionId]);

  return { checkAndRecord, checkOnly };
}
