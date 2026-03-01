"use client";

import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ExtensionAuthContent() {
  const { isLoaded, isSignedIn } = useAuth();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);

  const redirectUri = searchParams.get("redirect_uri");

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      const returnUrl = `/extension-auth${redirectUri ? `?redirect_uri=${encodeURIComponent(redirectUri)}` : ""}`;
      window.location.href = `/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`;
      return;
    }

    if (!redirectUri || !redirectUri.startsWith("chrome-extension://")) {
      setStatus("error");
      setError("Invalid redirect URI. Open this page from the Toolhaus extension.");
      return;
    }

    async function connect() {
      try {
        const res = await fetch("/api/pro/extension-auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ redirectUri }),
        });

        const data = await res.json();

        if (!res.ok) {
          setStatus("error");
          setError(data.error ?? "Failed to connect");
          return;
        }

        if (!redirectUri) return;
        const url = new URL(redirectUri);
        url.searchParams.set("token", data.token);
        url.searchParams.set("pro", data.isPro ? "true" : "false");
        window.location.href = url.toString();
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setError("Failed to connect your account.");
      }
    }

    connect();
  }, [isLoaded, isSignedIn, redirectUri]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-xl font-bold text-slate-900 mb-2">
          Connect to Toolhaus Extension
        </h1>

        {status === "loading" && (
          <p className="text-slate-600">Connecting your account...</p>
        )}

        {status === "success" && (
          <p className="text-green-600">Redirecting back to the extension...</p>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <p className="text-red-600">{error}</p>
            <Link
              href={
                redirectUri
                  ? `/sign-in?redirect_url=${encodeURIComponent(`/extension-auth?redirect_uri=${encodeURIComponent(redirectUri)}`)}`
                  : "/sign-in"
              }
              className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExtensionAuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><p>Loading...</p></div>}>
      <ExtensionAuthContent />
    </Suspense>
  );
}
