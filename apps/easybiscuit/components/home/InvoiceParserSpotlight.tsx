import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function InvoiceParserSpotlight() {
  return (
    <section className="bg-slate-900 py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-sm font-medium text-amber-400">
              🔍 NEW
            </span>
            <h2 className="mt-6 text-3xl font-extrabold text-white sm:text-4xl">
              Parse any invoice in seconds.
            </h2>
            <p className="mt-2 text-xl text-slate-300">
              Your accountant will love you.
            </p>
            <p className="mt-6 text-slate-400 leading-relaxed">
              Upload an invoice PDF or photo — even a blurry photo of a paper
              invoice — and EasyBiscuit extracts every field automatically.
            </p>
            <p className="mt-4 text-slate-400 leading-relaxed">
              Vendor · Invoice number · Date · Due date · Line items · Subtotal ·
              Tax · Total
            </p>
            <p className="mt-4 text-slate-400 leading-relaxed">
              Download a clean spreadsheet ready to hand to your accountant.
              Process 50 invoices in one go with Pro.
            </p>
            <p className="mt-4 text-slate-400 leading-relaxed">
              And because your invoices contain sensitive financial data —
              supplier names, pricing, payment terms — they&apos;re processed
              entirely in your browser. Nothing is ever uploaded to a server.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700">
                <Link href="/tools/business/invoice-parser">
                  Try Invoice Parser <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white">
                <Link href="/tools/business/invoice-parser">Learn more</Link>
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="flex items-center gap-4 rounded-xl border border-slate-700 bg-slate-800/50 p-6">
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-32 w-40 flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-600 bg-slate-800">
                  <span className="text-4xl">📄</span>
                  <span className="mt-2 text-xs text-slate-500">
                    Your invoice
                  </span>
                </div>
              </div>
              <ArrowRight className="h-8 w-8 shrink-0 text-amber-500" />
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-32 w-40 flex-col items-center justify-center rounded-lg border border-slate-600 bg-slate-800 p-3">
                  <div className="w-full space-y-1.5 text-left">
                    <div className="h-2 w-full rounded bg-slate-600" />
                    <div className="h-2 w-3/4 rounded bg-slate-600" />
                    <div className="h-2 w-1/2 rounded bg-slate-600" />
                    <div className="h-2 w-full rounded bg-slate-600" />
                  </div>
                  <span className="mt-2 text-xs text-slate-500">
                    Extracted data
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
