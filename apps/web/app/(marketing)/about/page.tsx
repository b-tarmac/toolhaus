import Link from "next/link";
import { Navbar } from "@/components/shell/Navbar";
import { Footer } from "@/components/shell/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-3xl font-bold">About Toolhaus</h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Toolhaus is a developer utility tools hub—a single branded destination
          hosting 25+ small, fast, privacy-first tools that developers use
          daily. Every tool runs entirely client-side; no server ever sees your
          data.
        </p>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          We believe developer tools should respect your privacy. That&apos;s why
          all processing happens in your browser. Share results via URL—no
          sign-in required for free tools.
        </p>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Toolhaus is monetised via EthicalAds for free users and a Pro
          subscription that removes ads and unlocks power features like tool
          history and larger file limits.
        </p>
        <p className="mt-6">
          <Link
            href="/tools"
            className="text-primary hover:underline"
          >
            Browse all tools →
          </Link>
        </p>
      </main>
      <Footer />
    </div>
  );
}
