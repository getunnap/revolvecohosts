import {
  deriveRegionLabel,
  estimatePortfolioRevenue,
  mergeFunnelAnswers,
  type MatchFunnelAnswers,
  type PrimaryGoalOption,
  type ManagementSituation,
} from "@/lib/match-funnel";
import type { IntroPublicSnapshot } from "./types";

function propertyTypeLabel(t: MatchFunnelAnswers["propertyType"]): string {
  const map = { flat: "Flat", house: "House", hmo_multi: "HMO / multi-unit" } as const;
  return t ? map[t] : "Property";
}

function bedroomLabel(b: MatchFunnelAnswers["bedroomCount"]): string {
  const map = { "1": "1", "2": "2", "3": "3", "4_plus": "4+" } as const;
  return b ? `${map[b]}-bed` : "";
}

function managementStage(m: ManagementSituation | undefined): string {
  if (m === "self") return "Live · self-managed";
  if (m === "cohost") return "Live · already using a co-host";
  if (m === "getting_started") return "Getting started / early stage";
  return "Not specified";
}

function goalLine(g: PrimaryGoalOption | undefined): string {
  if (g === "max_revenue") return "Prioritising revenue and pricing";
  if (g === "hands_off") return "Wants hands-off operations";
  if (g === "better_reviews") return "Prioritising guest experience and reviews";
  return "Exploring co-host support";
}

export function buildIntroPublicSnapshot(
  partialAnswers: Partial<MatchFunnelAnswers>,
  opts?: { matchReason?: string; operatorDisplayName?: string },
): IntroPublicSnapshot {
  const a = mergeFunnelAnswers(partialAnswers);
  const region = deriveRegionLabel(a);
  const type = propertyTypeLabel(a.propertyType);
  const beds = bedroomLabel(a.bedroomCount);
  const propertySummary = [beds, type.toLowerCase()].filter(Boolean).join(" · ") || type;
  const rev = estimatePortfolioRevenue(a);

  return {
    hostLabel: `Host · ${region}`,
    area: region,
    propertySummary,
    listingStage: managementStage(a.managementSituation),
    guestProfile: goalLine(a.primaryGoal),
    intent: `Looking for a co-host aligned with ${region} and ${propertySummary}. ${goalLine(a.primaryGoal)}.`,
    revenueProjection: {
      currency: rev.currency,
      monthlyLow: rev.monthlyLow,
      monthlyHigh: rev.monthlyHigh,
      headline: rev.headline,
    },
    matchReason: opts?.matchReason,
  };
}
