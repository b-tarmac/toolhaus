"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/shell/Navbar";
import { Footer } from "@/components/shell/Footer";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";

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
      <main className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-slate-900">Pricing</h1>
          <p className="mt-2 text-slate-500 font-medium">
            All tools are free. Pro removes ads and unlocks power features.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="tool-card">
            <h2 className="text-xl font-bold text-slate-900">Free</h2>
            <p className="text-3xl font-bold text-slate-900 mt-2">$0</p>
            <p className="text-sm text-slate-500 mt-1">
              All 25 tools, no sign-in required
            </p>
            <div className="mt-6 space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  All 25 tools
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  Shareable URLs
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  Privacy-first (client-side only)
                </li>
                <li className="flex items-center gap-2 text-slate-500">
                  <Check className="h-4 w-4" />
                  EthicalAds shown
                </li>
                <li className="flex items-center gap-2 text-slate-500">
                  <Check className="h-4 w-4" />
                  5MB max file upload
                </li>
              </ul>
              <Button asChild variant="outline" className="w-full">
                <Link href="/tools">Use Free</Link>
              </Button>
            </div>
          </div>

          <div className="tool-card border-2 border-[#4f46e5]/30">
            <h2 className="text-xl font-bold text-slate-900">Pro</h2>
              <div className="flex items-baseline gap-2">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setInterval("monthly")}
                    className={`rounded px-2 py-1 text-sm ${
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
                    className={`rounded px-2 py-1 text-sm ${
                      interval === "yearly"
                        ? "bg-slate-900 text-white"
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    Yearly
                  </button>
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {interval === "monthly" ? "$7/mo" : "$49/yr"}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {interval === "yearly" && "41% savings vs monthly"}
                {interval === "monthly" && "or $49/year (41% savings)"}
              </p>
            <div className="mt-6 space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  Everything in Free
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  No ads
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  Tool history (last 50)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  Saved snippets
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  50MB max file upload
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  API access
                </li>
              </ul>
              {isPro ? (
                <ManageSubscriptionButton />
              ) : (
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={!isLoaded || loading}
                  className="w-full px-8 py-4 text-base font-bold rounded-2xl text-white bg-gradient-to-r from-[#4f46e5] to-[#9333ea] hover:opacity-90 transition-all shadow-xl shadow-[#4f46e5]/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Get Pro"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
