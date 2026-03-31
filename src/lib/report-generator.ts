import OpenAI from "openai";
import { z } from "zod";
import type { FreeReport, FullReport, ListingInput } from "./types";

const freeReportSchema = z.object({
  score: z.number().min(1).max(100),
  quickWins: z.array(z.string()).min(3).max(6),
  teaser: z.string().min(20),
});

const fullReportSchema = z.object({
  score: z.number().min(1).max(100),
  optimizedTitleOptions: z.array(z.string()).min(3).max(6),
  optimizedDescription: z.string().min(80),
  priorityActions: z
    .array(
      z.object({
        action: z.string(),
        impact: z.enum(["High", "Medium", "Low"]),
        reason: z.string(),
      }),
    )
    .min(3)
    .max(6),
  positioning: z.string().min(20),
});

function estimateScore(input: ListingInput) {
  let score = 58;
  if (input.title.length > 35) score += 8;
  if (input.description.length > 350) score += 12;
  if (input.amenities.split(",").filter(Boolean).length > 8) score += 10;
  if (input.targetGuest.length > 15) score += 5;
  return Math.min(92, score);
}

/** Free-report funnel often only collects URL + ideal guest; details are placeholders. */
function isSparseListingInput(input: ListingInput): boolean {
  return (
    input.title === "Not provided" &&
    input.description === "Not provided" &&
    input.amenities === "Not provided" &&
    input.location === "Not provided"
  );
}

function displayUrlForCopy(url: string): string {
  try {
    const u = new URL(url);
    return (u.hostname + u.pathname).replace(/\/$/, "") || url;
  } catch {
    return url;
  }
}

function fallbackFreeReport(input: ListingInput): FreeReport {
  const score = estimateScore(input);
  const guest = input.targetGuest.trim() || "your guests";
  const urlLine = displayUrlForCopy(input.listingUrl);

  if (isSparseListingInput(input)) {
    return {
      score,
      quickWins: [
        `Open your live Airbnb page (${urlLine}) and check whether the first few words of the title match what ${guest} actually type into search.`,
        `Rewrite the opening of your description as one clear sentence that promises an outcome to ${guest}—not a list of room labels.`,
        `Skim your published amenities: group the top items into three headings that matter to ${guest} (comfort, work, location, families, etc.).`,
      ],
      teaser: `We only have your listing link and that you want to attract ${guest}. The full paid report drafts title options, a full description, and ranked fixes tailored to this listing once you’ve unlocked it.`,
    };
  }

  return {
    score,
    quickWins: [
      "Lead your title with a location + standout feature (for example: canal view, parking, hot tub).",
      "Rewrite the first 2 lines of your description to focus on guest outcome, not property facts.",
      "Group amenities into guest-friendly categories (work, family, comfort, transport).",
    ],
    teaser:
      "Your full report includes title rewrites, a conversion-focused description draft, and prioritized actions by impact.",
  };
}

function fallbackFullReport(input: ListingInput): FullReport {
  const score = estimateScore(input);
  const guest = input.targetGuest || "modern guests";
  const urlLine = displayUrlForCopy(input.listingUrl);

  if (isSparseListingInput(input)) {
    return {
      score,
      optimizedTitleOptions: [
        `Thoughtful stay designed for ${guest}—comfort, clarity, easy arrival`,
        `Prime base for ${guest}: calm space, strong host communication, smooth check-in`,
        `A host-ready listing angle: ${guest} who value practical convenience`,
      ],
      optimizedDescription:
        `This space is presented for ${guest} who want a straightforward, well-managed stay. Lead with what matters most to that guest segment—arrival ease, sleep quality, workspace or relaxation, and transparent house rules—then layer in accurate location context from your live Airbnb page (${urlLine}). Keep the tone confident and specific once you replace placeholders with your real amenities and neighborhood hooks.`,
      priorityActions: [
        {
          action:
            "Pull 3 phrases guests use in reviews (or similar listings) and mirror them in your title",
          impact: "High",
          reason: `Search and conversion align when language matches how ${guest} actually describe what they want.`,
        },
        {
          action: "Rewrite your hero description as problem → outcome for this guest type",
          impact: "High",
          reason: "The first screen of copy decides whether guests read on or bounce.",
        },
        {
          action: `Audit amenities on ${urlLine} against what ${guest} filter for in your market`,
          impact: "Medium",
          reason: "Missing or buried filters reduce impressions and qualified clicks.",
        },
      ],
      positioning: `Anchor this Airbnb for ${guest}: emphasize reliability, clarity, and a polished hosting standard—then tighten differentiation using facts only from your real listing page.`,
    };
  }

  return {
    score,
    optimizedTitleOptions: [
      `${input.location} stay with curated comfort + easy check-in`,
      `High-performing ${input.location} Airbnb for ${guest}`,
      `Guest-favorite ${input.location} base near key attractions`,
    ],
    optimizedDescription:
      "Welcome to a thoughtfully designed stay built around convenience, comfort, and local access. Guests choose this listing for its reliable essentials, clear layout, and a smooth check-in experience that reduces friction from arrival to checkout. The space is ideal for travelers who want an easy base with practical amenities and a polished hosting standard.",
    priorityActions: [
      {
        action: "Upgrade headline/title structure to intent-led copy",
        impact: "High",
        reason: "Title quality has the largest effect on click-through rate from search results.",
      },
      {
        action: "Restructure description with a stronger opening hook",
        impact: "High",
        reason: "Early copy strongly influences conversion after listing page entry.",
      },
      {
        action: "Reframe amenities for decision-stage guests",
        impact: "Medium",
        reason: "Clear amenity framing improves trust and reduces booking hesitation.",
      },
    ],
    positioning:
      "Position this listing as a reliable, high-comfort base for guests who value convenience, cleanliness, and straightforward host communication.",
  };
}

async function generateWithOpenAI<T>(
  systemPrompt: string,
  userPrompt: string,
): Promise<T | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  try {
    const response = await client.chat.completions.create({
      model,
      temperature: 0.4,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

export async function generateFreeReport(input: ListingInput): Promise<FreeReport> {
  const fallback = fallbackFreeReport(input);
  const sparse = isSparseListingInput(input);

  const densePrompt = `Create a free listing audit report as JSON with fields:
{
  "score": number 1-100,
  "quickWins": string[3-6],
  "teaser": string
}
Use the real title, description, and amenities below. Be specific to this listing.

Listing:
${JSON.stringify(input, null, 2)}`;

  const sparsePrompt = `Create a free listing audit preview as JSON with fields:
{
  "score": number 1-100 (educated guess from limited signals—avoid round numbers like exactly 50 or 75),
  "quickWins": string[3-6],
  "teaser": string
}

You do NOT have this listing's title, description, photos, or amenities—only:
- listingUrl: ${input.listingUrl}
- targetGuest: ${input.targetGuest}

Rules:
- Do NOT say you analyzed photos, amenities, or exact copy you were not given.
- Every quickWin must tie back to this URL or to attracting "${input.targetGuest}" (e.g. what to verify on the live page, how to think about positioning).
- The teaser must say the paid full report will tailor title, description, and actions to this listing once unlocked.
- You may infer rough geography only if the URL path or host suggests a region; otherwise stay URL-agnostic beyond "this listing".

Return only valid JSON matching the shape above.`;

  const aiJson = await generateWithOpenAI<FreeReport>(
    sparse
      ? "You are an Airbnb listing optimization expert. The host only shared a listing URL and target guest—be honest about limits. Return only valid JSON."
      : "You are an Airbnb listing optimization expert. Return only valid JSON.",
    sparse ? sparsePrompt : densePrompt,
  );

  const parsed = freeReportSchema.safeParse(aiJson);
  return parsed.success ? parsed.data : fallback;
}

export async function generateFullReport(input: ListingInput): Promise<FullReport> {
  const fallback = fallbackFullReport(input);
  const sparse = isSparseListingInput(input);

  const denseFullPrompt = `Create a paid full listing optimization report as JSON with fields:
{
  "score": number 1-100,
  "optimizedTitleOptions": string[3-6],
  "optimizedDescription": string,
  "priorityActions": [{"action": string, "impact": "High" | "Medium" | "Low", "reason": string}],
  "positioning": string
}
Use the real listing fields below. Be specific.

Listing:
${JSON.stringify(input, null, 2)}`;

  const sparseFullPrompt = `Create a paid full listing optimization report as JSON with fields:
{
  "score": number 1-100,
  "optimizedTitleOptions": string[3-6],
  "optimizedDescription": string,
  "priorityActions": [{"action": string, "impact": "High" | "Medium" | "Low", "reason": string}],
  "positioning": string
}

You only have:
- listingUrl: ${input.listingUrl}
- targetGuest: ${input.targetGuest}

The other fields in the host flow were not collected—do NOT pretend you saw their current title, amenities, or photos.

Rules:
- optimizedTitleOptions: strong, varied title patterns aimed at "${input.targetGuest}" and plausible for a professional short-let (no fake claims about specific amenities).
- optimizedDescription: one polished description that would work once they fill in factual details; speak to "${input.targetGuest}"; avoid inventing hot tubs, views, or parking unless the URL strongly implies them.
- priorityActions: tell them what to verify on the live Airbnb page and how to tighten SEO/copy for "${input.targetGuest}".
- positioning: one paragraph on how to stand out to "${input.targetGuest}" for this listing URL context.

Return only valid JSON.`;

  const aiJson = await generateWithOpenAI<FullReport>(
    sparse
      ? "You are an Airbnb listing optimization expert. Listing details were not provided—write premium templates honest about missing facts. Return only valid JSON."
      : "You are an Airbnb listing optimization expert. Return only valid JSON.",
    sparse ? sparseFullPrompt : denseFullPrompt,
  );

  const parsed = fullReportSchema.safeParse(aiJson);
  return parsed.success ? parsed.data : fallback;
}
