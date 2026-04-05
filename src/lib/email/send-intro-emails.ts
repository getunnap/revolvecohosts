import { Resend } from "resend";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function configured(): { resend: Resend; from: string } | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!apiKey || !from) return null;
  return { resend: new Resend(apiKey), from };
}

export async function sendOperatorNewIntroEmail(params: {
  to: string;
  operatorFirstName: string;
  hostArea: string;
  introRequestId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const cfg = configured();
  if (!cfg) {
    console.info(
      "[intro-email] Skipping operator notify (Resend not configured): new intro",
      params.introRequestId,
    );
    return { ok: true };
  }
  const first = params.operatorFirstName.split(/\s+/)[0] || "there";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "";
  const leadUrl =
    appUrl.replace(/\/$/, "") + `/operator/leads/${params.introRequestId}`;

  const html = `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a;">
<p style="font-size:18px;font-weight:600;">Hi ${escapeHtml(first)},</p>
<p style="line-height:1.6;color:#334155;">A host in <strong>${escapeHtml(params.hostArea)}</strong> requested an intro with you via Revolve Co-Hosts.</p>
<p style="line-height:1.6;color:#334155;">Open your co-host inbox to review the property context (contact details stay hidden until you accept).</p>
<p style="margin-top:20px;"><a href="${escapeHtml(leadUrl)}" style="display:inline-block;background:#059669;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:600;">Review intro</a></p>
<p style="margin-top:24px;font-size:13px;color:#94a3b8;">Revolve Co-Hosts — operator portal</p>
</body></html>`;

  const r = await cfg.resend.emails.send({
    from: cfg.from,
    to: params.to,
    subject: `New host intro request — ${params.hostArea}`,
    html,
    text: `Hi ${first},\n\nA host in ${params.hostArea} requested an intro. Review in your Revolve co-host inbox:\n${leadUrl}\n`,
  });
  if (r.error) {
    console.error("Resend operator intro notify failed", r.error);
    return { ok: false, error: r.error.message };
  }
  return { ok: true };
}

export async function sendHostIntroDeclinedEmail(params: {
  to: string;
  operatorDisplayName: string;
  pendingSummary?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const cfg = configured();
  if (!cfg) {
    console.info("[intro-email] Skipping host notify (Resend not configured): declined");
    return { ok: true };
  }
  const extra = params.pendingSummary
    ? `<p style="line-height:1.6;color:#334155;">${escapeHtml(params.pendingSummary)}</p>`
    : "";
  const html = `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a;">
<p style="font-size:18px;font-weight:600;">Update on your co-host request</p>
<p style="line-height:1.6;color:#334155;"><strong>${escapeHtml(params.operatorDisplayName)}</strong> isn’t able to take this intro forward right now.</p>
${extra}
<p style="line-height:1.6;color:#334155;">You can sign in to Revolve Co-Hosts to see your other requests or explore new matches.</p>
<p style="margin-top:24px;font-size:13px;color:#94a3b8;">Revolve Co-Hosts</p>
</body></html>`;

  const r = await cfg.resend.emails.send({
    from: cfg.from,
    to: params.to,
    subject: "Update on your co-host intro — Revolve Co-Hosts",
    html,
    text: `${params.operatorDisplayName} isn’t able to take this intro forward.${params.pendingSummary ? ` ${params.pendingSummary}` : ""}`,
  });
  if (r.error) {
    console.error("Resend host decline notify failed", r.error);
    return { ok: false, error: r.error.message };
  }
  return { ok: true };
}

export async function sendHostIntroAcceptedEmail(params: {
  to: string;
  operatorDisplayName: string;
  operatorEmail: string;
  whatsappHint?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const cfg = configured();
  if (!cfg) {
    console.info("[intro-email] Skipping host notify (Resend not configured): accepted");
    return { ok: true };
  }
  const wa = params.whatsappHint
    ? `<p style="line-height:1.6;color:#334155;">WhatsApp: ${escapeHtml(params.whatsappHint)}</p>`
    : "<p style=\"line-height:1.6;color:#334155;\">If you shared a phone number, they may also reach you on WhatsApp.</p>";

  const html = `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a;">
<p style="font-size:18px;font-weight:600;">Great news — ${escapeHtml(params.operatorDisplayName)} accepted your intro</p>
<p style="line-height:1.6;color:#334155;">You can reach them by email to get the conversation started:</p>
<p style="line-height:1.6;"><a href="mailto:${escapeHtml(params.operatorEmail)}">${escapeHtml(params.operatorEmail)}</a></p>
${wa}
<p style="line-height:1.6;color:#334155;margin-top:16px;">We’ve shared starter message templates inside your Revolve host area to help you open the thread.</p>
<p style="margin-top:24px;font-size:13px;color:#94a3b8;">Revolve Co-Hosts</p>
</body></html>`;

  const r = await cfg.resend.emails.send({
    from: cfg.from,
    to: params.to,
    subject: `${params.operatorDisplayName} accepted your intro — Revolve Co-Hosts`,
    html,
    text: `${params.operatorDisplayName} accepted your intro. Email: ${params.operatorEmail}`,
  });
  if (r.error) {
    console.error("Resend host accept notify failed", r.error);
    return { ok: false, error: r.error.message };
  }
  return { ok: true };
}
