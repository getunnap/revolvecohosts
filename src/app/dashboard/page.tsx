import HostAccountChrome from "@/components/host/host-account-chrome";
import HostPageHero from "@/components/host/host-page-hero";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  ArrowRight,
  BarChart3,
  Handshake,
  Inbox,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

type ListingJoin = {
  title: string;
  location: string;
  listing_url: string;
} | null;

type ReportRow = {
  id: string;
  status: string;
  score: number | null;
  stripe_payment_status: string;
  created_at: string;
  listings: ListingJoin | ListingJoin[];
};

type IntroPreview = {
  id: string;
  status: string;
  operator_display_name: string | null;
  created_at: string;
};

function normalizeListing(raw: ReportRow["listings"]): ListingJoin {
  if (!raw) return null;
  if (Array.isArray(raw)) {
    const first = raw[0];
    return first && typeof first === "object" ? first : null;
  }
  return raw;
}

function paymentLabel(stripe: string): { label: string; tone: "paid" | "open" | "neutral" } {
  const s = (stripe ?? "").toLowerCase();
  if (s === "paid" || s === "complete" || s === "succeeded") return { label: "Paid", tone: "paid" };
  if (s === "unpaid" || s === "open" || s === "pending") return { label: "Not paid", tone: "open" };
  return { label: stripe || "—", tone: "neutral" };
}

function reportStatusLabel(status: string): string {
  const u = (status ?? "").toLowerCase();
  if (u === "complete" || u === "completed") return "Complete";
  if (u === "processing" || u === "generating") return "Processing";
  if (u === "failed") return "Failed";
  return status || "—";
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const { data: reportData } = await supabase
    .from("reports")
    .select(
      "id, status, score, stripe_payment_status, created_at, listings(title, location, listing_url)",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const reports = (reportData ?? []) as unknown as ReportRow[];

  const { data: introData, error: introError } = await supabase
    .from("host_intro_requests")
    .select("id, status, operator_display_name, created_at")
    .eq("host_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(8);

  const introRows = (introData ?? []) as IntroPreview[];
  const introsUnavailable =
    introError &&
    (String(introError.message).toLowerCase().includes("relation") ||
      String(introError.message).toLowerCase().includes("does not exist"));

  const pendingIntros = introRows.filter((r) => r.status === "pending").length;

  const toolCards = [
    {
      href: "/audit",
      title: "Listing audit",
      body: "Free optimisation preview for your live Airbnb URL — missed revenue and quick wins.",
      icon: BarChart3,
    },
    {
      href: "/find-cohost",
      title: "Co-host matchmaking",
      body: "Guided funnel → three curated operator matches and intro requests.",
      icon: Handshake,
    },
    {
      href: "/income-estimate",
      title: "Income estimate",
      body: "12-month gross band plus the same co-host shortlist as matchmaking.",
      icon: TrendingUp,
    },
  ];

  return (
    <HostAccountChrome email={user.email}>
      <HostPageHero
        eyebrow="Overview"
        title="Host dashboard"
        description="Run tools anytime while you stay logged in. Audits and intro requests are saved to this account; matchmaking and income flows use this browser for the current session until you submit an intro."
      />

      <section className="mb-12" aria-labelledby="tools-quick-heading">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <h2 id="tools-quick-heading" className="text-lg font-semibold text-foreground">
            Host tools
          </h2>
          <Link
            href="/tools"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#059669] underline-offset-4 hover:underline"
          >
            How each tool works
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <ul className="grid gap-4 sm:grid-cols-3">
          {toolCards.map(({ href, title, body, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex h-full flex-col rounded-2xl border border-border/80 bg-card/90 p-5 shadow-sm ring-1 ring-transparent transition-all hover:border-[#10B981]/35 hover:shadow-md hover:ring-[#10B981]/10"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#10B981]/10">
                  <Icon className="h-5 w-5 text-[#059669]" aria-hidden />
                </div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#059669]">
                  Open
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <section
          className="rounded-2xl border border-border/80 bg-card/90 p-6 shadow-sm sm:p-7"
          aria-labelledby="intros-heading"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                <Inbox className="h-5 w-5 text-violet-700 dark:text-violet-400" aria-hidden />
              </div>
              <h2 id="intros-heading" className="text-lg font-semibold text-foreground">
                Co-host intro requests
              </h2>
            </div>
            <Link
              href="/host/intros"
              className="text-sm font-semibold text-[#059669] underline-offset-4 hover:underline"
            >
              View all
            </Link>
          </div>

          {introsUnavailable ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
              Intro history will appear here once your account is fully connected. Tools and audits
              still work as normal.
            </p>
          ) : introRows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/15 px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No intros yet. Use matchmaking or an income estimate, then{" "}
                <strong className="font-medium text-foreground">Get in touch</strong> on a co-host
                card.
              </p>
              <Link
                href="/find-cohost"
                className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#10B981] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#059669]"
              >
                Start matchmaking
              </Link>
            </div>
          ) : (
            <>
              {pendingIntros > 0 ? (
                <p className="mb-4 rounded-xl border border-teal-200/80 bg-teal-50/80 px-3 py-2 text-sm text-teal-950 dark:border-teal-900/40 dark:bg-teal-950/25 dark:text-teal-100">
                  <Sparkles className="mr-1.5 inline-block h-4 w-4 align-text-bottom text-teal-600" />
                  {pendingIntros === 1
                    ? "1 intro is waiting for a co-host response."
                    : `${pendingIntros} intros are waiting for co-host responses.`}
                </p>
              ) : null}
              <ul className="space-y-3">
                {introRows.map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-muted/10 px-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {row.operator_display_name?.trim() || "Co-host"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {row.created_at
                          ? new Date(row.created_at).toLocaleString("en-GB", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "—"}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        row.status === "accepted"
                          ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200"
                          : row.status === "declined"
                            ? "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                            : "bg-amber-100 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100"
                      }`}
                    >
                      {row.status === "pending"
                        ? "Waiting"
                        : row.status === "accepted"
                          ? "Accepted"
                          : row.status === "declined"
                            ? "Declined"
                            : row.status}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section
          className="rounded-2xl border border-border/80 bg-card/90 p-6 shadow-sm sm:p-7"
          aria-labelledby="settings-shortcut-heading"
        >
          <h2 id="settings-shortcut-heading" className="text-lg font-semibold text-foreground">
            Account
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Password, session, and sign-in preferences.
          </p>
          <Link
            href="/dashboard/settings"
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50"
          >
            Open settings
            <ArrowRight className="h-4 w-4 text-[#059669]" aria-hidden />
          </Link>
        </section>
      </div>

      <section
        className="mt-10 rounded-2xl border border-border/80 bg-card/90 p-6 shadow-sm sm:p-7"
        aria-labelledby="audits-heading"
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 id="audits-heading" className="text-lg font-semibold text-foreground">
            Listing audits
          </h2>
          <Link
            href="/audit"
            className="inline-flex items-center justify-center rounded-xl bg-[#10B981] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#059669]"
          >
            New audit
          </Link>
        </div>

        {reports.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/15 px-4 py-10 text-center">
            <p className="font-medium text-foreground">No audits in your account yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Paste your Airbnb listing link — we will email you when the preview is ready.
            </p>
            <Link
              href="/audit"
              className="mt-6 inline-flex items-center justify-center rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50"
            >
              Run listing audit
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {reports.map((report) => {
              const listing = normalizeListing(report.listings);
              const pay = paymentLabel(report.stripe_payment_status);
              return (
                <li
                  key={report.id}
                  className="rounded-xl border border-border/70 bg-muted/10 p-4 transition-colors hover:border-[#10B981]/25 sm:p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground">
                        {listing?.title?.trim() || "Listing audit"}
                      </h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {listing?.location?.trim() || "Location on file"}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(report.created_at).toLocaleString("en-GB", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-background px-2.5 py-0.5 text-xs font-medium text-foreground ring-1 ring-border">
                          Report: {reportStatusLabel(report.status)}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            pay.tone === "paid"
                              ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200"
                              : pay.tone === "open"
                                ? "bg-amber-100 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {pay.label}
                        </span>
                        {report.score != null ? (
                          <span className="rounded-full bg-background px-2.5 py-0.5 text-xs font-medium text-foreground ring-1 ring-border">
                            Score {(report.score / 10).toFixed(1)}/10
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                      <Link
                        href={`/pre-report/${report.id}`}
                        className="inline-flex items-center justify-center rounded-xl bg-[#10B981] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#059669]"
                      >
                        View report
                      </Link>
                      {listing?.listing_url ? (
                        <a
                          href={listing.listing_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-center text-sm font-semibold text-[#059669] underline-offset-2 hover:underline"
                        >
                          Open Airbnb listing
                        </a>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </HostAccountChrome>
  );
}
