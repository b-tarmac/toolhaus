import { Navbar } from "@/components/shell/Navbar";
import { Footer } from "@/components/shell/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-extrabold text-slate-900">Privacy</h1>
        <p className="mt-4 text-slate-500">
          Tool inputs never leave your browser. All tool processing happens
          client-side. We do not store, log, or transmit any content you paste
          into our tools.
        </p>
        <h2 className="mt-8 text-xl font-bold text-slate-900">Third-party services</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-500">
          <li>
            <strong>Clerk</strong> — Authentication. Stores account data only, no
            tool usage content.
          </li>
          <li>
            <strong>EthicalAds</strong> — Ad serving. No cookies, GDPR
            compliant.
          </li>
          <li>
            <strong>Plausible</strong> — Analytics. Privacy-respecting, no
            cookie banner needed.
          </li>
          <li>
            <strong>Stripe</strong> — Payments. Processes subscription payments.
          </li>
        </ul>
        <p className="mt-6 text-sm text-slate-500">
          For verification, our codebase is available on GitHub.
        </p>
      </main>
      <Footer />
    </div>
  );
}
