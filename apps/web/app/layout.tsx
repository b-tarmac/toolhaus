import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
        <head>
          <link
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
            rel="stylesheet"
          />
        </head>
        <body
          className={`${plusJakartaSans.variable} ${geistMono.variable} font-sans antialiased`}
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
