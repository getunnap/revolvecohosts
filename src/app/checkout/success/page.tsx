"use client";

import FullReportSuccess, {
  type FullReportEntry,
} from "@/components/flow/full-report-success";
import { guestReportStorageKey } from "@/lib/client-storage";
import type { FullReport } from "@/lib/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const paidStorageKey = (reportId: string) => `revolve_paid_full_${reportId}`;

function CheckoutSuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<FullReportEntry[] | null>(null);
  const [emailHint, setEmailHint] = useState("Your email");
  const [emailSent, setEmailSent] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    async function run() {
      if (!sessionId) {
        setError("Missing checkout session id.");
        setLoading(false);
        return;
      }

      try {
        const verifyResponse = await fetch("/api/stripe/verify-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        if (!verifyResponse.ok) {
          throw new Error("Payment verification failed.");
        }
        const verifyData = await verifyResponse.json();
        if (!verifyData?.reportId) {
          throw new Error("Missing report id from payment verification.");
        }

        const reportId = verifyData.reportId as string;
        const cachedPaid = localStorage.getItem(paidStorageKey(reportId));
        if (cachedPaid) {
          const parsed = JSON.parse(cachedPaid) as {
            fullReports: FullReportEntry[];
            emailHint: string;
            emailSent?: boolean;
          };
          setEntries(parsed.fullReports);
          setEmailHint(parsed.emailHint);
          setEmailSent(parsed.emailSent);
          setLoading(false);
          return;
        }

        let body: Record<string, unknown> = {
          reportId,
          sessionId,
        };

        let guestEmail =
          (typeof verifyData.customerEmail === "string" &&
            verifyData.customerEmail) ||
          "Your email";

        if (verifyData.isGuest) {
          const raw = localStorage.getItem(guestReportStorageKey(reportId));
          if (raw) {
            const parsed = JSON.parse(raw) as {
              listing: {
                listingUrl: string;
                location: string;
                title: string;
                description: string;
                amenities: string;
                targetGuest: string;
              };
              email?: string;
            };
            guestEmail = parsed.email?.trim() || guestEmail;
            body = {
              ...body,
              listing: parsed.listing,
            };
          }
          // No local draft: full API uses listing_snapshot from Supabase (service role).
        }

        const reportResponse = await fetch("/api/reports/full", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const reportData = await reportResponse.json();
        if (!reportResponse.ok) {
          throw new Error(reportData.error || "Failed to load full report.");
        }

        let list: FullReportEntry[] = [];
        if (
          Array.isArray(reportData.fullReports) &&
          reportData.fullReports.length > 0
        ) {
          list = reportData.fullReports as FullReportEntry[];
        } else if (reportData.fullReport) {
          const single = reportData.fullReport as FullReport;
          list = [
            {
              listingUrl:
                (body.listing as { listingUrl?: string })?.listingUrl ??
                "Your listing",
              fullReport: single,
            },
          ];
        }

        if (list.length === 0) {
          throw new Error("No report data returned.");
        }

        setEntries(list);
        setEmailHint(verifyData.isGuest ? guestEmail : "Signed-in account");
        const sent = reportData.emailSent === true;
        setEmailSent(sent);

        localStorage.setItem(
          paidStorageKey(reportId),
          JSON.stringify({
            fullReports: list,
            emailHint: verifyData.isGuest ? guestEmail : "Signed-in account",
            emailSent: sent,
          }),
        );
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Failed to load your paid report.",
        );
      } finally {
        setLoading(false);
      }
    }

    void run();
  }, [sessionId]);

  return (
    <>
      {loading ? (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-2 border-[#10B981]/30 border-t-[#10B981] rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Generating your full report…</p>
          </div>
        </div>
      ) : null}

      {error ? (
        <main className="min-h-screen bg-background px-6 py-12">
          <div className="mx-auto max-w-lg text-center space-y-4">
            <p className="text-destructive">{error}</p>
            <Link
              href="/"
              className="inline-block rounded-xl bg-[#10B981] px-5 py-2 font-medium text-white"
            >
              Back to home
            </Link>
          </div>
        </main>
      ) : null}

      {entries?.length ? (
        <FullReportSuccess
          emailHint={emailHint}
          entries={entries}
          emailSent={emailSent}
        />
      ) : null}
    </>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-muted-foreground">Loading payment details…</p>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
