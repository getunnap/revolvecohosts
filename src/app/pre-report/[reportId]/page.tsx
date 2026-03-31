"use client";

import PreReportAnalysis from "@/components/flow/pre-report-analysis";
import { guestReportStorageKey } from "@/lib/client-storage";
import type { FreeReport } from "@/lib/types";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type GuestBundle = {
  listing: {
    listingUrl: string;
    targetGuest: string;
    location: string;
    title: string;
    description: string;
    amenities: string;
  };
  freeReport: FreeReport;
  email?: string;
  emailSent?: boolean;
};

type ReportPayload = {
  id: string;
  free_report_json: FreeReport | null;
  stripe_payment_status: string;
  status: string;
};

export default function PreReportPage() {
  const params = useParams<{ reportId: string }>();
  const reportId = params?.reportId;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guest, setGuest] = useState<GuestBundle | null>(null);
  const [legacyReport, setLegacyReport] = useState<ReportPayload | null>(null);

  useEffect(() => {
    async function loadReport() {
      if (!reportId) {
        setError("Missing report id.");
        setLoading(false);
        return;
      }

      if (reportId.startsWith("guest_")) {
        const raw = localStorage.getItem(guestReportStorageKey(reportId));
        if (!raw) {
          setError("Guest pre-report expired. Please start again.");
          setLoading(false);
          return;
        }
        const parsed = JSON.parse(raw) as GuestBundle;
        setGuest(parsed);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/reports/${reportId}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to load pre-report.");
        }
        setLegacyReport(data.report);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load pre-report.");
      } finally {
        setLoading(false);
      }
    }

    void loadReport();
  }, [reportId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading report…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-destructive text-center">{error}</p>
        <Link href="/" className="text-[#10B981] underline">
          Start over
        </Link>
      </div>
    );
  }

  if (guest && reportId && guest.freeReport) {
    return (
      <PreReportAnalysis
        reportId={reportId}
        listingUrl={guest.listing.listingUrl}
        email={guest.email ?? "your inbox"}
        freeReport={guest.freeReport}
        emailSent={guest.emailSent}
      />
    );
  }

  if (legacyReport?.free_report_json && reportId) {
    return (
      <PreReportAnalysis
        reportId={reportId}
        listingUrl="Your listing"
        email="Signed-in account"
        freeReport={legacyReport.free_report_json}
        emailSent={false}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <p className="text-muted-foreground">No report data.</p>
      <Link href="/" className="text-[#10B981] underline">
        Home
      </Link>
    </div>
  );
}
