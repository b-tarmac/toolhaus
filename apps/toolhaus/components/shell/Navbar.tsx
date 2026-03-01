"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/auth-context";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommandPalette } from "./CommandPalette";

const UserButton = dynamic(
  () => import("@clerk/nextjs").then((m) => ({ default: m.UserButton })),
  { ssr: false }
);

export function Navbar() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4f46e5] to-[#9333ea] flex items-center justify-center shadow-lg shadow-[#4f46e5]/20">
                <span className="material-symbols-outlined text-white text-[22px]">
                  handyman
                </span>
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                Toolhaus
              </span>
            </Link>

            <div className="flex items-center gap-2 sm:space-x-4">
              <Link
                href="/tools"
                className="text-sm font-semibold text-slate-600 hover:text-[#4f46e5] transition-colors hidden sm:block"
              >
                All Tools
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaletteOpen(true)}
                className="gap-2 text-slate-600 hover:text-[#4f46e5] border-slate-200"
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Search tools</span>
                <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:inline-flex">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>

              {!user ? (
                <>
                  <Link
                    href="/sign-in"
                    className="text-sm font-semibold text-slate-600 hover:text-[#4f46e5] transition-colors hidden sm:block"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center px-6 py-2.5 text-sm font-bold rounded-full text-white bg-slate-900 hover:bg-[#9333ea] transition-all shadow-md hover:shadow-[#9333ea]/25 active:scale-95"
                  >
                    Go Pro
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center px-6 py-2.5 text-sm font-bold rounded-full text-white bg-slate-900 hover:bg-[#9333ea] transition-all shadow-md hover:shadow-[#9333ea]/25 active:scale-95"
                  >
                    Go Pro
                  </Link>
                  {(user?.publicMetadata?.plan as string) === "pro" && (
                    <Link
                      href="/api-docs"
                      className="text-sm font-semibold text-slate-600 hover:text-[#4f46e5] transition-colors hidden sm:block"
                    >
                      API
                    </Link>
                  )}
                  {(user?.publicMetadata?.plan as string) === "pro" && (
                    <Link
                      href="/dashboard/share-links"
                      className="text-sm font-semibold text-slate-600 hover:text-[#4f46e5] transition-colors hidden sm:block"
                    >
                      Share Links
                    </Link>
                  )}
                  <Link
                    href="/dashboard/workspaces"
                    className="text-sm font-semibold text-slate-600 hover:text-[#4f46e5] transition-colors hidden sm:block"
                  >
                    Workspaces
                  </Link>
                  <Link
                    href="/dashboard"
                    className="text-sm font-semibold text-slate-600 hover:text-[#4f46e5] transition-colors hidden sm:block"
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

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </>
  );
}
