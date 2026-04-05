import type { Metadata } from "next";
import "./globals.css";
import { SITE_NAME } from "@/lib/site-brand";

const defaultDescription =
  "Match Airbnb hosts with proven co-hosts. Listing audits, income tools, and curated introductions.";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://revolvecohosts.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: defaultDescription,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_GB",
    title: SITE_NAME,
    description: defaultDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: defaultDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
