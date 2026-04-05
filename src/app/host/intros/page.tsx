import HostMockRematchButton from "@/components/host/host-mock-rematch-button";
import HostAccountChrome from "@/components/host/host-account-chrome";
import HostPageHero from "@/components/host/host-page-hero";
import {
  hostToOperatorEmailTemplate,
  hostToOperatorWhatsAppTemplate,
} from "@/lib/intro-messaging-templates";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

type IntroRow = {
  id: string;
  status: string;
  operator_display_name: string | null;
  host_request_cohort_id: string;
  catalog_match_id: string | null;
  created_at: string;
  public_snapshot: Record<string, unknown> | null;
};

function statusLabel(s: string): string {
  if (s === "pending") return "Waiting for co-host";
  if (s === "accepted") return "Accepted — check your email";
  if (s === "declined") return "Declined";
  return s;
}

export default async function HostIntrosPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect(`/login?next=${encodeURIComponent("/host/intros")}`);
  }

  const { data, error } = await supabase
    .from("host_intro_requests")
    .select(
      "id, status, operator_display_name, host_request_cohort_id, catalog_match_id, created_at, public_snapshot",
    )
    .eq("host_user_id", user.id)
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as IntroRow[];
  const migrationHint =
    error &&
    (String(error.message).toLowerCase().includes("relation") ||
      String(error.message).toLowerCase().includes("does not exist"));

  const byCohort = new Map<string, IntroRow[]>();
  for (const r of rows) {
    const list = byCohort.get(r.host_request_cohort_id) ?? [];
    list.push(r);
    byCohort.set(r.host_request_cohort_id, list);
  }

  return (
    <HostAccountChrome email={user.email}>
      <HostPageHero
        eyebrow="Co-host intros"
        title="Your intro requests"
        description="Track co-host responses. You will get email updates when someone accepts or declines."
      >
        <Link
          href="/find-cohost"
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#10B981] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#059669]"
        >
          Find a co-host
        </Link>
      </HostPageHero>

      <div className="rounded-2xl border border-border/80 bg-card/90 p-6 shadow-sm backdrop-blur-sm sm:p-8">
      {sp.submitted === "1" ? (
        <p className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
          Intro sent — the co-host will review your property summary. We’ll email you when they
          respond.
        </p>
      ) : null}

      {migrationHint ? (
        <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Intro tracking is not available yet. Please try again later or contact{" "}
          <a
            href="mailto:hello@revolvecohosts.com"
            className="font-semibold text-[#059669] underline-offset-2 hover:underline"
          >
            hello@revolvecohosts.com
          </a>{" "}
          if this continues.
        </p>
      ) : null}

      {rows.length === 0 && !migrationHint ? (
        <p className="text-sm text-muted-foreground">
          No intros yet.{" "}
          <Link href="/find-cohost" className="font-semibold text-[#059669] hover:underline">
            Start the matching flow
          </Link>{" "}
          to get three recommendations.
        </p>
      ) : null}

      <ul className="mt-6 space-y-10">
        {Array.from(byCohort.entries()).map(([cohortId, group]) => {
          const pendingOthers = group.filter((g) => g.status === "pending");
          const names = pendingOthers
            .map((g) => g.operator_display_name)
            .filter((n): n is string => Boolean(n?.trim()));
          const pendingLine =
            pendingOthers.length === 0
              ? null
              : pendingOthers.length === 1
                ? `${names[0] ?? "A co-host"} is still reviewing your request.`
                : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]} are still reviewing your request.`;

          const excludeForRematch = [
            ...new Set(
              group
                .map((g) => g.catalog_match_id)
                .filter((id): id is string => Boolean(id?.trim())),
            ),
          ];

          return (
            <li key={cohortId}>
              {pendingLine ? (
                <p className="mb-3 text-sm font-medium text-foreground">{pendingLine}</p>
              ) : (
                <p className="mb-3 text-sm text-muted-foreground">
                  No open requests in this batch — you can run matching again for fresh
                  recommendations.
                </p>
              )}
              {pendingOthers.length === 0 && group.length > 0 ? (
                <div className="mb-4">
                  <HostMockRematchButton excludeCatalogIds={excludeForRematch} />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Still using demo co-host cards — we’ll skip your last picks where possible.
                    You need your original match funnel answers in this browser session.
                  </p>
                </div>
              ) : null}
              <ul className="space-y-3 rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
                {group.map((r) => {
                  const snap = r.public_snapshot ?? {};
                  const area = typeof snap.area === "string" ? snap.area : "—";
                  const emailTpl = hostToOperatorEmailTemplate(area);
                  const waTpl = hostToOperatorWhatsAppTemplate(area);
                  return (
                    <li
                      key={r.id}
                      className="flex flex-col gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0"
                    >
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-medium text-foreground">
                            {r.operator_display_name ?? "Co-host"}
                          </p>
                          <p className="text-xs text-muted-foreground">{area}</p>
                        </div>
                        <span className="text-sm font-semibold text-[#059669]">
                          {statusLabel(r.status)}
                        </span>
                      </div>
                      {r.status === "accepted" ? (
                        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/25">
                          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900 dark:text-emerald-100">
                            Starter messages to the co-host
                          </p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            Use the contact details from your email, or copy one of these:
                          </p>
                          <div className="mt-2 space-y-2">
                            <div>
                              <p className="text-[10px] font-semibold uppercase text-muted-foreground">
                                Email
                              </p>
                              <pre className="mt-1 max-h-28 overflow-auto whitespace-pre-wrap rounded-lg bg-background/90 p-2 text-[11px] leading-relaxed ring-1 ring-border">
                                {emailTpl}
                              </pre>
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold uppercase text-muted-foreground">
                                WhatsApp
                              </p>
                              <pre className="mt-1 max-h-28 overflow-auto whitespace-pre-wrap rounded-lg bg-background/90 p-2 text-[11px] leading-relaxed ring-1 ring-border">
                                {waTpl}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>

      <p className="mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center text-sm text-muted-foreground">
        <Link href="/find-cohost/results" className="font-semibold text-[#059669] hover:underline">
          Latest match results
        </Link>
        <span className="hidden text-border sm:inline">·</span>
        <Link href="/income-estimate" className="font-semibold text-[#059669] hover:underline">
          Income estimate
        </Link>
      </p>
      </div>
    </HostAccountChrome>
  );
}
