import { Resend } from "resend";
import type { FreeReport } from "@/lib/types";
import { freeReportToMarkdown } from "@/lib/report-markdown";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtmlBody(params: {
  listingUrl: string;
  report: FreeReport;
}): string {
  const wins = params.report.quickWins
    .map((w) => `<li style="margin:8px 0;line-height:1.5;">${escapeHtml(w)}</li>`)
    .join("");
  const scoreTenths = (params.report.score / 10).toFixed(1);
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:system-ui,-apple-system,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#0f172a;">
  <p style="font-size:18px;font-weight:600;margin:0 0 8px;">Your free listing preview</p>
  <p style="margin:0 0 16px;color:#64748b;font-size:15px;">Here&apos;s your instant Airbnb optimization snapshot. Unlock the full paid report anytime from the link in this email or on the site.</p>
  <div style="padding:20px;border:1px solid #10B981;border-radius:12px;background:#f0fdf4;margin-bottom:20px;">
    <p style="margin:0 0 8px;font-size:14px;color:#047857;"><strong>Listing</strong></p>
    <p style="margin:0 0 16px;word-break:break-all;font-size:14px;">${escapeHtml(params.listingUrl)}</p>
    <p style="margin:0 0 8px;"><strong>Preview score:</strong> ${scoreTenths}/10 <span style="color:#64748b;font-size:13px;">(model: ${params.report.score}/100)</span></p>
    <p style="margin:16px 0 8px;line-height:1.6;">${escapeHtml(params.report.teaser)}</p>
    <h3 style="margin:24px 0 12px;font-size:16px;">Quick wins</h3>
    <ul style="margin:0;padding-left:20px;">${wins}</ul>
  </div>
  <p style="margin-top:24px;font-size:13px;color:#94a3b8;">Revolve Co-Hosts</p>
</body>
</html>`;
}

export async function sendFreeReportEmail(params: {
  to: string;
  listingUrl: string;
  report: FreeReport;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!apiKey || !from) {
    return { ok: false, error: "Email is not configured (RESEND_API_KEY / RESEND_FROM_EMAIL)." };
  }

  const resend = new Resend(apiKey);
  const plain = freeReportToMarkdown(params.listingUrl, params.report);

  const { error } = await resend.emails.send({
    from,
    to: params.to,
    subject: "Your free Airbnb listing preview — Revolve Co-Hosts",
    html: buildHtmlBody({ listingUrl: params.listingUrl, report: params.report }),
    text: plain,
  });

  if (error) {
    console.error("Resend free report send failed", error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
