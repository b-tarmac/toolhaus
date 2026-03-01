"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const ANON_USES_KEY = "toolhaus_anon_tool_uses";
const NUDGE_DISMISSED_KEY = "toolhaus_nudge_dismissed";

function getAnonUses(): number {
  if (typeof window === "undefined") return 0;
  const s = sessionStorage.getItem(ANON_USES_KEY);
  return s ? parseInt(s, 10) : 0;
}

function getDismissed(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(NUDGE_DISMISSED_KEY) === "1";
}

export function incrementAnonToolUses(): void {
  if (typeof window === "undefined") return;
  const current = getAnonUses();
  sessionStorage.setItem(ANON_USES_KEY, String(current + 1));
}

/**
 * Soft dismissable banner for anonymous users after 2 tool uses.
 * Shows once per session, dismissable.
 */
export function FreeAccountNudge() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (user) return;
    if (getDismissed()) return;
    if (getAnonUses() >= 2) {
      setVisible(true);
    }
  }, [mounted, user]);

  const handleDismiss = () => {
    sessionStorage.setItem(NUDGE_DISMISSED_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 text-white px-4 py-3 shadow-lg flex items-center justify-between gap-4">
      <p className="text-sm">
        💾 Create a free account to save your history and get more daily uses.
      </p>
      <div className="flex items-center gap-2 shrink-0">
        <Button asChild size="sm" variant="secondary">
          <Link href="/sign-up?redirect_url=/pricing">Create free account</Link>
        </Button>
        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 rounded hover:bg-slate-700 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
