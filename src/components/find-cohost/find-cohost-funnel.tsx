"use client";

import { MATCH_FUNNEL_ANSWERS_KEY } from "@/lib/client-storage";
import {
  DEFAULT_FUNNEL_ANSWERS,
  type EstimatedMonthlyRevenueBand,
  type FunnelBedroomOption,
  type ManagementSituation,
  type MatchFunnelAnswers,
  type PrimaryGoalOption,
  type PropertyTypeOption,
} from "@/lib/match-funnel";
import { AddressAutocompleteInput } from "@/components/find-cohost/address-autocomplete-input";
import { useRouter } from "next/navigation";
import { useState } from "react";

const PROPERTY_TYPES: { value: PropertyTypeOption; label: string; hint: string }[] = [
  { value: "flat", label: "Flat", hint: "Apartment, maisonette, studio block" },
  { value: "house", label: "House", hint: "Terraced, semi, detached" },
  { value: "hmo_multi", label: "HMO / multi-unit", hint: "Several lettings under one roof" },
];

const BEDROOMS: { value: FunnelBedroomOption; label: string }[] = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4_plus", label: "4+" },
];

const MANAGEMENT: { value: ManagementSituation; label: string; hint: string }[] = [
  { value: "self", label: "I manage it myself", hint: "DIY host today" },
  { value: "cohost", label: "I have a co-host", hint: "Already outsourced, may want a change" },
  {
    value: "getting_started",
    label: "I'm just getting started",
    hint: "Not live yet or very early",
  },
];

const GOALS: { value: PrimaryGoalOption; label: string; hint: string }[] = [
  { value: "max_revenue", label: "Maximise revenue", hint: "Pricing, occupancy, yield" },
  { value: "hands_off", label: "Fully hands-off", hint: "You want out of day-to-day ops" },
  { value: "better_reviews", label: "Better reviews", hint: "Guests, comms, quality" },
];

const REVENUE_BANDS: {
  value: EstimatedMonthlyRevenueBand;
  label: string;
}[] = [
  { value: "zero_2_5k", label: "£0 – £2.5k / month" },
  { value: "2_5k_5k", label: "£2.5k – £5k / month" },
  { value: "over_5k", label: "£5k+ / month" },
];

const TOTAL_STEPS = 7;

export default function FindCohostFunnel() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<MatchFunnelAnswers>(DEFAULT_FUNNEL_ANSWERS);

  function submit() {
    try {
      sessionStorage.setItem(MATCH_FUNNEL_ANSWERS_KEY, JSON.stringify(answers));
    } catch {
      /* empty */
    }
    router.push("/find-cohost/loading");
  }

  const progressPct = Math.min(100, (step / TOTAL_STEPS) * 100);

  const addressOk = answers.propertyAddress.trim().length >= 8;
  const typeOk = answers.propertyType !== undefined;
  const bedsOk = answers.bedroomCount !== undefined;
  const manageOk = answers.managementSituation !== undefined;
  const goalOk = answers.primaryGoal !== undefined;

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:py-16">
      <div className="mb-8">
        <div className="mb-2 flex justify-between text-xs text-muted-foreground">
          <span>
            Step {step} of {TOTAL_STEPS}
          </span>
          <span>{Math.round(progressPct)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-[#10B981] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {step === 1 && (
        <div>
          <h2 className="mb-2 text-2xl font-bold">What&apos;s your property address?</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            We use this for local co-host matching. Start typing — Google will suggest addresses when
            configured — or enter it manually.
          </p>
          <AddressAutocompleteInput
            value={answers.propertyAddress}
            onChange={(propertyAddress) => setAnswers((a) => ({ ...a, propertyAddress }))}
            onPlaceResolved={({ formattedAddress, placeId }) =>
              setAnswers((a) => ({
                ...a,
                propertyAddress: formattedAddress,
                propertyAddressPlaceId: placeId,
              }))
            }
          />
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="rounded-xl border border-border px-5 py-3 font-medium transition-colors hover:bg-muted"
            >
              Back
            </button>
            <button
              type="button"
              disabled={!addressOk}
              onClick={() => setStep(2)}
              className="flex-1 rounded-xl bg-[#10B981] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="mb-2 text-2xl font-bold">What type of property is it?</h2>
          <p className="mb-6 text-sm text-muted-foreground">Tap one option.</p>
          <div className="mb-6 flex flex-col gap-2">
            {PROPERTY_TYPES.map(({ value, label, hint }) => (
              <button
                key={value}
                type="button"
                onClick={() => setAnswers((a) => ({ ...a, propertyType: value }))}
                className={`rounded-xl border-2 p-4 text-left transition-colors ${
                  answers.propertyType === value
                    ? "border-[#10B981] bg-[#10B981]/10"
                    : "border-border bg-card hover:border-[#10B981]/40"
                }`}
              >
                <span className="block font-semibold text-foreground">{label}</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">{hint}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-xl border border-border px-5 py-3 font-medium transition-colors hover:bg-muted"
            >
              Back
            </button>
            <button
              type="button"
              disabled={!typeOk}
              onClick={() => setStep(3)}
              className="flex-1 rounded-xl bg-[#10B981] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="mb-2 text-2xl font-bold">How many bedrooms?</h2>
          <p className="mb-6 text-sm text-muted-foreground">Tap one option.</p>
          <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {BEDROOMS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setAnswers((a) => ({ ...a, bedroomCount: value }))}
                className={`rounded-xl border-2 py-4 text-center text-lg font-bold transition-colors ${
                  answers.bedroomCount === value
                    ? "border-[#10B981] bg-[#10B981]/10 text-teal-900"
                    : "border-border bg-card hover:border-[#10B981]/40"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-xl border border-border px-5 py-3 font-medium transition-colors hover:bg-muted"
            >
              Back
            </button>
            <button
              type="button"
              disabled={!bedsOk}
              onClick={() => setStep(4)}
              className="flex-1 rounded-xl bg-[#10B981] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h2 className="mb-2 text-2xl font-bold">How are you currently managing it?</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            This helps us match the right operator to your situation.
          </p>
          <div className="mb-6 flex flex-col gap-2">
            {MANAGEMENT.map(({ value, label, hint }) => (
              <button
                key={value}
                type="button"
                onClick={() => setAnswers((a) => ({ ...a, managementSituation: value }))}
                className={`rounded-xl border-2 p-4 text-left transition-colors ${
                  answers.managementSituation === value
                    ? "border-[#10B981] bg-[#10B981]/10"
                    : "border-border bg-card hover:border-[#10B981]/40"
                }`}
              >
                <span className="block font-semibold text-foreground">{label}</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">{hint}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="rounded-xl border border-border px-5 py-3 font-medium transition-colors hover:bg-muted"
            >
              Back
            </button>
            <button
              type="button"
              disabled={!manageOk}
              onClick={() => setStep(5)}
              className="flex-1 rounded-xl bg-[#10B981] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div>
          <h2 className="mb-2 text-2xl font-bold">What matters most to you?</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            We use this to position co-hosts against your priorities.
          </p>
          <div className="mb-6 flex flex-col gap-2">
            {GOALS.map(({ value, label, hint }) => (
              <button
                key={value}
                type="button"
                onClick={() => setAnswers((a) => ({ ...a, primaryGoal: value }))}
                className={`rounded-xl border-2 p-4 text-left transition-colors ${
                  answers.primaryGoal === value
                    ? "border-[#10B981] bg-[#10B981]/10"
                    : "border-border bg-card hover:border-[#10B981]/40"
                }`}
              >
                <span className="block font-semibold text-foreground">{label}</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">{hint}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="rounded-xl border border-border px-5 py-3 font-medium transition-colors hover:bg-muted"
            >
              Back
            </button>
            <button
              type="button"
              disabled={!goalOk}
              onClick={() => setStep(6)}
              className="flex-1 rounded-xl bg-[#10B981] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 6 && (
        <div>
          <h2 className="mb-2 text-2xl font-bold">Estimated monthly revenue?</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Optional — rough gross bookings per month. Skip if you prefer; we will still show a range
            from your property details.
          </p>
          <div className="mb-4 flex flex-col gap-2">
            {REVENUE_BANDS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setAnswers((a) => ({ ...a, estimatedMonthlyRevenueBand: value }))
                }
                className={`rounded-xl border-2 px-4 py-3 text-left font-semibold transition-colors ${
                  answers.estimatedMonthlyRevenueBand === value
                    ? "border-[#10B981] bg-[#10B981]/10"
                    : "border-border bg-card hover:border-[#10B981]/40"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              setAnswers((a) => ({ ...a, estimatedMonthlyRevenueBand: undefined }))
            }
            className="mb-6 w-full rounded-xl border border-dashed border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50"
          >
            Skip — I&apos;ll leave this blank
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(5)}
              className="rounded-xl border border-border px-5 py-3 font-medium transition-colors hover:bg-muted"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(7)}
              className="flex-1 rounded-xl bg-[#10B981] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#059669]"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 7 && (
        <div>
          <h2 className="mb-2 text-2xl font-bold">Contact email</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            We will use this if we need to follow up on intro requests.
          </p>
          <label className="sr-only" htmlFor="cohost-email">
            Email
          </label>
          <input
            id="cohost-email"
            type="email"
            className="mb-6 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none ring-[#10B981] focus:ring-2"
            placeholder="you@example.com"
            value={answers.email}
            onChange={(e) => setAnswers((a) => ({ ...a, email: e.target.value }))}
            autoFocus
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(6)}
              className="rounded-xl border border-border px-5 py-3 font-medium transition-colors hover:bg-muted"
            >
              Back
            </button>
            <button
              type="button"
              disabled={!answers.email.trim()}
              onClick={submit}
              className="flex-1 rounded-xl bg-[#10B981] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Find my matches
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
