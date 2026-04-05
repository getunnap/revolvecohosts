"use client";

import type { CohostAchievement, CohostServiceIcon, MatchCard } from "@/lib/match-funnel";
import Link from "next/link";
import {
  Armchair,
  Award,
  Calendar,
  Camera,
  ChevronRight,
  ClipboardList,
  Coins,
  Home,
  Key,
  MapPin,
  Medal,
  MessageCircle,
  Sparkles,
  SprayCan,
  Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getActiveMatchResultsPath } from "@/lib/client-storage";
import { useCallback, useEffect, useState } from "react";

const SERVICE_ICONS: Record<CohostServiceIcon, LucideIcon> = {
  home: Home,
  coins: Coins,
  calendar: Calendar,
  messages: MessageCircle,
  key: Key,
  spray: SprayCan,
  camera: Camera,
  armchair: Armchair,
  clipboard: ClipboardList,
  sparkles: Sparkles,
};

const SERVICE_ICON_STYLES: Record<CohostServiceIcon, string> = {
  home: "bg-sky-100 text-sky-700 shadow-sm shadow-sky-200/50",
  coins: "bg-amber-100 text-amber-700 shadow-sm shadow-amber-200/50",
  calendar: "bg-violet-100 text-violet-700 shadow-sm shadow-violet-200/50",
  messages: "bg-rose-100 text-rose-600 shadow-sm shadow-rose-200/50",
  key: "bg-orange-100 text-orange-700 shadow-sm shadow-orange-200/50",
  spray: "bg-cyan-100 text-cyan-700 shadow-sm shadow-cyan-200/50",
  camera: "bg-fuchsia-100 text-fuchsia-700 shadow-sm shadow-fuchsia-200/50",
  armchair: "bg-emerald-100 text-emerald-700 shadow-sm shadow-emerald-200/50",
  clipboard: "bg-indigo-100 text-indigo-700 shadow-sm shadow-indigo-200/50",
  sparkles: "bg-pink-100 text-pink-600 shadow-sm shadow-pink-200/50",
};

function ServiceIcon({ icon }: { icon: CohostServiceIcon }) {
  const Icon = SERVICE_ICONS[icon];
  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${SERVICE_ICON_STYLES[icon]}`}
    >
      <Icon className="h-6 w-6" strokeWidth={1.85} />
    </div>
  );
}

function AchievementRow({ a }: { a: CohostAchievement }) {
  const Icon = a.icon === "medal" ? Medal : Award;
  const shell =
    a.icon === "medal"
      ? "bg-gradient-to-br from-rose-100 to-orange-100 text-rose-600 ring-2 ring-rose-200/60"
      : "bg-gradient-to-br from-amber-100 to-yellow-100 text-amber-700 ring-2 ring-amber-200/60";
  return (
    <div className="flex gap-4 rounded-2xl bg-white/60 p-4 ring-1 ring-rose-100/80 backdrop-blur-sm">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${shell}`}
      >
        <Icon className="h-6 w-6" strokeWidth={1.5} />
      </div>
      <div>
        <p className="font-semibold text-zinc-900">{a.title}</p>
        <p className="mt-1 text-sm leading-relaxed text-zinc-600">{a.description}</p>
      </div>
    </div>
  );
}

const NAV = [
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "location", label: "Location" },
  { id: "listings", label: "Listings" },
] as const;

export default function CohostProfileDetail({ profile }: { profile: MatchCard }) {
  const [showAllHoods, setShowAllHoods] = useState(false);
  const [backToMatchesHref, setBackToMatchesHref] = useState("/find-cohost/results");
  const hoods = profile.neighbourhoods ?? [];
  const visibleHoods = showAllHoods ? hoods : hoods.slice(0, 8);

  useEffect(() => {
    setBackToMatchesHref(getActiveMatchResultsPath() ?? "/find-cohost/results");
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5F3] via-[#F5FBF8] to-[#EEF6FF] pb-24">
      <div className="border-b border-rose-100/90 bg-white/75 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <nav className="flex flex-wrap gap-6 text-sm font-semibold text-zinc-600">
            {NAV.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => scrollTo(id)}
                className="border-b-2 border-transparent pb-1 transition-colors hover:border-[#FF385C] hover:text-[#FF385C]"
              >
                {label}
              </button>
            ))}
          </nav>
          <Link
            href={`/find-cohost/get-in-touch/${profile.id}`}
            className="hidden rounded-full bg-[#FF385C] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-300/40 transition-transform hover:scale-[1.02] hover:bg-[#E31C5F] sm:inline-block"
          >
            Get in touch
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        <Link
          href={backToMatchesHref}
          className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 transition-colors hover:text-[#FF385C]"
        >
          <ChevronRight className="h-4 w-4 rotate-180" aria-hidden />
          Back to your matches
        </Link>

        <div className="lg:grid lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)] lg:gap-12 xl:gap-16">
          <aside className="mb-10 lg:mb-0">
            <div className="lg:sticky lg:top-24">
              <div className="rounded-2xl border border-white/80 bg-white/90 p-6 text-center shadow-lg shadow-rose-200/20 ring-1 ring-rose-100/60 backdrop-blur-sm">
                <div className="mb-4 flex justify-center">
                  <img
                    src={profile.profileImageUrl}
                    alt=""
                    className="h-36 w-36 rounded-full object-cover ring-2 ring-zinc-100"
                    width={144}
                    height={144}
                  />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                  {profile.displayName}
                </h1>
                <p className="mt-1 text-sm font-medium text-teal-700">{profile.cohostHeadline}</p>
                <p className="mt-4 text-sm leading-relaxed text-zinc-600">{profile.bio}</p>
                <div className="my-6 border-t border-rose-100" />
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="rounded-xl bg-sky-50 py-2 ring-1 ring-sky-100">
                    <div className="font-bold text-sky-900">{profile.listingsManaged}</div>
                    <div className="text-[11px] font-medium text-sky-700/80">listings</div>
                  </div>
                  <div className="rounded-xl bg-amber-50 py-2 ring-1 ring-amber-100">
                    <div className="flex items-center justify-center gap-0.5 font-bold text-amber-900">
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      {profile.guestRating.toFixed(2)}
                    </div>
                    <div className="text-[11px] font-medium text-amber-800/80">guest rating</div>
                  </div>
                  <div className="rounded-xl bg-emerald-50 py-2 ring-1 ring-emerald-100">
                    <div className="font-bold text-emerald-900">{profile.yearsHosting}</div>
                    <div className="text-[11px] font-medium text-emerald-800/80">years hosting</div>
                  </div>
                </div>
                <div className="mt-4 rounded-xl bg-gradient-to-r from-rose-50 to-orange-50 px-3 py-2.5 text-xs leading-snug text-zinc-800 ring-1 ring-rose-100/80">
                  <p className="font-semibold text-[#FF385C]">Why you matched</p>
                  <p className="mt-1.5 text-zinc-800">{profile.matchReason}</p>
                </div>
                <Link
                  href={`/find-cohost/get-in-touch/${profile.id}`}
                  className="mt-6 block w-full rounded-full bg-[#FF385C] py-3 text-center text-sm font-semibold text-white shadow-md shadow-rose-300/40 transition-transform hover:scale-[1.01] hover:bg-[#E31C5F]"
                >
                  Get in touch
                </Link>
              </div>
            </div>
          </aside>

          <div className="min-w-0 space-y-14">
            <section id="about" className="scroll-mt-28">
              <h2 className="mb-6 bg-gradient-to-r from-[#FF385C] to-teal-600 bg-clip-text text-xl font-bold tracking-tight text-transparent">
                About me
              </h2>
              <div className="space-y-8">
                {(profile.achievements ?? []).map((a, i) => (
                  <AchievementRow key={i} a={a} />
                ))}
                {(profile.achievements ?? []).length === 0 && (
                  <p className="text-sm text-zinc-600">
                    This co-host has verified hosting experience on Airbnb-style profiles.
                  </p>
                )}
              </div>
            </section>

            <section id="services" className="scroll-mt-28">
              <h2 className="mb-2 bg-gradient-to-r from-violet-600 to-sky-600 bg-clip-text text-xl font-bold tracking-tight text-transparent">
                Full or custom support
              </h2>
              <p className="mb-8 text-sm font-medium text-zinc-600">
                Get help with everything or individual services.
              </p>
              <ul className="space-y-8">
                {(profile.services ?? []).map((s, i) => (
                  <li key={i} className="flex gap-4">
                    <ServiceIcon icon={s.icon} />
                    <div>
                      <h3 className="font-semibold text-zinc-900">{s.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                        {s.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section id="location" className="scroll-mt-28">
              <h2 className="mb-4 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-xl font-bold tracking-tight text-transparent">
                My service area
              </h2>
              <div className="mb-4 overflow-hidden rounded-2xl border border-teal-100 shadow-md shadow-teal-100/40 ring-2 ring-teal-50">
                <div className="relative flex aspect-[21/9] min-h-[180px] flex-col items-center justify-center gap-2 bg-gradient-to-br from-teal-100/90 via-emerald-50 to-sky-100 sm:aspect-[2/1]">
                  <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_30%_40%,rgb(45,212,191)_0%,transparent_45%),radial-gradient(circle_at_70%_60%,rgb(125,211,252)_0%,transparent_40%)]" />
                  <MapPin className="relative h-9 w-9 text-teal-600 drop-shadow-sm" />
                  <p className="relative text-sm font-semibold text-teal-900">Map preview</p>
                  <p className="relative max-w-xs px-4 text-center text-xs font-medium text-teal-800/80">
                    Service area from Airbnb-style data will appear here when connected.
                  </p>
                </div>
              </div>
              {hoods.length > 0 && (
                <p className="text-sm leading-relaxed text-zinc-700">
                  {visibleHoods.join(" · ")}
                  {hoods.length > 8 && !showAllHoods && " · "}
                  {hoods.length > 8 && (
                    <button
                      type="button"
                      onClick={() => setShowAllHoods(!showAllHoods)}
                      className="ml-1 font-semibold text-[#FF385C] underline-offset-2 hover:underline"
                    >
                      {showAllHoods ? "Show less" : "Show more"}
                    </button>
                  )}
                </p>
              )}
            </section>

            <section id="listings" className="scroll-mt-28">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="bg-gradient-to-r from-fuchsia-600 to-rose-500 bg-clip-text text-xl font-bold tracking-tight text-transparent">
                  My listings
                </h2>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2">
                {(profile.listingsPreview ?? []).map((listing, i) => (
                  <li
                    key={i}
                    className="overflow-hidden rounded-2xl border border-rose-100/80 bg-white shadow-md shadow-rose-100/30 ring-1 ring-amber-100/50 transition-transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-100/40"
                  >
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-amber-50 to-rose-50">
                      <img
                        src={listing.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      {listing.guestFavourite && (
                        <span className="absolute left-2 top-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-400 px-2.5 py-1 text-xs font-bold text-white shadow-md">
                          Guest favourite
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-zinc-900">{listing.title}</h3>
                        <span className="flex shrink-0 items-center gap-0.5 text-sm font-bold text-amber-700">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                          {listing.rating.toFixed(2)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-medium text-teal-700/90">{listing.tenure}</p>
                    </div>
                  </li>
                ))}
              </ul>
              {(profile.listingsPreview ?? []).length > 0 && (
                <button
                  type="button"
                  className="mt-6 rounded-full border-2 border-violet-200 bg-violet-50 px-6 py-2.5 text-sm font-bold text-violet-900 transition-colors hover:border-violet-300 hover:bg-violet-100"
                >
                  Show all {profile.listingsManaged} listings
                </button>
              )}
            </section>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-rose-100 bg-white/95 p-4 shadow-[0_-8px_30px_rgba(255,56,92,0.12)] backdrop-blur-md sm:hidden">
        <Link
          href={`/find-cohost/get-in-touch/${profile.id}`}
          className="block w-full rounded-full bg-gradient-to-r from-[#FF385C] to-rose-500 py-3 text-center text-sm font-bold text-white shadow-lg shadow-rose-300/50"
        >
          Get in touch
        </Link>
      </div>
    </div>
  );
}
