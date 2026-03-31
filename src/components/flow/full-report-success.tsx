"use client";

import type { FullReport } from "@/lib/types";
import {
  appendCanvasMultipage,
  delayForPaint,
  downloadElementAsPdf,
  pdfFilenameForUrl,
  renderNodeToCanvasWithFallback,
} from "@/lib/pdf-capture";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { jsPDF } from "jspdf";
import {
  Check,
  Copy,
  Download,
  FileDown,
  Mail,
  Tag,
  Zap,
} from "lucide-react";

const LOGO_URL =
  "https://revolvecohosts.com/wp-content/uploads/2026/03/rch_2-removebg-preview.png";

export type FullReportEntry = {
  listingUrl: string;
  fullReport: FullReport;
};

type Props = {
  emailHint: string;
  entries: FullReportEntry[];
  /** True when Resend delivered in this API response (guest: once per purchase). */
  emailSent?: boolean;
};

function impactClass(impact: string) {
  if (impact === "High") return "bg-red-500 text-white";
  if (impact === "Medium") return "bg-orange-500 text-white";
  return "bg-muted text-foreground";
}

export default function FullReportSuccess({
  emailHint,
  entries,
  emailSent,
}: Props) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const active = entries[tab];
  const report = active.fullReport;

  const copy = useCallback(async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  }, []);

  const downloadThisPdf = useCallback(async () => {
    const el = captureRef.current;
    if (!el || pdfBusy) return;
    setPdfBusy(true);
    try {
      await downloadElementAsPdf(
        el,
        pdfFilenameForUrl(active.listingUrl, "revolve-full-report"),
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
  }, [active.listingUrl, pdfBusy]);

  const downloadAllPdf = useCallback(async () => {
    if (pdfBusy) return;
    setPdfBusy(true);
    try {
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      for (let i = 0; i < entries.length; i++) {
        flushSync(() => setTab(i));
        await delayForPaint(280);
        const el = captureRef.current;
        if (!el) throw new Error("Missing capture root");
        const canvas = await renderNodeToCanvasWithFallback(el);
        appendCanvasMultipage(pdf, canvas, i > 0);
      }
      pdf.save(`revolve-full-reports-${entries.length}-listings.pdf`);
    } catch (e) {
      console.error(e);
      const msg =
        e instanceof Error ? e.message : "Could not create combined PDF.";
      window.alert(msg);
    } finally {
      setPdfBusy(false);
    }
  }, [entries.length, pdfBusy]);

  if (!active) return null;

  const primaryTitle = report.optimizedTitleOptions[0] ?? "";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center gap-3">
              <img src={LOGO_URL} alt="Revolve Co-Hosts" className="h-10 w-auto" />
            </Link>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </header>

      {entries.length > 1 ? (
        <div className="border-b border-border bg-background/95 backdrop-blur sticky top-[73px] z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 overflow-x-auto py-3">
              {entries.map((e, i) => (
                <button
                  key={e.listingUrl}
                  type="button"
                  onClick={() => setTab(i)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                    tab === i
                      ? "bg-[#10B981] text-white"
                      : "bg-card border border-border hover:border-[#10B981]/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Listing {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div
        ref={captureRef}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-background"
      >
        <div className="bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Check className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="flex-1">
              {entries.length > 1 ? (
                <p className="text-white/90 text-sm font-semibold mb-2">
                  Listing {tab + 1} of {entries.length}
                </p>
              ) : null}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                Your complete optimization report
              </h1>
              <p className="text-white/90 text-lg mb-3">
                Paid report unlocked — copy-paste ready titles, description, and
                action plan.
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-sm bg-white/10 w-fit px-3 py-1.5 rounded-lg">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate max-w-[280px] sm:max-w-md">{emailHint}</span>
                </div>
                {emailSent ? (
                  <span className="text-sm bg-white/15 px-3 py-1.5 rounded-lg w-fit max-w-xl">
                    We&apos;ve emailed you a copy (HTML + plain text). Check spam
                    if needed.
                  </span>
                ) : (
                  <span className="text-sm text-white/85 w-fit max-w-xl">
                    With email configured, we send your report automatically when
                    it&apos;s generated. You can always save a pixel-perfect PDF
                    below.
                  </span>
                )}
              </div>
              <div
                className="mt-4 flex flex-col sm:flex-row flex-wrap gap-2"
                data-pdf-exclude
              >
                <button
                  type="button"
                  disabled={pdfBusy}
                  onClick={() => void downloadThisPdf()}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/95 text-[#059669] px-4 py-2.5 text-sm font-semibold hover:bg-white disabled:opacity-60"
                >
                  <FileDown className="w-4 h-4" />
                  {pdfBusy ? "Preparing PDF…" : "Download this listing (PDF)"}
                </button>
                {entries.length > 1 ? (
                  <button
                    type="button"
                    disabled={pdfBusy}
                    onClick={() => void downloadAllPdf()}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/20 border border-white/40 px-4 py-2.5 text-sm font-semibold hover:bg-white/30 disabled:opacity-60"
                  >
                    <Download className="w-4 h-4" />
                    All {entries.length} listings (one PDF)
                  </button>
                ) : null}
              </div>
              <p className="mt-3 text-sm text-white/80 font-mono truncate">
                {active.listingUrl}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-500/20 rounded-2xl p-6 sm:p-8 mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-blue-500" />
            </div>
            Quick start: implement in 60 minutes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              ["1", "Title & description", "Paste optimized copy first"],
              ["2", "Photos & order", "Reorder using your new checklist mindset"],
              ["3", "Pricing & settings", "Apply priority actions below"],
            ].map(([n, t, d]) => (
              <div key={n} className="bg-card/50 border border-border rounded-xl p-5">
                <div className="text-2xl font-bold text-blue-500 mb-2">{n}</div>
                <div className="font-bold mb-2">{t}</div>
                <div className="text-sm text-muted-foreground">{d}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border-2 border-border rounded-2xl p-4 sm:p-8 mb-8 shadow-lg">
          <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-[#10B981]/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Tag className="w-6 h-6 text-[#10B981]" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2">
                Title options
              </h3>
              <p className="text-sm text-muted-foreground">
                Score: {report.score}/100 — pick one and A/B test over time.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 sm:p-5 bg-[#10B981]/5 border-2 border-[#10B981] rounded-xl">
              <div className="text-xs font-bold text-[#10B981] mb-2">
                RECOMMENDED TITLE
              </div>
              <p className="font-semibold text-lg mb-4 break-words">{primaryTitle}</p>
              <button
                type="button"
                onClick={() => copy("primary-title", primaryTitle)}
                className="inline-flex items-center gap-2 bg-[#10B981] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#059669]"
              >
                <Copy className="w-4 h-4" />
                {copied === "primary-title" ? "Copied!" : "Copy title"}
              </button>
            </div>

            <ul className="space-y-2">
              {report.optimizedTitleOptions.map((title, i) => (
                <li
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg border border-border bg-secondary/30"
                >
                  <span className="flex-1 text-sm break-words">{title}</span>
                  <button
                    type="button"
                    onClick={() => copy(`title-${i}`, title)}
                    className="shrink-0 text-sm text-[#10B981] font-medium hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copied === `title-${i}` ? "Copied" : "Copy"}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 sm:p-8 mb-8">
          <h3 className="text-xl font-bold mb-4">Optimized description</h3>
          <div className="flex justify-end mb-2">
            <button
              type="button"
              onClick={() => copy("desc", report.optimizedDescription)}
              className="text-sm text-[#10B981] font-medium flex items-center gap-1 hover:underline"
            >
              <Copy className="w-4 h-4" />
              {copied === "desc" ? "Copied!" : "Copy full description"}
            </button>
          </div>
          <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
            {report.optimizedDescription}
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 sm:p-8 mb-8">
          <h3 className="text-xl font-bold mb-4">Priority actions</h3>
          <div className="space-y-3">
            {report.priorityActions.map((item) => (
              <div
                key={item.action}
                className="rounded-xl border border-border p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${impactClass(item.impact)}`}
                  >
                    {item.impact}
                  </span>
                </div>
                <p className="font-semibold mb-1">{item.action}</p>
                <p className="text-sm text-muted-foreground">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 sm:p-8 mb-8">
          <h3 className="text-xl font-bold mb-4">Market positioning</h3>
          <p className="text-muted-foreground leading-relaxed">
            {report.positioning}
          </p>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex rounded-xl bg-[#10B981] px-6 py-3 font-semibold text-white hover:bg-[#059669] transition-colors"
          >
            Run another audit
          </Link>
        </div>
      </div>
    </div>
  );
}
