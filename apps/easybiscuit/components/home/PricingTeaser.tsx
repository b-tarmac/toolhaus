import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export function PricingTeaser() {
  return (
    <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
      <div className="rounded-2xl border border-amber-200 bg-white p-8">
        <h3 className="text-xl font-bold text-slate-900">Free</h3>
        <ul className="mt-6 space-y-3 text-sm text-slate-600">
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            All tools
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            No account needed
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            5 uses/day on paid tools
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            Calculators free always
          </li>
        </ul>
        <Button asChild variant="outline" className="mt-8 w-full">
          <Link href="/tools">Start for free</Link>
        </Button>
      </div>

      <div className="rounded-2xl border-2 border-amber-500 bg-amber-50/30 p-8 relative">
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white">
          ⭐
        </span>
        <h3 className="text-xl font-bold text-slate-900">Pro</h3>
        <p className="mt-2 text-2xl font-extrabold text-slate-900">
          $12/mo · $79/yr
        </p>
        <ul className="mt-6 space-y-3 text-sm text-slate-600">
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            Everything in Free
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            Unlimited operations
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            Batch invoice parsing
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            Saved client profiles
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            Document library
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            100MB file uploads
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            No ads
          </li>
        </ul>
        <Button asChild className="mt-8 w-full bg-amber-600 hover:bg-amber-700">
          <Link href="/pricing">Go Pro</Link>
        </Button>
      </div>
    </div>
  );
}
