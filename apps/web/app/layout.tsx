import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Toolhaus — Developer utility tools hub",
    template: "%s — Toolhaus",
  },
  description:
    "Privacy-first developer utility tools. JSON formatter, Base64, UUID generator, timestamp converter, and 20+ more. All processing happens in your browser.",
  metadataBase: new URL("https://toolhaus.dev"),
  openGraph: {
    siteName: "Toolhaus",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
        >
          <NuqsAdapter>{children}</NuqsAdapter>
          <Script
            src="https://media.ethicalads.io/media/client/ethicalads.min.js"
            strategy="lazyOnload"
          />
          {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
            <Script
              defer
              data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
              src="https://plausible.io/js/script.js"
              strategy="afterInteractive"
            />
          )}
        </body>
      </html>
    </AuthProvider>
  );
}
