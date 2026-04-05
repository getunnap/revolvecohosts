"use client";

import type { MatchCard } from "@/lib/match-funnel";
import Link from "next/link";
import { Sparkles, Star } from "lucide-react";

/** Preview cards: solid white — full card opens profile except "Get in touch". */
export function MatchProfileCard({
  m,
  recommended = false,
}: {
  m: MatchCard;
  recommended?: boolean;
}) {
  const profileHref = `/find-cohost/profile/${m.id}`;
  return (
    <article
      className={`group relative flex h-full flex-col overflow-visible rounded-2xl bg-white p-6 transition-shadow hover:shadow-lg ${
        recommended
          ? "z-[1] border-2 border-[#10B981] shadow-lg shadow-emerald-200/50 ring-2 ring-[#10B981]/25 sm:scale-[1.02] sm:shadow-xl"
          : "border border-rose-100/90 shadow-md shadow-rose-100/20"
      }`}
    >
      <Link
        href={profileHref}
        className="absolute inset-0 z-0 rounded-2xl"
        aria-label={`Open ${m.displayName}'s full profile`}
      />
      {recommended && (
        <span
          className="pointer-events-none absolute left-1/2 top-0 z-30 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-[#10B981] bg-gradient-to-r from-[#10B981] to-teal-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md ring-[3px] ring-white sm:text-[11px]"
          role="status"
        >
          <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Recommended match
        </span>
      )}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col pointer-events-none">
        <div className="mb-4 flex justify-center">
          <img
            src={m.profileImageUrl}
            alt={m.displayName}
            className={`h-28 w-28 rounded-full object-cover transition-transform group-hover:scale-[1.02] ${
              recommended ? "ring-[3px] ring-[#10B981] ring-offset-2 ring-offset-white" : "ring-2 ring-zinc-100"
            }`}
            width={112}
            height={112}
          />
        </div>
        <h2 className="text-center text-lg font-bold tracking-tight text-zinc-900 group-hover:text-[#FF385C]">
          {m.displayName}
        </h2>
        <p className="mb-3 text-center text-sm font-medium text-teal-700">{m.cohostHeadline}</p>
        <p className="mb-4 line-clamp-4 flex-1 text-center text-sm leading-relaxed text-zinc-600">
          {m.bio}
        </p>
        <div className="my-4 border-t border-rose-100/80" />
        <div className="grid grid-cols-3 gap-1.5 text-center text-[11px] sm:text-xs">
          <div className="rounded-lg bg-sky-100/90 py-2 ring-1 ring-sky-200/50">
            <div className="font-bold text-sky-900">{m.listingsManaged}</div>
            <div className="font-medium text-sky-700/85">listings</div>
          </div>
          <div className="rounded-lg bg-amber-100/90 py-2 ring-1 ring-amber-200/50">
            <div className="flex items-center justify-center gap-0.5 font-bold text-amber-900">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" aria-hidden />
              {m.guestRating.toFixed(2)}
            </div>
            <div className="font-medium text-amber-800/85">guest rating</div>
          </div>
          <div className="rounded-lg bg-emerald-100/90 py-2 ring-1 ring-emerald-200/50">
            <div className="font-bold text-emerald-900">{m.yearsHosting}</div>
            <div className="font-medium text-emerald-800/85">years hosting</div>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-rose-100/80 bg-gradient-to-r from-rose-50/90 to-orange-50/90 px-3 py-2.5 text-left text-xs leading-snug text-zinc-800">
          <span className="font-bold text-[#FF385C]">Why you matched: </span>
          {m.matchReason}
        </div>
        <Link
          href={`/find-cohost/get-in-touch/${m.id}`}
          className="relative z-20 mt-4 block w-full cursor-pointer rounded-full bg-gradient-to-r from-[#FF385C] to-rose-500 py-3 text-center text-sm font-bold text-white shadow-lg shadow-rose-300/40 pointer-events-auto transition-transform hover:scale-[1.02]"
        >
          Get in touch
        </Link>
        <span className="mt-2 block w-full rounded-full border-2 border-zinc-200 bg-white py-3 text-center text-sm font-semibold text-zinc-800 group-hover:border-teal-300 group-hover:bg-teal-50/50">
          View profile
        </span>
        <p className="mt-3 text-center text-[11px] font-medium text-teal-700/70">
          Click card for full profile · Intro via RC-H
        </p>
      </div>
    </article>
  );
}
