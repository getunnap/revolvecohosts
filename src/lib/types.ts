export type ListingInput = {
  listingUrl: string;
  location: string;
  title: string;
  description: string;
  amenities: string;
  targetGuest: string;
};

export type FreeReport = {
  score: number;
  quickWins: string[];
  teaser: string;
};

export type FullReport = {
  score: number;
  optimizedTitleOptions: string[];
  optimizedDescription: string;
  priorityActions: Array<{
    action: string;
    impact: "High" | "Medium" | "Low";
    reason: string;
  }>;
  positioning: string;
};
