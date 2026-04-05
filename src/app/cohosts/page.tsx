import type { Metadata } from "next";
import CohostApplyLanding from "@/components/marketing/cohost-apply-landing";

export const metadata: Metadata = {
  title: "Co-host operators — apply",
  description:
    "Apply to join Revolve Co-Hosts: qualified intros to Airbnb and short-let hosts from our tools and matching funnel. Intro credits, vetted supply, area and property-type fit.",
  openGraph: {
    title: "Apply as a co-host operator | Revolve Co-Hosts",
    description:
      "Get matched to hosts with real intent — not passive directory traffic. Apply to join the operator network.",
  },
};

export default function CohostsPage() {
  return <CohostApplyLanding />;
}
