import { INCOME_ESTIMATE_RESULTS_KEY, MATCH_RESULTS_KEY } from "@/lib/client-storage";

export type PropertyTypeOption = "flat" | "house" | "hmo_multi";
export type FunnelBedroomOption = "1" | "2" | "3" | "4_plus";
export type ManagementSituation = "self" | "cohost" | "getting_started";
export type PrimaryGoalOption = "max_revenue" | "hands_off" | "better_reviews";
export type EstimatedMonthlyRevenueBand = "zero_2_5k" | "2_5k_5k" | "over_5k";

export type MatchFunnelAnswers = {
  /** Full formatted address (from Google Places or typed) */
  propertyAddress: string;
  propertyAddressPlaceId?: string;
  propertyType?: PropertyTypeOption;
  bedroomCount?: FunnelBedroomOption;
  managementSituation?: ManagementSituation;
  primaryGoal?: PrimaryGoalOption;
  /** Optional — host’s rough monthly gross bracket */
  estimatedMonthlyRevenueBand?: EstimatedMonthlyRevenueBand;
  email: string;
};

export type RevenueBreakdownItem = {
  label: string;
  yourAnswer: string;
  applies: string;
};

export type PortfolioRevenueEstimate = {
  currency: "GBP";
  monthlyLow: number;
  monthlyHigh: number;
  monthlyMid: number;
  headline: string;
  disclaimer: string;
  breakdown: RevenueBreakdownItem[];
  modelSummary: string;
};

export type CohostServiceIcon =
  | "home"
  | "coins"
  | "calendar"
  | "messages"
  | "key"
  | "spray"
  | "camera"
  | "armchair"
  | "clipboard"
  | "sparkles";

export type CohostProfileService = {
  icon: CohostServiceIcon;
  title: string;
  description: string;
};

export type CohostAchievementIcon = "award" | "medal";

export type CohostAchievement = {
  icon: CohostAchievementIcon;
  title: string;
  description: string;
};

export type CohostListingPreview = {
  title: string;
  tenure: string;
  rating: number;
  imageUrl: string;
  guestFavourite?: boolean;
};

export type MatchCard = {
  id: string;
  displayName: string;
  cohostHeadline: string;
  profileImageUrl: string;
  bio: string;
  listingsManaged: number;
  guestRating: number;
  yearsHosting: number;
  areaLabel: string;
  specialties: string;
  matchReason: string;
  achievements?: CohostAchievement[];
  services?: CohostProfileService[];
  neighbourhoods?: string[];
  listingsPreview?: CohostListingPreview[];
};

export type MatchResultsPayload = {
  matches: MatchCard[];
  revenueEstimate: PortfolioRevenueEstimate;
};

function roundToStep(n: number, step: number): number {
  return Math.round(n / step) * step;
}

function propertyTypeLabel(t: PropertyTypeOption | undefined): string {
  const map: Record<PropertyTypeOption, string> = {
    flat: "Flat",
    house: "House",
    hmo_multi: "HMO / multi-unit",
  };
  return t ? map[t] : "Not specified";
}

function bedroomCountLabel(b: FunnelBedroomOption | undefined): string {
  const map: Record<FunnelBedroomOption, string> = {
    "1": "1",
    "2": "2",
    "3": "3",
    "4_plus": "4+",
  };
  return b ? map[b] : "Not specified";
}

function managementLabel(m: ManagementSituation | undefined): string {
  const map: Record<ManagementSituation, string> = {
    self: "I manage it myself",
    cohost: "I have a co-host",
    getting_started: "I'm just getting started",
  };
  return m ? map[m] : "Not specified";
}

function primaryGoalLabel(g: PrimaryGoalOption | undefined): string {
  const map: Record<PrimaryGoalOption, string> = {
    max_revenue: "Maximise revenue",
    hands_off: "Fully hands-off",
    better_reviews: "Better reviews",
  };
  return g ? map[g] : "Not specified";
}

function revenueBandLabel(b: EstimatedMonthlyRevenueBand | undefined): string {
  if (!b) return "Skipped — we inferred a range from bedrooms and property type";
  const map: Record<EstimatedMonthlyRevenueBand, string> = {
    zero_2_5k: "£0 – £2.5k / month",
    "2_5k_5k": "£2.5k – £5k / month",
    over_5k: "£5k+ / month",
  };
  return map[b];
}

/** Area phrase for matching copy — last segments of the address. */
export function deriveRegionLabel(a: MatchFunnelAnswers): string {
  const raw = a.propertyAddress.trim();
  if (!raw) return "your area";
  const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) return `${parts[parts.length - 2]}, ${parts[parts.length - 1]}`;
  return parts[0] ?? "your area";
}

function baseRangeFromBedroomsAndType(a: MatchFunnelAnswers): { lo: number; hi: number } {
  const bed = a.bedroomCount ?? "2";
  const typ = a.propertyType ?? "flat";
  const table: Record<FunnelBedroomOption, [number, number]> = {
    "1": [750, 1750],
    "2": [1200, 2600],
    "3": [1600, 3400],
    "4_plus": [2100, 4800],
  };
  let [lo, hi] = table[bed];
  if (typ === "house") {
    lo *= 1.06;
    hi *= 1.12;
  }
  if (typ === "hmo_multi") {
    lo *= 1.15;
    hi *= 1.28;
  }
  return { lo, hi };
}

function bandToRange(b: EstimatedMonthlyRevenueBand): { lo: number; hi: number } {
  switch (b) {
    case "zero_2_5k":
      return { lo: 200, hi: 2500 };
    case "2_5k_5k":
      return { lo: 2300, hi: 5200 };
    case "over_5k":
      return { lo: 4800, hi: 12000 };
    default:
      return { lo: 1000, hi: 3500 };
  }
}

/** Nudge an explicit revenue bracket slightly by bedrooms (still rough). */
function bedroomBandTweak(bed: FunnelBedroomOption | undefined): number {
  switch (bed) {
    case "1":
      return 0.92;
    case "2":
      return 1;
    case "3":
      return 1.06;
    case "4_plus":
      return 1.12;
    default:
      return 1;
  }
}

function buildRevenueBreakdown(a: MatchFunnelAnswers): RevenueBreakdownItem[] {
  const addr = a.propertyAddress.trim();
  return [
    {
      label: "Property address",
      yourAnswer: addr.length > 80 ? `${addr.slice(0, 77)}…` : addr || "—",
      applies: "We use this for local co-host fit; it is not shown publicly on your card.",
    },
    {
      label: "Property type",
      yourAnswer: propertyTypeLabel(a.propertyType),
      applies: "Houses and multi-unit stock typically support higher gross bands than a single flat in our model.",
    },
    {
      label: "Bedrooms",
      yourAnswer: bedroomCountLabel(a.bedroomCount),
      applies: "More bedrooms widen the indicative gross range vs a 2-bed baseline.",
    },
    {
      label: "How you manage it today",
      yourAnswer: managementLabel(a.managementSituation),
      applies: "Helps us match operators to your situation (e.g. replacing DIY vs levelling up an existing co-host).",
    },
    {
      label: "What matters most",
      yourAnswer: primaryGoalLabel(a.primaryGoal),
      applies: "Used to prioritise co-host strengths (revenue, full ops, guest experience) in your matches.",
    },
    {
      label: "Estimated monthly revenue",
      yourAnswer: revenueBandLabel(a.estimatedMonthlyRevenueBand),
      applies: a.estimatedMonthlyRevenueBand
        ? "Your bracket anchors the range; we still blend in property size for a sensible spread."
        : "Without a bracket we infer gross potential from bedrooms and property type only.",
    },
  ];
}

/** Indicative gross booking revenue from funnel inputs (not tax/accounting advice). */
export function estimatePortfolioRevenue(a: MatchFunnelAnswers): PortfolioRevenueEstimate {
  let lo: number;
  let hi: number;

  if (a.estimatedMonthlyRevenueBand) {
    const br = bandToRange(a.estimatedMonthlyRevenueBand);
    const tweak = bedroomBandTweak(a.bedroomCount);
    lo = br.lo * tweak;
    hi = br.hi * tweak;
  } else {
    ({ lo, hi } = baseRangeFromBedroomsAndType(a));
  }

  const monthlyLow = roundToStep(lo, 50);
  const monthlyHigh = roundToStep(Math.max(hi, lo + 50), 50);
  const monthlyMid = roundToStep((monthlyLow + monthlyHigh) / 2, 25);

  const headline = "Indicative monthly gross";
  const breakdown = buildRevenueBreakdown(a);
  const modelSummary =
    a.estimatedMonthlyRevenueBand
      ? "Your optional revenue bracket plus bedrooms and property type set a rough gross range — not occupancy maths or exact earnings."
      : "Bedrooms and property type set a rough gross range — add a revenue bracket next time if you want it tighter.";

  return {
    currency: "GBP",
    monthlyLow,
    monthlyHigh,
    monthlyMid,
    headline,
    disclaimer: "Gross bookings only — not after fees, cleaning, tax, or co-host split. Not financial advice.",
    breakdown,
    modelSummary,
  };
}

function coerceEstimatedMonthlyRevenueBand(
  v: unknown,
): EstimatedMonthlyRevenueBand | undefined {
  if (v === "zero_2_5k" || v === "2_5k_5k" || v === "over_5k") return v;
  if (v === "under_1k") return "zero_2_5k";
  if (v === "1k_3k") return "2_5k_5k";
  if (v === "over_3k") return "over_5k";
  return undefined;
}

/** Merge session JSON with defaults (unknown legacy keys ignored). */
export function mergeFunnelAnswers(parsed: Partial<MatchFunnelAnswers>): MatchFunnelAnswers {
  return {
    ...DEFAULT_FUNNEL_ANSWERS,
    ...parsed,
    estimatedMonthlyRevenueBand: coerceEstimatedMonthlyRevenueBand(
      parsed.estimatedMonthlyRevenueBand,
    ),
  };
}

/** Parse session JSON: new payload object or legacy bare array of matches. */
export function parseMatchResultsPayload(raw: string): {
  matches: Partial<MatchCard>[];
  revenueEstimate: PortfolioRevenueEstimate | null;
} {
  try {
    const data = JSON.parse(raw) as unknown;
    if (Array.isArray(data)) {
      return { matches: data, revenueEstimate: null };
    }
    if (
      data &&
      typeof data === "object" &&
      "matches" in data &&
      Array.isArray((data as MatchResultsPayload).matches)
    ) {
      const p = data as MatchResultsPayload;
      return {
        matches: p.matches,
        revenueEstimate: p.revenueEstimate ?? null,
      };
    }
  } catch {
    /* empty */
  }
  return { matches: [], revenueEstimate: null };
}

type OperatorBase = Omit<MatchCard, "matchReason" | "cohostHeadline">;

const MOCK_OPERATORS: OperatorBase[] = [
  {
    id: "mock-1",
    displayName: "Yas",
    profileImageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    bio: "Superhost with 8+ years experience. I provide end-to-end management to earn you 5-star reviews and maximise your property's earning potential.",
    listingsManaged: 18,
    guestRating: 4.82,
    yearsHosting: 6,
    areaLabel: "Greater London & Home Counties",
    specialties: "Pricing, guest experience, multi-listing ops",
    achievements: [
      {
        icon: "award",
        title: "Superhost for over 1 year",
        description:
          "Consistently high ratings, response rate, and cancellation standards across the portfolio I manage.",
      },
      {
        icon: "medal",
        title: "Hosts multiple Guest Favourite homes",
        description:
          "Several listings under my care have earned Guest Favourite status from recent guest love.",
      },
    ],
    services: [
      {
        icon: "home",
        title: "Listing setup",
        description:
          "I turn basic rentals into premium assets using data-driven marketing, pro staging guidance, and high-conversion listing copy.",
      },
      {
        icon: "coins",
        title: "Setting prices and availability",
        description:
          "I maximise ROI using daily dynamic pricing and seasonal trends to keep occupancy and revenue strong.",
      },
      {
        icon: "calendar",
        title: "Booking request management",
        description:
          "24/7 rapid response to inquiries with careful guest vetting so your property stays protected.",
      },
      {
        icon: "messages",
        title: "Guest messaging",
        description:
          "Instant, personalised responses from inquiry to checkout so guests feel looked after.",
      },
      {
        icon: "key",
        title: "On-site guest support",
        description:
          "Local, on-call support for every stay — quick fixes and a smooth VIP-style experience.",
      },
      {
        icon: "spray",
        title: "Cleaning and maintenance",
        description:
          "Trusted cleaners and trades on speed dial so turnovers stay spotless and issues get resolved fast.",
      },
      {
        icon: "camera",
        title: "Listing photography",
        description:
          "I coordinate with pro photographers so your gallery matches the quality of the stay.",
      },
    ],
    neighbourhoods: [
      "Battersea",
      "Bow",
      "Brent Cross",
      "Brixton",
      "Camden Town",
      "Canary Wharf",
      "Chelsea",
      "Clapham",
      "Dalston",
      "Ealing",
    ],
    listingsPreview: [
      {
        title: "Flat in Greater London",
        tenure: "Co-hosted for 3 years",
        rating: 4.95,
        guestFavourite: true,
        imageUrl:
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop",
      },
      {
        title: "House in Greater London",
        tenure: "Hosted for 4 years",
        rating: 4.84,
        guestFavourite: true,
        imageUrl:
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop",
      },
      {
        title: "Townhouse in Greater London",
        tenure: "Co-hosted for 18 months",
        rating: 5.0,
        imageUrl:
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop",
      },
      {
        title: "Apartment in Greater London",
        tenure: "Co-hosted for 2 years",
        rating: 4.91,
        imageUrl:
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop",
      },
    ],
  },
  {
    id: "mock-2",
    displayName: "Lesley",
    profileImageUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
    bio: "I've been hosting for 14 years after being approached by other owners. I focus on calm guest communication, spotless turnovers, and revenue you can rely on.",
    listingsManaged: 12,
    guestRating: 4.91,
    yearsHosting: 14,
    areaLabel: "South East England",
    specialties: "Guest messaging, operations, entire-home listings",
    achievements: [
      {
        icon: "award",
        title: "Veteran Superhost",
        description:
          "Years of five-star stays and dependable hosting metrics across the South East.",
      },
      {
        icon: "medal",
        title: "Guest Favourite homes",
        description:
          "Multiple properties I co-host are recognised as Guest Favourites.",
      },
    ],
    services: [
      {
        icon: "messages",
        title: "Guest messaging",
        description:
          "Warm, clear communication that prevents issues before they start and keeps reviews glowing.",
      },
      {
        icon: "coins",
        title: "Pricing and calendar",
        description:
          "Thoughtful rate strategy and minimum stays tuned to your market and seasonality.",
      },
      {
        icon: "home",
        title: "Listing optimisation",
        description:
          "Titles, photos, and amenities tuned so the right guests book at the right price.",
      },
      {
        icon: "sparkles",
        title: "Turnover coordination",
        description:
          "Scheduling cleaners and restocks so every check-in feels brand new.",
      },
    ],
    neighbourhoods: [
      "Brighton",
      "Eastbourne",
      "Hastings",
      "Canterbury",
      "Tunbridge Wells",
    ],
    listingsPreview: [
      {
        title: "Coastal flat in East Sussex",
        tenure: "Co-hosted for 6 years",
        rating: 4.92,
        guestFavourite: true,
        imageUrl:
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop",
      },
      {
        title: "Townhouse near Brighton",
        tenure: "Co-hosted for 4 years",
        rating: 4.88,
        imageUrl:
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop",
      },
    ],
  },
  {
    id: "mock-3",
    displayName: "Sam & Sara",
    profileImageUrl:
      "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&h=400&fit=crop",
    bio: "We are a two-person team: one of us handles pricing and bookings, the other on-the-ground guest support. Ideal if you want a personal, hands-on co-host.",
    listingsManaged: 9,
    guestRating: 4.88,
    yearsHosting: 5,
    areaLabel: "South West & remote support",
    specialties: "Full-service co-host, dynamic pricing",
    achievements: [
      {
        icon: "award",
        title: "Superhost team",
        description:
          "Combined hosting experience with clear roles so nothing slips through the cracks.",
      },
      {
        icon: "medal",
        title: "High guest satisfaction",
        description:
          "Strong repeat guests and review scores across homes we manage together.",
      },
    ],
    services: [
      {
        icon: "coins",
        title: "Dynamic pricing",
        description:
          "Daily rate updates and length-of-stay rules to capture demand without leaving money on the table.",
      },
      {
        icon: "calendar",
        title: "Bookings and calendar",
        description:
          "Same-day handling of requests, extensions, and last-minute gaps.",
      },
      {
        icon: "key",
        title: "Local guest support",
        description:
          "In-person help when guests need keys, troubleshooting, or local recommendations.",
      },
      {
        icon: "messages",
        title: "Guest messaging",
        description:
          "Shared inbox with fast handoffs between us so guests always get a quick reply.",
      },
    ],
    neighbourhoods: ["Bristol", "Bath", "Cheltenham", "Exeter", "Plymouth"],
    listingsPreview: [
      {
        title: "Flat in Bristol",
        tenure: "Co-hosted for 2 years",
        rating: 4.9,
        guestFavourite: true,
        imageUrl:
          "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=600&h=400&fit=crop",
      },
      {
        title: "House in Bath",
        tenure: "Co-hosted for 14 months",
        rating: 4.86,
        imageUrl:
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop",
      },
    ],
  },
];

function sentence(parts: string[]): string {
  const filtered = parts.filter(Boolean);
  if (filtered.length === 0) return "Strong fit for hosts looking for proven operators.";
  if (filtered.length === 1) return filtered[0];
  return `${filtered.slice(0, -1).join(" ")} and ${filtered[filtered.length - 1]}.`;
}

function withHeadline(op: OperatorBase): Omit<MatchCard, "matchReason"> {
  return {
    ...op,
    cohostHeadline: `Co-host in ${op.areaLabel}`,
  };
}

function goalHook(goal: PrimaryGoalOption | undefined): string {
  if (goal === "max_revenue") return "revenue and pricing";
  if (goal === "hands_off") return "end-to-end hands-off operations";
  if (goal === "better_reviews") return "guest experience and reviews";
  return "your priorities";
}

function managementHook(m: ManagementSituation | undefined): string {
  if (m === "self") return "taking over from a self-managed host";
  if (m === "cohost") return "levelling up or replacing an existing co-host setup";
  if (m === "getting_started") return "hosts who are just getting started";
  return "your situation";
}

export type BuildMockMatchesOptions = {
  /** Mock catalog ids (e.g. mock-1) to omit when offering a “fresh” batch — still mock data only */
  excludeCatalogIds?: string[];
};

export function buildMockMatches(
  answers: MatchFunnelAnswers,
  options?: BuildMockMatchesOptions,
): MatchCard[] {
  const exclude = new Set(
    (options?.excludeCatalogIds ?? []).filter((id) => typeof id === "string" && id.trim()),
  );
  const region = deriveRegionLabel(answers);
  const typeLabel = propertyTypeLabel(answers.propertyType);
  const beds = bedroomCountLabel(answers.bedroomCount);

  const reasons = [
    sentence([
      `Strong fit for ${region}`,
      answers.propertyType ? `with ${typeLabel.toLowerCase()} stock` : "",
      answers.primaryGoal ? `aligned with ${goalHook(answers.primaryGoal)}` : "",
    ]),
    sentence([
      `Experienced with ${managementHook(answers.managementSituation)}`,
      answers.bedroomCount ? `${beds}-bed scale` : "",
    ]),
    sentence([
      `${region} coverage`,
      answers.primaryGoal === "better_reviews" ? "guest messaging and review recovery" : "",
      answers.primaryGoal === "max_revenue" ? "dynamic rates and calendar yield" : "",
      answers.primaryGoal === "hands_off" ? "full listing operations so you stay out of the weeds" : "",
    ]),
  ];

  let pool = MOCK_OPERATORS.filter((op) => !exclude.has(op.id));
  if (pool.length < MOCK_OPERATORS.length && pool.length < 3) {
    pool = MOCK_OPERATORS;
  }

  return pool.map((op, i) => ({
    ...withHeadline(op),
    matchReason: reasons[i] ?? reasons[0],
  }));
}

const PLACEHOLDER_AVATAR =
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&h=256&fit=crop&crop=face";

export function normalizeMatchCard(m: Partial<MatchCard>): MatchCard {
  return {
    id: m.id ?? "unknown",
    displayName: m.displayName ?? "Co-host",
    cohostHeadline: m.cohostHeadline ?? `Co-host in ${m.areaLabel ?? "your area"}`,
    profileImageUrl: m.profileImageUrl ?? PLACEHOLDER_AVATAR,
    bio:
      m.bio ??
      m.specialties ??
      "Experienced co-host helping Airbnb owners with operations, guests, and revenue.",
    listingsManaged: m.listingsManaged ?? 0,
    guestRating: m.guestRating ?? 4.8,
    yearsHosting: m.yearsHosting ?? 3,
    areaLabel: m.areaLabel ?? "",
    specialties: m.specialties ?? "",
    matchReason: m.matchReason ?? "",
    achievements: m.achievements ?? [],
    services: m.services ?? [],
    neighbourhoods: m.neighbourhoods ?? [],
    listingsPreview: m.listingsPreview ?? [],
  };
}

export function enrichMatchCardWithCatalog(m: MatchCard): MatchCard {
  const base = MOCK_OPERATORS.find((o) => o.id === m.id);
  if (!base) return m;
  const hasDetail =
    (m.achievements?.length ?? 0) > 0 || (m.services?.length ?? 0) > 0;
  if (hasDetail) return m;
  return normalizeMatchCard({
    ...base,
    matchReason: m.matchReason,
    cohostHeadline: m.cohostHeadline,
  });
}

export type CatalogMatchFlowSource = "find_cohost" | "income_estimate";

/** Which tool produced the results card for this catalog id (mock results in sessionStorage). */
export function getCatalogMatchFlow(id: string): CatalogMatchFlowSource | null {
  if (typeof window === "undefined") return null;
  try {
    const matchRaw = sessionStorage.getItem(MATCH_RESULTS_KEY);
    if (matchRaw) {
      const { matches: matchList } = parseMatchResultsPayload(matchRaw);
      if (matchList.some((x) => x.id === id)) return "find_cohost";
    }
    const incomeRaw = sessionStorage.getItem(INCOME_ESTIMATE_RESULTS_KEY);
    if (incomeRaw) {
      const { matches: incomeList } = parseMatchResultsPayload(incomeRaw);
      if (incomeList.some((x) => x.id === id)) return "income_estimate";
    }
  } catch {
    /* empty */
  }
  return null;
}

export function findMatchInSessionResults(id: string): MatchCard | null {
  if (typeof window === "undefined") return null;
  try {
    for (const key of [MATCH_RESULTS_KEY, INCOME_ESTIMATE_RESULTS_KEY]) {
      const raw = sessionStorage.getItem(key);
      if (!raw) continue;
      const { matches: rawList } = parseMatchResultsPayload(raw);
      const found = rawList.find((x) => x.id === id);
      if (found) {
        return enrichMatchCardWithCatalog(normalizeMatchCard(found));
      }
    }
  } catch {
    return null;
  }
  return null;
}

export const DEFAULT_FUNNEL_ANSWERS: MatchFunnelAnswers = {
  propertyAddress: "",
  propertyAddressPlaceId: undefined,
  propertyType: undefined,
  bedroomCount: undefined,
  managementSituation: undefined,
  primaryGoal: undefined,
  estimatedMonthlyRevenueBand: undefined,
  email: "",
};
