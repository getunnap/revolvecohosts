"use client";

import { AddressAutocompleteInput } from "@/components/find-cohost/address-autocomplete-input";
import { INCOME_ESTIMATE_ANSWERS_KEY } from "@/lib/client-storage";
import {
  type AvailabilityForLetting,
  type IncomeEstimateAnswers,
  mergeIncomeEstimateAnswers,
} from "@/lib/income-estimate";
import {
  type EstimatedMonthlyRevenueBand,
  type FunnelBedroomOption,
  type PropertyTypeOption,
} from "@/lib/match-funnel";
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

const AVAILABILITY: {
  value: AvailabilityForLetting;
  label: string;
  hint: string;
}[] = [
  {
    value: "year_round",
    label: "Year-round",
    hint: "Available to guests almost every week",
  },
  {
    value: "mostly",
    label: "Mostly open",
    hint: "A few weeks blocked for personal use or maintenance",
  },
  {
    value: "partial",
    label: "Part of the year",
    hint: "Regular blockouts, mixed use, or limited windows",
  },
  {
    value: "seasonal",
    label: "Seasonal only",
    hint: "Peak weeks or short seasons — not a full-year calendar",
  },
];

const REVENUE_BANDS: {
  value: EstimatedMonthlyRevenueBand;
  label: string;
}[] = [
  { value: "zero_2_5k", label: "£0 – £2.5k / month" },
  { value: "2_5k_5k", label: "£2.5k – £5k / month" },
  { value: "over_5k", label: "£5k+ / month" },
];

const TOTAL_STEPS = 6;

const DEFAULT_ANSWERS: IncomeEstimateAnswers = mergeIncomeEstimateAnswers({});

export default function IncomeEstimateFunnel() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<IncomeEstimateAnswers>(DEFAULT_ANSWERS);

  function submit() {
    try {
      sessionStorage.setItem(INCOME_ESTIMATE_ANSWERS_KEY, JSON.stringify(answers));
    } catch {
      /* empty */
    }
    router.push("/income-estimate/loading");
  }

  const progressPct = Math.min(100, (step / TOTAL_STEPS) * 100);

  const addressOk = answers.propertyAddress.trim().length >= 8;
  const typeOk = answers.propertyType !== undefined;
  const bedsOk = answers.bedroomCount !== undefined;

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
          <h2 className="mb-2 text-2xl font-bold">Where is the property?</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            We use this for regional market context and co-host matching. Start typing for
            suggestions, or enter the address manually.
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
              onClick={() => router.push("/tools")}
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
          <h2 className="mb-2 text-2xl font-bold">When can you let it out?</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Honest availability helps us scale annual income — not just a single busy month.
          </p>
          <div className="mb-6 flex flex-col gap-2">
            {AVAILABILITY.map(({ value, label, hint }) => (
              <button
                key={value}
                type="button"
                onClick={() => setAnswers((a) => ({ ...a, availabilityForLetting: value }))}
                className={`rounded-xl border-2 p-4 text-left transition-colors ${
                  answers.availabilityForLetting === value
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
              onClick={() => setStep(5)}
              className="flex-1 rounded-xl bg-[#10B981] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#059669]"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div>
          <h2 className="mb-2 text-2xl font-bold">Rough monthly gross today?</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Optional — approximate booking revenue before fees. Skip if you are not live yet; we will
            infer from property size.
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
            Skip — not live or prefer not to say
          </button>
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
              onClick={() => setStep(6)}
              className="flex-1 rounded-xl bg-[#10B981] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#059669]"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 6 && (
        <div>
          <h2 className="mb-2 text-2xl font-bold">Email for your estimate</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            We will show results on the next screen. Your email helps if you request a co-host intro
            later.
          </p>
          <label className="sr-only" htmlFor="income-email">
            Email
          </label>
          <input
            id="income-email"
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
              onClick={() => setStep(5)}
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
              See my 12-month estimate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
