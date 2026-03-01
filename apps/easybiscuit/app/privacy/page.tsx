import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <main id="main-content" className="max-w-3xl mx-auto px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-extrabold text-slate-900">Privacy</h1>
        <p className="mt-4 text-slate-600 leading-relaxed">
          EasyBiscuit is built with privacy first. All tool processing happens
          entirely in your browser. Your files and data never leave your
          device. We do not upload, store, or analyze the content you process
          with our tools.
        </p>
        <p className="mt-4 text-slate-600 leading-relaxed">
          When you create an account, we store only what&apos;s needed to
          provide the service: your email, subscription status, and usage
          counts for enforcing free-tier limits. We never see the actual content
          you process.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="text-amber-600 font-medium hover:underline"
          >
            ← Back to home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
