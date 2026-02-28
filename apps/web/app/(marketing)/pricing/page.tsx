"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/shell/Navbar";
import { Footer } from "@/components/shell/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto max-w-4xl px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Pricing</h1>
          <p className="mt-2 text-muted-foreground">
            All tools are free. Pro removes ads and unlocks power features.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Free</h2>
              <p className="text-3xl font-bold">$0</p>
              <p className="text-sm text-muted-foreground">
                All 25 tools, no sign-in required
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Check className="h-4 w-4" />
                  EthicalAds shown
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Check className="h-4 w-4" />
                  5MB max file upload
                </li>
              </ul>
              <Button asChild variant="outline" className="w-full">
                <Link href="/tools">Use Free</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <h2 className="text-xl font-semibold">Pro</h2>
              <div className="flex items-baseline gap-2">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setInterval("monthly")}
                    className={`rounded px-2 py-1 text-sm ${
                      interval === "monthly"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterval("yearly")}
                    className={`rounded px-2 py-1 text-sm ${
                      interval === "yearly"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Yearly
                  </button>
                </div>
              </div>
              <p className="text-3xl font-bold">
                {interval === "monthly" ? "$7/mo" : "$49/yr"}
              </p>
              <p className="text-sm text-muted-foreground">
                {interval === "yearly" && "41% savings vs monthly"}
                {interval === "monthly" && "or $49/year (41% savings)"}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <Button
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={!isLoaded || loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Get Pro"
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
