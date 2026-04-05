import Link from "next/link";
import { ClipboardList, Clock, Mail, ShieldAlert, Sparkles } from "lucide-react";

const SUPPORT_EMAIL = "hello@revolvecohosts.com";

export default function OperatorReviewStatusPanel({
  status,
  profileComplete,
}: {
  status: "pending_review" | "approved" | "suspended";
  profileComplete: boolean;
}) {
  if (status === "approved") return null;

  if (status === "suspended") {
    return (
      <div
        className="mb-8 rounded-2xl border border-red-200/90 bg-red-50/90 px-5 py-5 shadow-sm dark:border-red-900/50 dark:bg-red-950/30 sm:px-6 sm:py-6"
        role="region"
        aria-labelledby="operator-suspended-heading"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950/50">
            <ShieldAlert className="h-6 w-6 text-red-700 dark:text-red-300" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2
              id="operator-suspended-heading"
              className="text-lg font-semibold tracking-tight text-foreground"
            >
              Account paused
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Your co-host portal access is suspended. This is usually temporary while we resolve a
              compliance or quality issue.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Email{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=Co-host%20account%20status`}
                className="font-semibold text-[#059669] underline-offset-2 hover:underline"
              >
                {SUPPORT_EMAIL}
              </a>{" "}
              and we will explain the next steps.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="mb-8 overflow-hidden rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50/95 via-background to-orange-50/40 shadow-md shadow-amber-100/30 ring-1 ring-amber-100/60 dark:border-amber-900/40 dark:from-amber-950/40 dark:via-background dark:to-orange-950/20 dark:ring-amber-900/30"
      role="region"
      aria-label="Account under review"
    >
      <div className="border-b border-amber-200/70 bg-amber-100/50 px-5 py-4 dark:border-amber-900/40 dark:bg-amber-950/30 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-950 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-100">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            Under review
          </span>
          <p className="text-sm font-medium text-amber-950/90 dark:text-amber-100/90">
            You can use the portal, but live host intros are only routed once Revolve approves your
            operator profile.
          </p>
        </div>
      </div>

      <div className="space-y-6 px-5 py-6 sm:px-6">
        {!profileComplete ? (
          <div className="flex flex-col gap-4 rounded-xl border border-[#10B981]/35 bg-[#10B981]/5 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#10B981]/15">
                <ClipboardList className="h-5 w-5 text-[#047857]" aria-hidden />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">
                  Complete your verification details
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  We need your markets, scale, and proof of experience — the same information we use
                  when you apply by email. It only takes a few minutes.
                </p>
              </div>
            </div>
            <Link
              href="/operator/verify"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#10B981] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#059669] sm:min-w-[10rem]"
            >
              Complete profile
            </Link>
          </div>
        ) : (
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#10B981]/12">
              <Sparkles className="h-5 w-5 text-[#059669]" aria-hidden />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">
                Verification submitted — we are reviewing your profile
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Thanks for the detail. Our team checks coverage, portfolio fit, and quality so hosts
                keep trusting the shortlist. We typically respond within a few business days.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                You can still update your verification answers if something changed:{" "}
                <Link
                  href="/operator/verify"
                  className="font-semibold text-[#059669] underline-offset-2 hover:underline"
                >
                  Edit verification profile
                </Link>
                .
              </p>
            </div>
          </div>
        )}

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            What happens next
          </h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>
              <span className="text-foreground">Review</span> — we read your markets, listings
              scale, and any portfolio link you shared.
            </li>
            <li>
              <span className="text-foreground">Decision</span> — we email you at your sign-in
              address when you are approved (or if we need more information).
            </li>
            <li>
              <span className="text-foreground">Go live</span> — approved operators receive matched
              host intros in the inbox below; your free intro credits apply to real requests.
            </li>
          </ol>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-border/80 bg-card/80 px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 shrink-0 text-[#059669]" aria-hidden />
            <span>
              Questions while you wait?{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=Co-host%20verification`}
                className="font-semibold text-[#059669] underline-offset-2 hover:underline"
              >
                {SUPPORT_EMAIL}
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
