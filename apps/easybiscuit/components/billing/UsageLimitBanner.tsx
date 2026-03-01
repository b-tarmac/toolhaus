"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";

interface UsageLimitBannerProps {
  toolName: string;
  remaining: number;
  limit: number;
  tier: "anonymous" | "free";
}

export function UsageLimitBanner({
  toolName,
  remaining,
  limit,
  tier,
}: UsageLimitBannerProps) {
  if (remaining > 1) return null;

  const isAnonymous = tier === "anonymous";

  return (
    <div
      className={`mb-4 flex items-center gap-3 rounded-lg border px-4 py-3 ${
        remaining === 0
          ? "border-amber-300 bg-amber-50"
          : "border-amber-200 bg-amber-50/50"
      }`}
    >
      <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
      <p className="text-sm text-amber-900">
        {remaining === 0 ? (
          <>
            You&apos;ve used all {limit} free {toolName} uses today.
            {isAnonymous ? (
              <>
                {" "}
                <Link
                  href="/sign-up"
                  className="font-semibold underline hover:no-underline"
                >
                  Create a free account
                </Link>{" "}
                for more, or{" "}
                <Link
                  href="/pricing"
                  className="font-semibold underline hover:no-underline"
                >
                  upgrade to Pro
                </Link>{" "}
                for unlimited access.
              </>
            ) : (
              <>
                {" "}
                <Link
                  href="/pricing"
                  className="font-semibold underline hover:no-underline"
                >
                  Upgrade to Pro
                </Link>{" "}
                for unlimited access.
              </>
            )}
          </>
        ) : (
          <>
            You have 1 free {toolName} use left today.{" "}
            <Link
              href={isAnonymous ? "/sign-up" : "/pricing"}
              className="font-semibold underline hover:no-underline"
            >
              {isAnonymous ? "Create account" : "Upgrade to Pro"}
            </Link>{" "}
            for more.
          </>
        )}
      </p>
    </div>
  );
}
