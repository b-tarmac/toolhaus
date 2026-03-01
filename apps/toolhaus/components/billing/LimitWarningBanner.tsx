"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock } from "lucide-react";

interface LimitWarningBannerProps {
  remaining: number;
  limit: number;
  toolName?: string;
}

/**
 * Inline banner for compute-heavy tools when usage limit is approaching or reached.
 * Shows inside the tool when remaining <= 1.
 */
export function LimitWarningBanner({
  remaining,
  limit,
  toolName = "this tool",
}: LimitWarningBannerProps) {
  const isReached = remaining === 0;

  if (remaining > 1) return null;

  return (
    <div
      className={`rounded-lg border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
        isReached
          ? "bg-red-50 border-red-200"
          : "bg-amber-50 border-amber-200"
      }`}
    >
      <div className="flex items-start gap-2">
        {isReached ? (
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
        ) : (
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
        )}
        <p className="text-sm text-slate-700">
          {isReached ? (
            <>
              You&apos;ve reached today&apos;s free limit for {toolName}. Come
              back tomorrow, or upgrade to Pro for unlimited access.
            </>
          ) : (
            <>
              {remaining} free use remaining today for {toolName}.{" "}
              <Link
                href="/pricing"
                className="font-medium underline hover:no-underline"
              >
                Upgrade to Pro for unlimited →
              </Link>
            </>
          )}
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        <Button asChild size="sm">
          <Link href="/pricing">Upgrade to Pro</Link>
        </Button>
        {isReached && (
          <Button asChild size="sm" variant="outline">
            <Link href="/tools">
              <Clock className="h-4 w-4 mr-1 inline" />
              Come back tomorrow
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
