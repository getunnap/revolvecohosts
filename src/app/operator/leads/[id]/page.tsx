import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import OperatorLeadActions from "@/components/operator/operator-lead-actions";
import OperatorPortalShell from "@/components/operator/operator-portal-shell";
import {
  hostToOperatorEmailTemplate,
  hostToOperatorWhatsAppTemplate,
} from "@/lib/intro-messaging-templates";
import type { IntroPublicSnapshot } from "@/lib/intro-requests/types";
import { ensureOperatorProfileRow } from "@/lib/operator/ensure-operator-row";
import { getOperatorLeadById, OPERATOR_EXAMPLE_LEAD_ID } from "@/lib/operator-mock";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (id === OPERATOR_EXAMPLE_LEAD_ID) {
    const lead = getOperatorLeadById(id);
    if (!lead) return { title: "Lead" };
    return {
      title: `Lead · ${lead.hostLabel}`,
      description: `Operator lead detail for ${lead.area}.`,
    };
  }
  return { title: "Intro request" };
}

function formatGbpRange(low: number, high: number): string {
  return `${new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(low)} – ${new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(high)} / mo`;
}

export default async function OperatorLeadDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?as=cohost&next=${encodeURIComponent(`/operator/leads/${id}`)}`,
    );
  }

  await ensureOperatorProfileRow(supabase, user);

  if (id === OPERATOR_EXAMPLE_LEAD_ID) {
    const lead = getOperatorLeadById(id);
    if (!lead) notFound();
    return (
      <OperatorPortalShell email={user.email ?? ""}>
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href="/operator"
            className="text-sm font-semibold text-[#059669] hover:underline"
          >
            ← Back to portal
          </Link>
          <p className="mt-4 inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
            Sample lead — layout preview only
          </p>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {lead.hostLabel}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{lead.receivedLabel}</p>
          <dl className="mt-8 space-y-6 rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Area and market
              </dt>
              <dd className="mt-1 text-foreground">{lead.area}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Property
              </dt>
              <dd className="mt-1 text-foreground">{lead.propertySummary}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Listing stage
              </dt>
              <dd className="mt-1 text-foreground">{lead.listingStage}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Guest profile
              </dt>
              <dd className="mt-1 text-foreground">{lead.guestProfile}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                What they want from a co-host
              </dt>
              <dd className="mt-1 text-pretty text-foreground">{lead.intent}</dd>
            </div>
          </dl>
        </div>
      </OperatorPortalShell>
    );
  }

  const { data: intro, error: introErr } = await supabase
    .from("host_intro_requests")
    .select("id, status, public_snapshot, operator_display_name, created_at")
    .eq("id", id)
    .eq("operator_user_id", user.id)
    .maybeSingle();

  if (introErr || !intro) {
    notFound();
  }

  const snap = (intro.public_snapshot ?? {}) as unknown as IntroPublicSnapshot;
  const rev = snap.revenueProjection;

  type ContactRow = {
    host_email: string;
    host_phone: string | null;
    property_full_address: string;
    listing_url: string | null;
    host_notes: string | null;
  };

  let contact: ContactRow | null = null;

  if (intro.status === "accepted") {
    const { data: c } = await supabase
      .from("host_intro_request_contact")
      .select("host_email, host_phone, property_full_address, listing_url, host_notes")
      .eq("intro_request_id", id)
      .maybeSingle();
    contact = (c ?? null) as ContactRow | null;
  }

  const emailTemplate = hostToOperatorEmailTemplate(snap.area);
  const waTemplate = hostToOperatorWhatsAppTemplate(snap.area);

  return (
    <OperatorPortalShell email={user.email ?? ""}>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/operator"
          className="text-sm font-semibold text-[#059669] hover:underline"
        >
          ← Back to portal
        </Link>

        <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {snap.hostLabel ?? "Host intro"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Requested{" "}
          {intro.created_at
            ? new Date(intro.created_at).toLocaleString("en-GB", {
                dateStyle: "medium",
                timeStyle: "short",
              })
            : "—"}
        </p>

        <OperatorLeadActions introId={id} initialStatus={intro.status} />

        <dl className="mt-8 space-y-6 rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Area and market
            </dt>
            <dd className="mt-1 text-foreground">{snap.area}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Property
            </dt>
            <dd className="mt-1 text-foreground">{snap.propertySummary}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Listing stage
            </dt>
            <dd className="mt-1 text-foreground">{snap.listingStage}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Guest profile
            </dt>
            <dd className="mt-1 text-foreground">{snap.guestProfile}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Revenue band (from host tool)
            </dt>
            <dd className="mt-1 text-foreground">
              {rev
                ? `${formatGbpRange(rev.monthlyLow, rev.monthlyHigh)} · ${rev.headline}`
                : "—"}
            </dd>
          </div>
          {snap.matchReason ? (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Why they matched with you
              </dt>
              <dd className="mt-1 text-pretty text-foreground">{snap.matchReason}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              What they want
            </dt>
            <dd className="mt-1 text-pretty text-foreground">{snap.intent}</dd>
          </div>
        </dl>

        {intro.status === "accepted" && contact ? (
          <div className="mt-8 space-y-6 rounded-2xl border border-[#059669]/30 bg-[#059669]/[0.06] p-6">
            <h2 className="text-lg font-semibold text-foreground">Unlocked — contact the host</h2>
            <ul className="space-y-2 text-sm text-foreground">
              <li>
                <span className="font-semibold text-muted-foreground">Email: </span>
                <a className="font-medium text-[#059669] underline" href={`mailto:${contact.host_email}`}>
                  {contact.host_email}
                </a>
              </li>
              {contact.host_phone ? (
                <li>
                  <span className="font-semibold text-muted-foreground">Phone: </span>
                  {contact.host_phone}
                </li>
              ) : null}
              <li>
                <span className="font-semibold text-muted-foreground">Property address: </span>
                {contact.property_full_address}
              </li>
              {contact.listing_url ? (
                <li>
                  <span className="font-semibold text-muted-foreground">Listing: </span>
                  <a
                    href={contact.listing_url}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-[#059669] underline"
                  >
                    {contact.listing_url}
                  </a>
                </li>
              ) : null}
              {contact.host_notes ? (
                <li>
                  <span className="font-semibold text-muted-foreground">Host notes: </span>
                  {contact.host_notes}
                </li>
              ) : null}
            </ul>

            <div className="space-y-4 border-t border-[#059669]/20 pt-6">
              <p className="text-sm font-semibold text-foreground">Starter templates</p>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Email
                </p>
                <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-background/80 p-4 text-xs leading-relaxed text-foreground ring-1 ring-border">
                  {emailTemplate}
                </pre>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  WhatsApp
                </p>
                <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-background/80 p-4 text-xs leading-relaxed text-foreground ring-1 ring-border">
                  {waTemplate}
                </pre>
              </div>
            </div>
          </div>
        ) : intro.status === "pending" ? (
          <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
            Host contact details, full address, and any listing link stay hidden until you accept
            (one intro credit).
          </p>
        ) : null}
      </div>
    </OperatorPortalShell>
  );
}
