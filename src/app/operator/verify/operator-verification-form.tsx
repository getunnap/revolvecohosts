"use client";

import Link from "next/link";
import { useActionState } from "react";
import { submitOperatorVerification } from "./actions";

const LISTING_BANDS = [
  { value: "1", label: "1 listing" },
  { value: "2-5", label: "2–5 listings" },
  { value: "6-15", label: "6–15 listings" },
  { value: "16+", label: "16+ listings" },
];

type Initial = {
  fullName: string;
  phone: string;
  areasServed: string;
  listingsManaged: string;
  portfolioUrl: string;
  pitch: string;
};

export default function OperatorVerificationForm({ initial }: { initial: Initial }) {
  const [state, formAction, pending] = useActionState(submitOperatorVerification, undefined);

  if (state?.ok) {
    return (
      <div className="rounded-2xl border-2 border-[#10B981]/40 bg-[#10B981]/5 p-8 text-center">
        <p className="text-lg font-semibold text-foreground">Profile saved</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Your verification details are on file. We will email you when your profile is approved.
        </p>
        <Link
          href="/operator"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#10B981] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#059669]"
        >
          Back to portal
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label htmlFor="ov-name" className="mb-1.5 block text-sm font-medium text-foreground">
          Full name
        </label>
        <input
          id="ov-name"
          name="fullName"
          required
          autoComplete="name"
          defaultValue={initial.fullName}
          className="w-full rounded-xl border border-input bg-input-background px-4 py-3 text-sm text-foreground outline-none ring-offset-background focus-visible:border-[#10B981]/40 focus-visible:ring-2 focus-visible:ring-[#10B981]/35"
        />
      </div>
      <div>
        <label htmlFor="ov-phone" className="mb-1.5 block text-sm font-medium text-foreground">
          Phone <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <input
          id="ov-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          defaultValue={initial.phone}
          className="w-full rounded-xl border border-input bg-input-background px-4 py-3 text-sm text-foreground outline-none ring-offset-background focus-visible:border-[#10B981]/40 focus-visible:ring-2 focus-visible:ring-[#10B981]/35"
        />
      </div>
      <div>
        <label htmlFor="ov-areas" className="mb-1.5 block text-sm font-medium text-foreground">
          Markets / areas you serve
        </label>
        <textarea
          id="ov-areas"
          name="areasServed"
          required
          rows={3}
          placeholder="e.g. Greater London, Edinburgh, coastal Cornwall…"
          defaultValue={initial.areasServed}
          className="w-full resize-y rounded-xl border border-input bg-input-background px-4 py-3 text-sm text-foreground outline-none ring-offset-background focus-visible:border-[#10B981]/40 focus-visible:ring-2 focus-visible:ring-[#10B981]/35"
        />
      </div>
      <div>
        <label htmlFor="ov-listings" className="mb-1.5 block text-sm font-medium text-foreground">
          Listings you co-host or manage today
        </label>
        <select
          id="ov-listings"
          name="listingsManaged"
          required
          defaultValue={initial.listingsManaged || ""}
          className="w-full rounded-xl border border-input bg-input-background px-4 py-3 text-sm text-foreground outline-none ring-offset-background focus-visible:border-[#10B981]/40 focus-visible:ring-2 focus-visible:ring-[#10B981]/35"
        >
          <option value="">Select…</option>
          {LISTING_BANDS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="ov-url" className="mb-1.5 block text-sm font-medium text-foreground">
          Portfolio or profile URL{" "}
          <span className="font-normal text-muted-foreground">
            (Airbnb, site, LinkedIn — helps us verify faster)
          </span>
        </label>
        <input
          id="ov-url"
          name="portfolioUrl"
          type="url"
          inputMode="url"
          placeholder="https://"
          defaultValue={initial.portfolioUrl}
          className="w-full rounded-xl border border-input bg-input-background px-4 py-3 text-sm text-foreground outline-none ring-offset-background focus-visible:border-[#10B981]/40 focus-visible:ring-2 focus-visible:ring-[#10B981]/35"
        />
      </div>
      <div>
        <label htmlFor="ov-pitch" className="mb-1.5 block text-sm font-medium text-foreground">
          Anything else we should know
        </label>
        <textarea
          id="ov-pitch"
          name="pitch"
          rows={3}
          placeholder="Services you offer, niche, team size…"
          defaultValue={initial.pitch}
          className="w-full resize-y rounded-xl border border-input bg-input-background px-4 py-3 text-sm text-foreground outline-none ring-offset-background focus-visible:border-[#10B981]/40 focus-visible:ring-2 focus-visible:ring-[#10B981]/35"
        />
      </div>

      {state && !state.ok ? (
        <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-[#10B981] py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#059669] disabled:pointer-events-none disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save verification profile"}
      </button>
    </form>
  );
}
