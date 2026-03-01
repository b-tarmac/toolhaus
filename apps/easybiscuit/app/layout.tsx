import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";

const GTM_ID = "GTM-WZWZHPM8";

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
          <Script
            id="gtm"
            strategy="afterInteractive"
          >
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          {children}
        </body>
      </html>
    </AuthProvider>
  );
}
