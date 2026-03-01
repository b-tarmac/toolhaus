"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";

function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);
  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setLoading(false);
    } catch {
      setLoading(false);
    }
  };
  return (
    <Button
      className="w-full bg-amber-600 hover:bg-amber-700"
      variant="default"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        "Manage Subscription"
      )}
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
      const res = await fetch("/api/stripe/checkout", {
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
      <main id="main-content" className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold text-slate-900">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Start free. Upgrade to Pro when you need unlimited access.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-amber-200 bg-white p-8">
            <h2 className="text-xl font-bold text-slate-900">Free</h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">$0</p>
            <p className="mt-4 text-slate-600">
              Try every tool with daily limits. No account required.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" />
                All tools available
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" />
                Processed in your browser
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" />
                Daily usage limits
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" />
                Create account for more uses
              </li>
            </ul>
            <Button asChild variant="outline" className="mt-8 w-full">
              <Link href="/tools">Browse tools</Link>
            </Button>
          </div>

          <div className="rounded-2xl border-2 border-amber-500 bg-amber-50/30 p-8 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              Best value
            </span>
            <h2 className="text-xl font-bold text-slate-900">Pro</h2>
            <div className="flex gap-1 mt-2">
              <button
                type="button"
                onClick={() => setInterval("monthly")}
                className={`rounded px-2 py-1 text-sm ${
                  interval === "monthly"
                    ? "bg-amber-600 text-white"
                    : "text-slate-500 hover:bg-amber-100"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setInterval("yearly")}
                className={`rounded px-2 py-1 text-sm ${
                  interval === "yearly"
                    ? "bg-amber-600 text-white"
                    : "text-slate-500 hover:bg-amber-100"
                }`}
              >
                Yearly
              </button>
            </div>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">
              {interval === "monthly" ? "$12" : "$79"}{" "}
              <span className="text-base font-normal text-slate-500">
                /{interval === "monthly" ? "mo" : "year"}
              </span>
            </p>
            {interval === "yearly" && (
              <p className="mt-1 text-sm text-slate-600">
                $6.58/month billed annually
              </p>
            )}
            <p className="mt-4 text-slate-600">
              Unlimited access to all tools. No ads. No limits.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" />
                Unlimited tool usage
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" />
                Saved client profiles
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" />
                Invoice templates
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" />
                Batch processing
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" />
                Priority support
              </li>
            </ul>
            {isPro ? (
              <ManageSubscriptionButton />
            ) : (
              <Button
                className="mt-8 w-full bg-amber-600 hover:bg-amber-700"
                onClick={handleCheckout}
                disabled={!isLoaded || loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Upgrade to Pro"
                )}
              </Button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
