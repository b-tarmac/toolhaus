import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "EasyBiscuit — Every tool your small business actually needs",
    template: "%s — EasyBiscuit",
  },
  description:
    "Privacy-first small business tools. Invoice generator, PDF tools, calculators, image tools, and more. All processing happens in your browser.",
  metadataBase: new URL("https://easybiscuit.co"),
  openGraph: {
    siteName: "EasyBiscuit",
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
          className={`${inter.variable} font-sans antialiased`}
        >
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          {children}
        </body>
      </html>
    </AuthProvider>
  );
}
