import type { Metadata } from "next";
import HomeLanding from "@/components/marketing/home-landing";

const siteTitle = "Revolve Co-Hosts | Airbnb co-host matching & host tools";
const siteDesc =
  "Curated co-host matching for Airbnb and short-term rental hosts. Free listing audit, co-host matchmaking funnel, and vetted operator introductions - not a passive directory.";

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDesc,
  keywords: [
    "Airbnb co-host",
    "co-host matching",
    "short-term rental co-host",
    "Airbnb listing audit",
    "holiday let co-host",
    "STR property management",
    "curated co-host introductions",
    "Revolve Co-Hosts",
  ],
  openGraph: {
    title: siteTitle,
    description: siteDesc,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDesc,
  },
};

export default function Home() {
  return <HomeLanding />;
}
