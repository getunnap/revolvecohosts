import type { MatchFunnelAnswers } from "@/lib/match-funnel";

/** Safe for co-host inbox before accept (no exact address, listing URL, or host contact). */
export type IntroPublicSnapshot = {
  hostLabel: string;
  area: string;
  propertySummary: string;
  listingStage: string;
  guestProfile: string;
  intent: string;
  revenueProjection?: {
    currency: "GBP";
    monthlyLow: number;
    monthlyHigh: number;
    headline: string;
  };
  matchReason?: string;
};

export type HostIntroRequestSourceTool = "find_cohost" | "income_estimate" | "audit";

export type CreateIntroRequestBody = {
  catalogOperatorId: string;
  hostRequestCohortId: string;
  sourceTool: HostIntroRequestSourceTool;
  funnelAnswers: Partial<MatchFunnelAnswers>;
  phone?: string;
  listingUrl?: string;
  hostNotes?: string;
};
