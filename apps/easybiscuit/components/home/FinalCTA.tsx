import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="bg-amber-50 py-20">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Your business deserves better tools.
        </h2>
        <p className="mt-4 text-lg text-slate-600">
          Start free — no account, no card, no catch.
        </p>
        <Button asChild size="lg" className="mt-8 bg-amber-600 hover:bg-amber-700">
          <Link href="/tools">Browse all tools</Link>
        </Button>
      </div>
    </section>
  );
}
