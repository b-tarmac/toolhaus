"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

const UserButton = dynamic(
  () => import("@clerk/nextjs").then((m) => ({ default: m.UserButton })),
  { ssr: false }
);

export function Navbar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-amber-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="text-white text-2xl">🍪</span>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              EasyBiscuit
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:space-x-4">
            <Link
              href="/tools"
              className="text-sm font-semibold text-slate-600 hover:text-amber-600 transition-colors hidden sm:block"
            >
              All Tools
            </Link>

            {!user ? (
              <>
                <Link
                  href="/sign-in"
                  className="text-sm font-semibold text-slate-600 hover:text-amber-600 transition-colors hidden sm:block"
                >
                  Sign In
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center px-6 py-2.5 text-sm font-bold rounded-full text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-md hover:shadow-amber-500/25 active:scale-95"
                >
                  Go Pro
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/pricing"
                  className="inline-flex items-center px-6 py-2.5 text-sm font-bold rounded-full text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-md hover:shadow-amber-500/25 active:scale-95"
                >
                  Go Pro
                </Link>
                <Link
                  href="/dashboard"
                  className="text-sm font-semibold text-slate-600 hover:text-amber-600 transition-colors hidden sm:block"
                >
                  Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
