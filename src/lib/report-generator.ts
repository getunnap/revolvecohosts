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

function fallbackFreeReport(input: ListingInput): FreeReport {
  const score = estimateScore(input);
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
  return {
    score,
    optimizedTitleOptions: [
      `${input.location} stay with curated comfort + easy check-in`,
      `High-performing ${input.location} Airbnb for ${input.targetGuest || "modern guests"}`,
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
  const aiJson = await generateWithOpenAI<FreeReport>(
    "You are an Airbnb listing optimization expert. Return only valid JSON.",
    `Create a free listing audit report as JSON with fields:
{
  "score": number 1-100,
  "quickWins": string[3-6],
  "teaser": string
}
Listing:
${JSON.stringify(input, null, 2)}`,
  );

  const parsed = freeReportSchema.safeParse(aiJson);
  return parsed.success ? parsed.data : fallback;
}

export async function generateFullReport(input: ListingInput): Promise<FullReport> {
  const fallback = fallbackFullReport(input);
  const aiJson = await generateWithOpenAI<FullReport>(
    "You are an Airbnb listing optimization expert. Return only valid JSON.",
    `Create a paid full listing optimization report as JSON with fields:
{
  "score": number 1-100,
  "optimizedTitleOptions": string[3-6],
  "optimizedDescription": string,
  "priorityActions": [{"action": string, "impact": "High" | "Medium" | "Low", "reason": string}],
  "positioning": string
}
Listing:
${JSON.stringify(input, null, 2)}`,
  );

  const parsed = fullReportSchema.safeParse(aiJson);
  return parsed.success ? parsed.data : fallback;
}
