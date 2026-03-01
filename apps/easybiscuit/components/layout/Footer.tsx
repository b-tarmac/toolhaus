"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-amber-100 bg-white/50 py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center">
            <span className="text-white text-lg">🍪</span>
          </div>
          <span className="font-extrabold text-sm tracking-tight text-slate-900">
            EasyBiscuit
          </span>
        </div>
        <nav className="flex gap-6">
          <Link
            href="/pricing"
            className="text-sm font-medium text-slate-500 hover:text-foreground transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/tools"
            className="text-sm font-medium text-slate-500 hover:text-foreground transition-colors"
          >
            All Tools
          </Link>
        </nav>
        <p className="text-sm font-medium text-slate-500">
          © {new Date().getFullYear()} EasyBiscuit. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
