import { Resend } from "resend";
import type { FullReport } from "@/lib/types";
import { bundleReportsToMarkdown, type ReportEntryLite } from "@/lib/report-markdown";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function reportToHtmlSection(listingUrl: string, report: FullReport): string {
  const titles = report.optimizedTitleOptions
    .map((t) => `<li>${escapeHtml(t)}</li>`)
    .join("");
  const actions = report.priorityActions
    .map(
      (a) =>
        `<tr><td style="padding:8px;border:1px solid #e5e7eb;"><strong>${escapeHtml(a.impact)}</strong></td><td style="padding:8px;border:1px solid #e5e7eb;">${escapeHtml(a.action)}</td><td style="padding:8px;border:1px solid #e5e7eb;">${escapeHtml(a.reason)}</td></tr>`,
    )
    .join("");
  return `
  <div style="margin-bottom:32px;padding:20px;border:1px solid #10B981;border-radius:12px;background:#f0fdf4;">
    <p style="margin:0 0 8px;font-size:14px;color:#047857;"><strong>Listing</strong></p>
    <p style="margin:0 0 16px;word-break:break-all;font-size:14px;">${escapeHtml(listingUrl)}</p>
    <p style="margin:0 0 8px;"><strong>Score:</strong> ${report.score}/100</p>
    <h3 style="margin:20px 0 8px;color:#0f172a;">Recommended title</h3>
    <p style="margin:0 0 16px;font-size:16px;font-weight:600;">${escapeHtml(report.optimizedTitleOptions[0] ?? "")}</p>
    <h4 style="margin:16px 0 8px;">Other title options</h4>
    <ul style="margin:0;padding-left:20px;">${titles}</ul>
    <h3 style="margin:24px 0 8px;color:#0f172a;">Optimized description</h3>
    <p style="margin:0;line-height:1.6;white-space:pre-wrap;color:#334155;">${escapeHtml(report.optimizedDescription)}</p>
    <h3 style="margin:24px 0 8px;">Priority actions</h3>
    <table style="border-collapse:collapse;width:100%;font-size:14px;">${actions}</table>
    <h3 style="margin:24px 0 8px;">Market positioning</h3>
    <p style="margin:0;line-height:1.6;color:#334155;">${escapeHtml(report.positioning)}</p>
  </div>`;
}

function buildHtmlBody(entries: ReportEntryLite[]): string {
  const sections = entries.map((e) => reportToHtmlSection(e.listingUrl, e.fullReport)).join("");
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:system-ui,-apple-system,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#0f172a;">
  <p style="font-size:18px;font-weight:600;margin:0 0 8px;">Your full optimization report${entries.length > 1 ? "s" : ""}</p>
  <p style="margin:0 0 24px;color:#64748b;font-size:15px;">Thanks for your purchase. Below is everything you need — you can also download each report from your browser on the success page if you still have it open.</p>
  ${sections}
  <p style="margin-top:32px;font-size:13px;color:#94a3b8;">Revolve Co-Hosts</p>
</body>
</html>`;
}

export async function sendFullReportsEmail(params: {
  to: string;
  entries: ReportEntryLite[];
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!apiKey || !from) {
    return { ok: false, error: "Email is not configured (RESEND_API_KEY / RESEND_FROM_EMAIL)." };
  }

  const resend = new Resend(apiKey);
  const subject =
    params.entries.length > 1
      ? `Your ${params.entries.length} Revolve Co-Hosts listing reports`
      : "Your Revolve Co-Hosts listing optimization report";

  const plain = bundleReportsToMarkdown(params.entries);

  const { error } = await resend.emails.send({
    from,
    to: params.to,
    subject,
    html: buildHtmlBody(params.entries),
    text: plain,
  });

  if (error) {
    console.error("Resend send failed", error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
