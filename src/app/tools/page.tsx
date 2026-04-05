import type { Metadata } from "next";
import ToolsLanding from "@/components/marketing/tools-landing";

const title = "Host tools | Airbnb audit, co-host matchmaking & income estimate | Revolve Co-Hosts";
const description =
  "In-depth guide to Revolve host tools: free Airbnb listing audit with optimisation insights, curated co-host matchmaking funnel, and a 12-month rental income estimate with co-host suggestions. How each path feeds vetted introductions.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "Airbnb host tools",
    "Airbnb listing audit",
    "Airbnb optimisation report",
    "co-host matchmaking",
    "short-term rental tools",
    "STR income estimate",
    "Revolve Co-Hosts",
  ],
  openGraph: {
    title,
    description,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function ToolsPage() {
  return <ToolsLanding />;
}
