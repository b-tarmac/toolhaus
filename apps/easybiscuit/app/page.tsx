import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { TrustBar } from "@/components/home/TrustBar";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { InvoiceParserSpotlight } from "@/components/home/InvoiceParserSpotlight";
import { PrivacySection } from "@/components/home/PrivacySection";
import { FeaturedToolsGrid } from "@/components/home/FeaturedToolsGrid";
import { PersonaGrid } from "@/components/home/PersonaGrid";
import { PricingTeaser } from "@/components/home/PricingTeaser";
import { FinalCTA } from "@/components/home/FinalCTA";
import { toolRegistry } from "@/lib/tools/registry";

export default function HomePage() {
  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <main id="main-content" className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl">
            Every tool your small business actually needs
          </h1>
          <p className="mt-6 text-lg text-slate-600">
            Invoice generator, PDF tools, calculators, image tools, and more.
            All processed in your browser — your files never leave your device.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700">
              <Link href="/tools">Browse all tools</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">View pricing</Link>
            </Button>
          </div>
          <TrustBar />
        </div>

        <section className="mt-24">
          <h2 className="text-center text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Everything your business needs, in one place
          </h2>
          <div className="mt-10">
            <CategoryGrid />
          </div>
        </section>

        <section className="mt-24 -mx-6 lg:-mx-8">
          <InvoiceParserSpotlight />
        </section>

        <section className="-mx-6 lg:-mx-8">
          <PrivacySection />
        </section>

        <section className="max-w-7xl mx-auto px-6 lg:px-8 mt-24">
          <h2 className="text-center text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Popular tools
          </h2>
          <p className="mt-2 text-center text-slate-600">
            Start with the tools small businesses reach for most
          </p>
          <div className="mt-10">
            <FeaturedToolsGrid />
          </div>
          <div className="mt-12 text-center">
            <Button asChild size="lg" variant="outline">
              <Link href="/tools">
                Browse all {toolRegistry.length} tools →
              </Link>
            </Button>
          </div>
        </section>

        <section className="mt-24">
          <h2 className="text-center text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Built for people who run their own show
          </h2>
          <div className="mt-10">
            <PersonaGrid />
          </div>
        </section>

        <section className="mt-24">
          <h2 className="text-center text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Free to start. Pro when you need more.
          </h2>
          <div className="mt-10">
            <PricingTeaser />
          </div>
        </section>

        <section className="mt-24 -mx-6 lg:-mx-8">
          <FinalCTA />
        </section>
      </main>
      <Footer />
    </div>
  );
}
