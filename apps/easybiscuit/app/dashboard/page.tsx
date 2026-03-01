import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <main id="main-content" className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-extrabold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Your usage overview and recent history will appear here.
        </p>
        <div className="mt-8 flex gap-4">
          <Button asChild>
            <Link href="/tools">Browse tools</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/pricing">Manage billing</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
