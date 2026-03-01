import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/shell/Navbar";
import { Footer } from "@/components/shell/Footer";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "Toolhaus privacy policy. Tool inputs never leave your browser. No server-side processing. GDPR-friendly.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <main id="main-content" className="max-w-2xl mx-auto px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-extrabold text-slate-900">Privacy</h1>
        <p className="mt-4 text-slate-500">
          Tool inputs never leave your browser. All tool processing happens
          client-side. We do not store, log, or transmit any content you paste
          into our tools.
        </p>
        <h2 className="mt-8 text-xl font-bold text-slate-900">
          Third-party services
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-500">
          <li>
            <strong>Clerk</strong> — Authentication. Stores account data only,
            no tool usage content.
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
            <strong>Stripe</strong> — Payments. Processes subscription
            payments.
          </li>
        </ul>

        <h2 className="mt-8 text-xl font-bold text-slate-900">Data retention</h2>
        <p className="mt-2 text-slate-500">
          Clerk retains account data until you delete your account. Stripe
          retains payment records as required for tax and compliance. Pro users:
          tool history and saved snippets are stored in Turso (libSQL) and
          retained until you delete them or cancel your subscription.
        </p>

        <h2 className="mt-8 text-xl font-bold text-slate-900">Your rights</h2>
        <p className="mt-2 text-slate-500">
          You may request access to, correction of, or deletion of your personal
          data. Pro users can delete history and snippets from the dashboard.
          To delete your account and associated data, use Clerk&apos;s account
          management or contact us.
        </p>

        <h2 className="mt-8 text-xl font-bold text-slate-900">Cookies</h2>
        <p className="mt-2 text-slate-500">
          We do not use cookies for analytics or tracking. Plausible and
          EthicalAds are configured to avoid cookies. Clerk and Stripe may set
          essential cookies for authentication and checkout.
        </p>

        <p className="mt-6 text-sm text-slate-500">
          For verification, our codebase is available on{" "}
          <Link
            href="https://github.com/toolhaus/toolhaus"
            className="font-semibold text-[#4f46e5] hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </Link>
          .
        </p>
      </main>
      <Footer />
    </div>
  );
}
