import {
  estimatePortfolioRevenue,
  type EstimatedMonthlyRevenueBand,
  type FunnelBedroomOption,
  type MatchCard,
  type MatchFunnelAnswers,
  type PropertyTypeOption,
} from "@/lib/match-funnel";

/** How much of the year the listing is realistically available to guests */
export type AvailabilityForLetting =
  | "year_round"
  | "mostly"
  | "partial"
  | "seasonal";

export type IncomeEstimateAnswers = {
  propertyAddress: string;
  propertyAddressPlaceId?: string;
  propertyType?: PropertyTypeOption;
  bedroomCount?: FunnelBedroomOption;
  availabilityForLetting: AvailabilityForLetting;
  estimatedMonthlyRevenueBand?: EstimatedMonthlyRevenueBand;
  email: string;
};

export type IncomeReasoningItem = {
  title: string;
  detail: string;
};

export type TwelveMonthIncomeEstimate = {
  currency: "GBP";
  annualLow: number;
  annualHigh: number;
  annualMid: number;
  /** Monthly gross after availability factor (for context next to annual) */
  monthlyLowAdjusted: number;
  monthlyHighAdjusted: number;
  monthlyMidAdjusted: number;
  headline: string;
  disclaimer: string;
  reasoning: IncomeReasoningItem[];
  availabilityLabel: string;
};

const DEFAULT_INCOME_ANSWERS: IncomeEstimateAnswers = {
  propertyAddress: "",
  availabilityForLetting: "year_round",
  email: "",
};

function availabilityFactor(a: AvailabilityForLetting): number {
  switch (a) {
    case "year_round":
      return 1;
    case "mostly":
      return 0.9;
    case "partial":
      return 0.65;
    case "seasonal":
      return 0.45;
    default:
      return 1;
  }
}

function availabilityLabel(a: AvailabilityForLetting): string {
  switch (a) {
    case "year_round":
      return "Year-round — available most weeks";
    case "mostly":
      return "Mostly open — a few weeks blocked per year";
    case "partial":
      return "Part of the year — regular blockouts or mixed use";
    case "seasonal":
      return "Seasonal or short windows only";
    default:
      return "—";
  }
}

function propertyTypeLabel(t: PropertyTypeOption | undefined): string {
  const map: Record<PropertyTypeOption, string> = {
    flat: "Flat / apartment",
    house: "House",
    hmo_multi: "HMO / multi-unit",
  };
  return t ? map[t] : "Not specified";
}

function bedroomLabel(b: FunnelBedroomOption | undefined): string {
  const map: Record<FunnelBedroomOption, string> = {
    "1": "1 bedroom",
    "2": "2 bedrooms",
    "3": "3 bedrooms",
    "4_plus": "4+ bedrooms",
  };
  return b ? map[b] : "Not specified";
}

function revenueBandLabel(b: EstimatedMonthlyRevenueBand | undefined): string {
  if (!b) return "Not provided — range from size and type only";
  const map: Record<EstimatedMonthlyRevenueBand, string> = {
    zero_2_5k: "£0 – £2.5k / month",
    "2_5k_5k": "£2.5k – £5k / month",
    over_5k: "£5k+ / month",
  };
  return map[b];
}

/** Map income tool answers into the shared match funnel shape for co-host mock matching */
export function incomeAnswersToMatchFunnel(a: IncomeEstimateAnswers): MatchFunnelAnswers {
  return {
    propertyAddress: a.propertyAddress,
    propertyAddressPlaceId: a.propertyAddressPlaceId,
    propertyType: a.propertyType,
    bedroomCount: a.bedroomCount,
    managementSituation: "self",
    primaryGoal: "max_revenue",
    estimatedMonthlyRevenueBand: a.estimatedMonthlyRevenueBand,
    email: a.email,
  };
}

export function mergeIncomeEstimateAnswers(
  parsed: Partial<IncomeEstimateAnswers>,
): IncomeEstimateAnswers {
  const availability = parsed.availabilityForLetting;
  const validAvailability: AvailabilityForLetting =
    availability === "year_round" ||
    availability === "mostly" ||
    availability === "partial" ||
    availability === "seasonal"
      ? availability
      : DEFAULT_INCOME_ANSWERS.availabilityForLetting;

  return {
    ...DEFAULT_INCOME_ANSWERS,
    ...parsed,
    availabilityForLetting: validAvailability,
  };
}

function roundToStep(n: number, step: number): number {
  return Math.round(n / step) * step;
}

/**
 * Indicative 12-month gross booking total from property + availability + optional revenue band.
 * Uses the same baseline monthly band as the match funnel, scaled by how open the calendar is.
 */
export function estimateTwelveMonthIncome(a: IncomeEstimateAnswers): TwelveMonthIncomeEstimate {
  const funnel = incomeAnswersToMatchFunnel(a);
  const monthly = estimatePortfolioRevenue(funnel);
  const f = availabilityFactor(a.availabilityForLetting);

  const monthlyLowAdj = roundToStep(monthly.monthlyLow * f, 25);
  const monthlyHighAdj = roundToStep(Math.max(monthly.monthlyHigh * f, monthlyLowAdj + 50), 25);
  const monthlyMidAdj = roundToStep((monthlyLowAdj + monthlyHighAdj) / 2, 25);

  const annualLow = roundToStep(monthlyLowAdj * 12, 100);
  const annualHigh = roundToStep(monthlyHighAdj * 12, 100);
  const annualMid = roundToStep((annualLow + annualHigh) / 2, 50);

  const reasoning: IncomeReasoningItem[] = [
    {
      title: "Market-style baseline from your property",
      detail: `We start from a typical UK short-let gross band for ${propertyTypeLabel(a.propertyType)} with ${bedroomLabel(a.bedroomCount)}. This mirrors how we size deals in the matchmaking flow — it is not a formal valuation.`,
    },
    {
      title: "Your calendar availability",
      detail: `${availabilityLabel(a.availabilityForLetting)} scales annual gross down when the home is not bookable year-round (personal use, long tenants, or seasonal-only letting).`,
    },
    {
      title: "Optional revenue anchor",
      detail: a.estimatedMonthlyRevenueBand
        ? `You told us bookings are around ${revenueBandLabel(a.estimatedMonthlyRevenueBand)}; we blend that with size and type so the band is not only theoretical.`
        : "You skipped a monthly bracket — the range leans on bedrooms and property type. Add a bracket next time if you want it tighter.",
    },
    {
      title: "What this is not",
      detail:
        "Figures are indicative gross bookings before platform fees, cleaning, tax, or a co-host revenue share. Local rules, ADR, and occupancy can move real results a lot.",
    },
  ];

  return {
    currency: "GBP",
    annualLow,
    annualHigh,
    annualMid,
    monthlyLowAdjusted: monthlyLowAdj,
    monthlyHighAdjusted: monthlyHighAdj,
    monthlyMidAdjusted: monthlyMidAdj,
    headline: "Estimated gross over the next 12 months",
    disclaimer:
      "Indicative only — not financial, tax, or legal advice. Use with your own numbers and a co-host conversation before you decide.",
    reasoning,
    availabilityLabel: availabilityLabel(a.availabilityForLetting),
  };
}

export type IncomeEstimateResultsPayload = {
  matches: MatchCard[];
  twelveMonth: TwelveMonthIncomeEstimate;
};
