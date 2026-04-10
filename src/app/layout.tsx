import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "L&M Medical Solutions — Orthopedic Implants & Surgical Supplies",
    template: "%s | L&M Medical Solutions",
  },
  description:
    "Premium orthopedic implants and surgical supplies in Sudan. Screws, plates, fixators, nails, and complete systems for hospitals and surgeons.",
  metadataBase: new URL("https://lmmedicalsolutions.org"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://lmmedicalsolutions.org",
    siteName: "L&M Medical Solutions",
    title: "L&M Medical Solutions — Orthopedic Implants & Surgical Supplies",
    description:
      "Premium orthopedic implants and surgical supplies in Sudan. Screws, plates, fixators, nails, and complete systems for hospitals and surgeons.",
  },
  twitter: {
    card: "summary_large_image",
    title: "L&M Medical Solutions",
    description:
      "Premium orthopedic implants and surgical supplies in Sudan.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-EPKW1TYE35"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-EPKW1TYE35');
          `}
        </Script>
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
