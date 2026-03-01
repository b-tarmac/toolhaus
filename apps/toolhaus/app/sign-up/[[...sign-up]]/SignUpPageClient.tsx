"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const SignUp = dynamic(
  () => import("@clerk/nextjs").then((m) => ({ default: m.SignUp })),
  { ssr: false }
);

const hasValidClerkKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("placeholder");

export function SignUpPageClient() {
  if (!hasValidClerkKey) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">
          Sign-up is not configured. Add Clerk keys to .env.local
        </p>
        <Link href="/" className="text-primary hover:underline">
          Return home
        </Link>
      </div>
    );
  }
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp />
    </div>
  );
}
