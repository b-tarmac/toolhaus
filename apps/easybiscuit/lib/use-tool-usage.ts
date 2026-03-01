"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

interface UsageState {
  allowed: boolean;
  used: number;
  limit: number | null;
  remaining: number | null;
  shouldPrompt: boolean;
  tier: "anonymous" | "free" | "pro";
  loading: boolean;
}

export function useToolUsage(toolSlug: string) {
  const { user } = useAuth();
  const isPro = (user?.publicMetadata?.plan as string) === "pro";
  const [usage, setUsage] = useState<UsageState>({
    allowed: true,
    used: 0,
    limit: null,
    remaining: null,
    shouldPrompt: false,
    tier: user ? "free" : "anonymous",
    loading: true,
  });
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const checkUsage = useCallback(async () => {
    const res = await fetch("/api/usage/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toolSlug }),
    });
    const data = await res.json();
    setUsage((prev) => ({
      ...prev,
      ...data,
      loading: false,
    }));
    return data;
  }, [toolSlug]);

  useEffect(() => {
    checkUsage();
  }, [checkUsage]);

  const recordUsage = useCallback(async () => {
    await fetch("/api/usage/record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toolSlug }),
    });
    await checkUsage();
  }, [toolSlug, checkUsage]);

  const performWithUsageCheck = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | null> => {
      if (usage.loading) return null;
      if (isPro) {
        const result = await fn();
        return result;
      }
      if (!usage.allowed) {
        setShowUpgradePrompt(true);
        return null;
      }
      const result = await fn();
      await recordUsage();
      return result;
    },
    [usage.loading, usage.allowed, isPro, recordUsage]
  );

  return {
    ...usage,
    isPro,
    checkUsage,
    recordUsage,
    performWithUsageCheck,
    showUpgradePrompt,
    setShowUpgradePrompt,
  };
}
