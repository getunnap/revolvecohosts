import type { Metadata } from "next";
import MarketingLanding from "@/components/marketing/marketing-landing";

export const metadata: Metadata = {
  title: "Free Airbnb listing audit",
  description:
    "Instant Airbnb optimisation analysis: missed revenue, fixes, and actionable improvements for your listing.",
};

export default function AuditPage() {
  return <MarketingLanding />;
}
