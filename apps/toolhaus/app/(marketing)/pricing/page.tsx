"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/shell/Navbar";
import { Footer } from "@/components/shell/Footer";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Minus } from "lucide-react";

function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);
  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pro/billing-portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setLoading(false);
    } catch {
      setLoading(false);
    }
  };
  return (
    <Button
      className="w-full"
      variant="outline"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Manage Subscription"}
    </Button>
  );
}

export default function PricingPage() {
  const { user, isLoaded } = useAuth();
  const [interval, setInterval] = useState<"monthly" | "yearly">("yearly");
  const [loading, setLoading] = useState(false);

  const isPro = (user?.publicMetadata?.plan as string) === "pro";

  const handleCheckout = async () => {
    if (!user) {
      window.location.href = "/sign-up?redirect_url=/pricing";
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/pro/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Checkout failed");
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <main id="main-content" className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Toolhaus Pro — your tools, in your terminal.
          </h1>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            All tools are free. Create an account to save your work. Go Pro for CLI, batch, API, and more.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {/* Anonymous */}
          <div className="tool-card flex flex-col">
            <h2 className="text-xl font-bold text-slate-900">Anonymous</h2>
            <p className="text-sm text-slate-500 mt-1">No account</p>
            <p className="text-3xl font-bold text-slate-900 mt-4">$0</p>
            <ul className="mt-6 space-y-3 flex-1 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                All 25 tools
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                5 uses/day on compute tools
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                URL sharing
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                15MB uploads
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <Minus className="h-4 w-4 shrink-0" />
                History
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <Minus className="h-4 w-4 shrink-0" />
                Workspaces
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <Minus className="h-4 w-4 shrink-0" />
                CLI, API, Batch
              </li>
            </ul>
            <Button asChild variant="outline" className="w-full mt-6">
              <Link href="/tools">Get started</Link>
            </Button>
          </div>

          {/* Free Account */}
          <div className="tool-card flex flex-col">
            <h2 className="text-xl font-bold text-slate-900">Free Account</h2>
            <p className="text-sm text-slate-500 mt-1">Free forever</p>
            <p className="text-3xl font-bold text-slate-900 mt-4">$0</p>
            <ul className="mt-6 space-y-3 flex-1 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                All 25 tools
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                Unlimited uses
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                History (last 10 per tool)
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                1 workspace per tool
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                URL sharing
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                15MB uploads
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <Minus className="h-4 w-4 shrink-0" />
                CLI access
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <Minus className="h-4 w-4 shrink-0" />
                API access
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <Minus className="h-4 w-4 shrink-0" />
                Batch processing
              </li>
            </ul>
            <Button asChild variant="outline" className="w-full mt-6">
              <Link href={user ? "/dashboard" : "/sign-up?redirect_url=/pricing"}>
                {user ? "Go to Dashboard" : "Create free account"}
              </Link>
            </Button>
          </div>

          {/* Pro */}
          <div className="tool-card flex flex-col border-2 border-[#4f46e5]/30 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#4f46e5] to-[#9333ea] text-white text-xs font-bold">
              Pro
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">Pro</h2>
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => setInterval("monthly")}
                className={`rounded px-2 py-1 text-sm transition-colors ${
                  interval === "monthly"
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setInterval("yearly")}
                className={`rounded px-2 py-1 text-sm transition-colors ${
                  interval === "yearly"
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                Yearly
              </button>
              {interval === "yearly" && (
                <span className="ml-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-xs font-semibold">
                  Save 42%
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {interval === "monthly" ? "$7/mo" : "$49/yr"}
            </p>
            <p className="text-sm text-slate-500">
              {interval === "yearly" ? "≈ $4.08/mo" : "or $49/year — save 42%"}
            </p>
            <ul className="mt-6 space-y-3 flex-1 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                Everything in Free, plus:
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                CLI access
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                Batch processing
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                Unlimited workspaces
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                Persistent share links
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                API access (1K/day)
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                Unlimited history
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                100MB uploads
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                No ads
              </li>
            </ul>
            {isPro ? (
              <ManageSubscriptionButton />
            ) : (
              <button
                type="button"
                onClick={handleCheckout}
                disabled={!isLoaded || loading}
                className="w-full mt-6 px-8 py-4 text-base font-bold rounded-2xl text-white bg-gradient-to-r from-[#4f46e5] to-[#9333ea] hover:opacity-90 transition-all shadow-xl shadow-[#4f46e5]/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Go Pro"
                )}
              </button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
