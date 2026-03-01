"use client";

import { ClerkProvider, useUser } from "@clerk/nextjs";
import { AuthContext } from "@/lib/auth-context";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const hasValidClerkKey =
  publishableKey &&
  !publishableKey.includes("placeholder") &&
  (publishableKey.startsWith("pk_test_") || publishableKey.startsWith("pk_live_"));

function ClerkAuthSync({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoaded }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (hasValidClerkKey) {
    return (
      <ClerkProvider publishableKey={publishableKey}>
        <ClerkAuthSync>{children}</ClerkAuthSync>
      </ClerkProvider>
    );
  }
  return (
    <AuthContext.Provider value={{ user: null, isLoaded: true }}>
      {children}
    </AuthContext.Provider>
  );
}
