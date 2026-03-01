"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ProUpsellCard() {
  return (
    <div className="tool-card mt-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-[#9333ea]">lock</span>
        <span className="text-sm font-bold text-slate-900">Upgrade to Pro</span>
      </div>
      <p className="text-xs text-slate-500 mb-3">
        Remove ads, unlock tool history, larger file limits, and more.
      </p>
      <p className="text-sm font-bold text-slate-900 mb-4">$7/mo or $49/yr</p>
      <Button asChild size="sm" className="w-full">
        <Link href="/pricing">View Plans</Link>
      </Button>
    </div>
  );
}
