"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="container px-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-6">
            <Link
              href="/about"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              About
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Pricing
            </Link>
            <Link
              href="/tools"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              All Tools
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Toolhaus. All processing happens in your
            browser.
          </p>
        </div>
      </div>
    </footer>
  );
}
