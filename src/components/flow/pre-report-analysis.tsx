"use client";

import type { FreeReport } from "@/lib/types";
import {
  delayForPaint,
  downloadElementAsPdf,
  pdfFilenameForUrl,
} from "@/lib/pdf-capture";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import {
  ArrowRight,
  BarChart,
  Check,
  Clock,
  DollarSign,
  FileDown,
  Lock,
  Mail,
  Shield,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";

const LOGO_URL =
  "https://revolvecohosts.com/wp-content/uploads/2026/03/rch_2-removebg-preview.png";

type Props = {
  reportId: string;
  listingUrl: string;
  email: string;
  freeReport: FreeReport;
  emailSent?: boolean;
};

export default function PreReportAnalysis({
  reportId,
  listingUrl,
  email,
  freeReport,
  emailSent,
}: Props) {
  const router = useRouter();
  const captureRef = useRef<HTMLDivElement>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const scoreTenths = (freeReport.score / 10).toFixed(1);
  const issuesCount = Math.max(4, freeReport.quickWins.length + 2);

  const findings = freeReport.quickWins.slice(0, 4).map((text, idx) => ({
    severity: idx < 2 ? ("high" as const) : ("medium" as const),
    title:
      text.length > 60
        ? `${text.slice(0, 57)}…`
        : text.split(".").slice(0, 1).join(".") || `Opportunity ${idx + 1}`,
    impact: idx < 2 ? "+ Revenue potential" : "+ Guest conversion",
    description: text,
    preview: text.slice(0, 120) + (text.length > 120 ? "…" : ""),
  }));

  function goUnlock() {
    router.push(`/pre-report/${reportId}/add-listings`);
  }

  const downloadPreviewPdf = useCallback(async () => {
    const el = captureRef.current;
    if (!el || pdfBusy) return;
    setPdfBusy(true);
    try {
      window.scrollTo(0, 0);
      await delayForPaint(200);
      await downloadElementAsPdf(
        el,
        pdfFilenameForUrl(listingUrl, "revolve-free-preview"),
      );
    } catch (e) {
      console.error(e);
      const msg =
        e instanceof Error
          ? e.message
          : "Could not create PDF. Try again after the page fully loads.";
      window.alert(msg);
    } finally {
      setPdfBusy(false);
    }
  }, [listingUrl, pdfBusy]);

  return (
    <div ref={captureRef} className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center gap-3">
              <img
                src={LOGO_URL}
                alt="Revolve Co-Hosts"
                className="h-10 w-auto pdf-ignore-logo"
              />
            </Link>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Analyze Another
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-[#10B981]/10 via-[#10B981]/5 to-[#059669]/10 border-2 border-[#10B981]/30 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Check className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold">Analysis Complete!</h1>
                <span className="bg-[#10B981] text-white text-xs font-bold px-2 py-1 rounded-full">
                  FREE PREVIEW
                </span>
              </div>
              <p className="text-muted-foreground mb-2">{freeReport.teaser}</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Report for{" "}
                    <span className="font-medium text-foreground">{email}</span>
                  </span>
                </div>
                {emailSent ? (
                  <span className="text-sm bg-[#10B981]/15 text-[#047857] px-3 py-1.5 rounded-lg w-fit">
                    We&apos;ve emailed your free preview (check spam if needed).
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground max-w-xl">
                    With email configured, we send your free preview automatically.
                    Save a pixel-perfect PDF of this page anytime.
                  </span>
                )}
              </div>
              <div className="mt-4" data-pdf-exclude>
                <button
                  type="button"
                  disabled={pdfBusy}
                  onClick={() => void downloadPreviewPdf()}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#10B981] text-white px-4 py-2.5 text-sm font-semibold hover:bg-[#059669] transition-colors disabled:opacity-60"
                >
                  <FileDown className="w-4 h-4" />
                  {pdfBusy ? "Preparing PDF…" : "Download free preview (PDF)"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border-2 border-border rounded-xl p-6 hover:border-orange-500/50 transition-all hover:shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">
                Overall Score
              </span>
              <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-500" />
              </div>
            </div>
            <div className="text-4xl sm:text-5xl font-bold mb-2">
              {scoreTenths}
              <span className="text-xl sm:text-2xl text-muted-foreground">/10</span>
            </div>
            <div className="text-sm text-orange-500 font-semibold">
              From AI optimization model
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#10B981]/5 to-[#059669]/5 border-2 border-[#10B981]/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">
                Full report
              </span>
              <div className="w-10 h-10 bg-[#10B981]/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#10B981]" />
              </div>
            </div>
            <div className="text-2xl font-bold mb-2 text-[#10B981]">Unlock</div>
            <div className="text-sm font-medium text-[#10B981]">
              Copy-paste fixes &amp; prioritized plan
            </div>
          </div>

          <div className="bg-card border-2 border-border rounded-xl p-6 hover:border-red-500/50 transition-all hover:shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">
                Issues surfacing
              </span>
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <div className="text-4xl sm:text-5xl font-bold mb-2">{issuesCount}</div>
            <div className="text-sm font-semibold text-red-500">
              Areas to improve (estimate)
            </div>
          </div>
        </div>

        <div className="bg-card border-2 border-border rounded-2xl p-6 sm:p-8 mb-8 shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#10B981]/10 rounded-xl flex items-center justify-center">
              <BarChart className="w-6 h-6 text-[#10B981]" />
            </div>
            What we flagged from your listing
          </h2>
          <div className="space-y-4">
            {findings.map((finding, idx) => (
              <div key={idx} className="border border-border rounded-lg overflow-hidden">
                <div
                  className={`p-4 border-l-4 ${
                    finding.severity === "high"
                      ? "bg-red-500/5 border-red-500"
                      : "bg-orange-500/5 border-orange-500"
                  }`}
                >
                  <div className="text-center sm:text-left mb-3 space-y-2">
                    <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2">
                      <span
                        className={`text-xs font-bold uppercase px-2 py-0.5 rounded whitespace-nowrap ${
                          finding.severity === "high"
                            ? "bg-red-500 text-white"
                            : "bg-orange-500 text-white"
                        }`}
                      >
                        {finding.severity} impact
                      </span>
                      <div className="text-base sm:text-lg font-bold text-[#10B981] whitespace-nowrap">
                        {finding.impact}
                      </div>
                    </div>
                    <div className="font-semibold text-sm sm:text-base">
                      {finding.title}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {finding.description}
                    </p>
                    <p className="text-xs sm:text-sm text-foreground/70 italic break-words">
                      {finding.preview}
                    </p>
                  </div>
                </div>
                <div className="relative p-4 bg-secondary/30 min-h-[100px]">
                  <div className="absolute inset-0 backdrop-blur-[2px] bg-background/40 flex items-center justify-center rounded-b-lg">
                    <div className="text-center px-4">
                      <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground mx-auto mb-2" />
                      <div className="text-xs sm:text-sm font-semibold text-foreground">
                        Solution locked
                      </div>
                      <button
                        type="button"
                        onClick={goUnlock}
                        className="text-xs text-[#10B981] hover:underline mt-1"
                      >
                        Unlock full report →
                      </button>
                    </div>
                  </div>
                  <div className="opacity-30 select-none pointer-events-none text-sm space-y-1">
                    <div>• Step-by-step implementation guide</div>
                    <div>• Copy-paste ready optimized text</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-[#10B981]/10 to-[#059669]/10 border border-[#10B981]/20 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-semibold mb-1 text-sm sm:text-base">
                  Want exact fixes for these issues?
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Multi-listing pricing available at checkout
                </div>
              </div>
              <button
                type="button"
                onClick={goUnlock}
                className="bg-[#10B981] hover:bg-[#059669] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors whitespace-nowrap flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
              >
                Unlock solutions
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-[#10B981] via-[#059669] to-[#047857] rounded-3xl p-8 sm:p-12 text-white shadow-2xl text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

          <div className="relative">
            <div className="mb-8 pb-6 border-b border-white/20 max-w-2xl mx-auto">
              <div className="text-sm opacity-75 mb-2">Analysis for:</div>
              <div className="text-lg font-mono bg-white/10 rounded-lg px-4 py-2 mb-2 truncate">
                {listingUrl}
              </div>
              <div className="flex items-center justify-center gap-2 text-sm opacity-90">
                <Mail className="w-4 h-4" />
                <span>Report for {email}</span>
              </div>
            </div>

            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Lock className="w-10 h-10" />
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 leading-tight">
              Ready to fix your listing?
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Add more listing URLs if you want volume pricing, then continue to
              secure Stripe checkout.
            </p>

            <button
              type="button"
              onClick={goUnlock}
              className="bg-white text-[#10B981] px-8 sm:px-12 py-4 sm:py-5 rounded-xl font-bold text-lg sm:text-xl hover:bg-gray-50 transition-all shadow-2xl hover:scale-105 transform inline-flex items-center justify-center gap-2 sm:gap-3"
            >
              <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Continue to unlock (from £3.49)</span>
              <span className="sm:hidden">Continue</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm opacity-75 flex-wrap mt-6">
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                Tiered multi-listing pricing
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                30-day guarantee
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Instant delivery
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-white/20">
              <div className="flex items-center justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 fill-white text-white" />
                ))}
              </div>
              <div className="font-semibold">4.9/5 from hosts</div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Want hands-off management?
          </p>
          <Link
            href="/cohosting"
            className="inline-flex items-center gap-2 text-[#10B981] font-semibold hover:underline"
          >
            Learn about co-hosting →
          </Link>
        </div>
      </div>
    </div>
  );
}
