import { Resend } from "resend";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type CohostApplyPayload = {
  fullName: string;
  email: string;
  phone: string;
  areasServed: string;
  listingsManaged: string;
  portfolioUrl: string;
  pitch: string;
};

function adminHtml(p: CohostApplyPayload): string {
  const rows: [string, string][] = [
    ["Name", p.fullName],
    ["Email", p.email],
    ["Phone", p.phone || "—"],
    ["Areas / markets", p.areasServed],
    ["Listings managed", p.listingsManaged],
    ["Portfolio / profile URL", p.portfolioUrl || "—"],
    ["Notes", p.pitch || "—"],
  ];
  const body = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:600;vertical-align:top;">${escapeHtml(k)}</td><td style="padding:8px 12px;border:1px solid #e2e8f0;white-space:pre-wrap;">${escapeHtml(v)}</td></tr>`,
    )
    .join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="font-family:system-ui,sans-serif;max-width:640px;margin:0 auto;padding:24px;">
<p style="font-size:18px;font-weight:600;">New co-host application</p>
<table style="border-collapse:collapse;width:100%;margin-top:16px;">${body}</table>
<p style="margin-top:24px;font-size:13px;color:#64748b;">Revolve Co-Hosts — /cohosts</p>
</body></html>`;
}

function applicantHtml(name: string): string {
  const first = name.split(/\s+/)[0] || "there";
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="font-family:system-ui,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#0f172a;">
<p style="font-size:18px;font-weight:600;">Hi ${escapeHtml(first)},</p>
<p style="line-height:1.6;color:#334155;">Thanks for applying to join Revolve Co-Hosts as an operator. We review every application and will reply within a few business days with next steps.</p>
<p style="line-height:1.6;color:#334155;">If you have questions in the meantime, reply to this email or write to <a href="mailto:hello@revolvecohosts.com">hello@revolvecohosts.com</a>.</p>
<p style="margin-top:24px;font-size:13px;color:#94a3b8;">Revolve Co-Hosts</p>
</body></html>`;
}

export async function sendCohostApplyEmails(params: {
  payload: CohostApplyPayload;
  notifyTo: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!apiKey || !from) {
    return { ok: false, error: "Email is not configured (RESEND_API_KEY / RESEND_FROM_EMAIL)." };
  }

  const resend = new Resend(apiKey);
  const p = params.payload;
  const text = [
    "New co-host application",
    "",
    `Name: ${p.fullName}`,
    `Email: ${p.email}`,
    `Phone: ${p.phone || "—"}`,
    `Areas: ${p.areasServed}`,
    `Listings: ${p.listingsManaged}`,
    `URL: ${p.portfolioUrl || "—"}`,
    `Notes: ${p.pitch || "—"}`,
  ].join("\n");

  const adminSend = await resend.emails.send({
    from,
    to: params.notifyTo,
    replyTo: p.email,
    subject: `Co-host application: ${p.fullName}`,
    html: adminHtml(p),
    text,
  });
  if (adminSend.error) {
    console.error("Resend co-host admin notify failed", adminSend.error);
    return { ok: false, error: adminSend.error.message };
  }

  const thanks = await resend.emails.send({
    from,
    to: p.email,
    subject: "We received your co-host application — Revolve Co-Hosts",
    html: applicantHtml(p.fullName),
    text: `Hi ${p.fullName.split(/\s+/)[0] || "there"},\n\nThanks for applying to join Revolve Co-Hosts. We'll review your application and be in touch within a few business days.\n\n— Revolve Co-Hosts`,
  });
  if (thanks.error) {
    console.error("Resend co-host applicant confirmation failed", thanks.error);
    return { ok: false, error: thanks.error.message };
  }

  return { ok: true };
}
