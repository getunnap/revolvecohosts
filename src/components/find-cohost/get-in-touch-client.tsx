"use client";

import EmailPasswordLoginForm from "@/components/auth/email-password-login-form";
import EmailPasswordSignupForm from "@/components/auth/email-password-signup-form";
import {
  getActiveMatchResultsPath,
  INCOME_ESTIMATE_ANSWERS_KEY,
  MATCH_FUNNEL_ANSWERS_KEY,
} from "@/lib/client-storage";
import { getOrCreateHostIntroCohortId } from "@/lib/host-intro-cohort";
import {
  incomeAnswersToMatchFunnel,
  mergeIncomeEstimateAnswers,
} from "@/lib/income-estimate";
import {
  findMatchInSessionResults,
  getCatalogMatchFlow,
  mergeFunnelAnswers,
  type MatchFunnelAnswers,
} from "@/lib/match-funnel";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none ring-offset-white transition-shadow focus-visible:ring-2 focus-visible:ring-[#10B981]";
const labelClass = "text-sm font-medium text-zinc-800";

export default function GetInTouchClient({ catalogId }: { catalogId: string }) {
  const router = useRouter();
  const [operatorName, setOperatorName] = useState<string>("this co-host");
  const [funnelAnswers, setFunnelAnswers] = useState<MatchFunnelAnswers | null>(null);
  const [matchReason, setMatchReason] = useState<string | undefined>();
  const [sessionReady, setSessionReady] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authTab, setAuthTab] = useState<"signup" | "login">("signup");
  const [phone, setPhone] = useState("");
  const [listingUrl, setListingUrl] = useState("");
  const [hostNotes, setHostNotes] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [introSourceTool, setIntroSourceTool] = useState<"find_cohost" | "income_estimate">(
    "find_cohost",
  );

  const touchPath = `/find-cohost/get-in-touch/${catalogId}`;

  const refreshSession = useCallback(async () => {
    const supabase = createBrowserSupabaseClient();
    const { data } = await supabase.auth.getSession();
    setUserEmail(data.session?.user.email ?? null);
    setSessionReady(true);
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    const m = findMatchInSessionResults(catalogId);
    if (!m) {
      router.replace(getActiveMatchResultsPath() ?? "/find-cohost/results");
      return;
    }
    setOperatorName(m.displayName);
    setMatchReason(m.matchReason);

    const flow = getCatalogMatchFlow(catalogId);
    try {
      if (flow === "income_estimate") {
        setIntroSourceTool("income_estimate");
        const raw = sessionStorage.getItem(INCOME_ESTIMATE_ANSWERS_KEY);
        if (!raw) {
          router.replace("/income-estimate");
          return;
        }
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        const income = mergeIncomeEstimateAnswers(parsed);
        setFunnelAnswers(mergeFunnelAnswers(incomeAnswersToMatchFunnel(income)));
        return;
      }

      setIntroSourceTool("find_cohost");
      const raw = sessionStorage.getItem(MATCH_FUNNEL_ANSWERS_KEY);
      if (!raw) {
        router.replace("/find-cohost");
        return;
      }
      const parsed = JSON.parse(raw) as Partial<MatchFunnelAnswers>;
      setFunnelAnswers(mergeFunnelAnswers(parsed));
    } catch {
      router.replace(
        flow === "income_estimate" ? "/income-estimate" : "/find-cohost",
      );
    }
  }, [catalogId, router]);

  async function submitIntro() {
    if (!funnelAnswers) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setSubmitError("Please sign in or create an account first.");
        setSubmitting(false);
        return;
      }

      const cohortId = getOrCreateHostIntroCohortId();
      if (!cohortId) {
        setSubmitError("Could not start request. Please enable storage and try again.");
        setSubmitting(false);
        return;
      }

      const res = await fetch("/api/host/intro-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          catalogOperatorId: catalogId,
          hostRequestCohortId: cohortId,
          sourceTool: introSourceTool,
          funnelAnswers,
          matchReason,
          phone: phone.trim() || undefined,
          listingUrl: listingUrl.trim() || undefined,
          hostNotes: hostNotes.trim() || undefined,
        }),
      });
      const json = (await res.json()) as { error?: string; introRequestId?: string };
      if (!res.ok) {
        setSubmitError(json.error ?? "Request failed.");
        setSubmitting(false);
        return;
      }
      router.push("/host/intros?submitted=1");
      router.refresh();
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!sessionReady || !funnelAnswers) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-gradient-to-br from-[#FFF5F3] to-[#EEF6FF] text-zinc-600">
        Loading…
      </div>
    );
  }

  const signedIn = Boolean(userEmail);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5F3] via-[#F8F5FF] to-[#E8F7F2] px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-lg">
        <Link
          href={`/find-cohost/profile/${catalogId}`}
          className="text-sm font-semibold text-teal-700 hover:text-[#FF385C] hover:underline"
        >
          ← Back to {operatorName}
        </Link>

        <h1 className="mt-6 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          Get in touch with {operatorName}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          Confirm your property details and account. The co-host sees a summary first; your contact
          details and exact address unlock only if they accept.
        </p>

        {!signedIn ? (
          <div className="mt-8 rounded-2xl border border-rose-100/90 bg-white/95 p-6 shadow-md shadow-rose-100/30">
            <p className="text-sm font-semibold text-zinc-900">Step 1 — Host account</p>
            <p className="mt-1 text-xs text-zinc-600">
              Use the same email you used in the matching flow if you already entered one.
            </p>
            <div className="mt-4 flex gap-2 rounded-full bg-zinc-100 p-1">
              <button
                type="button"
                onClick={() => setAuthTab("signup")}
                className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
                  authTab === "signup"
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-600"
                }`}
              >
                Create account
              </button>
              <button
                type="button"
                onClick={() => setAuthTab("login")}
                className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
                  authTab === "login"
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-600"
                }`}
              >
                Sign in
              </button>
            </div>
            <div className="mt-6">
              {authTab === "signup" ? (
                <EmailPasswordSignupForm
                  successPath={touchPath}
                  loginHref={`/login?next=${encodeURIComponent(touchPath)}`}
                  emailRedirectNext={touchPath}
                  portalIntent="host"
                />
              ) : (
                <EmailPasswordLoginForm
                  successPath={touchPath}
                  signupHref={`/signup?next=${encodeURIComponent(touchPath)}`}
                  forgotPasswordHref="/forgot-password"
                  oauthPortalHint="host"
                />
              )}
            </div>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            <div className="rounded-2xl border border-emerald-100/90 bg-white/95 p-6 shadow-md shadow-emerald-100/20">
              <p className="text-sm font-semibold text-zinc-900">Signed in as {userEmail}</p>
              <button
                type="button"
                onClick={async () => {
                  const supabase = createBrowserSupabaseClient();
                  await supabase.auth.signOut();
                  setUserEmail(null);
                }}
                className="mt-2 text-xs font-semibold text-teal-700 hover:underline"
              >
                Use a different account
              </button>
            </div>

            <div className="rounded-2xl border border-rose-100/90 bg-white/95 p-6 shadow-md shadow-rose-100/30">
              <p className="text-sm font-semibold text-zinc-900">Step 2 — Contact & property</p>
              <p className="mt-1 text-xs text-zinc-600">
                Full address comes from your match answers. Optional: add your listing link for the
                co-host after they accept (never shown on the initial preview).
              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <label htmlFor="gt-phone" className={labelClass}>
                    Mobile (optional)
                  </label>
                  <input
                    id="gt-phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                    placeholder="+44 …"
                  />
                </div>
                <div>
                  <label htmlFor="gt-listing" className={labelClass}>
                    Airbnb / listing URL (optional)
                  </label>
                  <input
                    id="gt-listing"
                    type="url"
                    value={listingUrl}
                    onChange={(e) => setListingUrl(e.target.value)}
                    className={inputClass}
                    placeholder="https://…"
                  />
                </div>
                <div>
                  <label htmlFor="gt-notes" className={labelClass}>
                    Anything else we should know?
                  </label>
                  <textarea
                    id="gt-notes"
                    rows={3}
                    value={hostNotes}
                    onChange={(e) => setHostNotes(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. second property nearby, preferred contact times…"
                  />
                </div>
              </div>

              {submitError ? (
                <p className="mt-4 text-sm font-medium text-red-600" role="alert">
                  {submitError}
                </p>
              ) : null}

              <button
                type="button"
                disabled={submitting}
                onClick={() => void submitIntro()}
                className="mt-6 w-full rounded-full bg-gradient-to-r from-[#FF385C] to-rose-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-300/40 disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Submit intro request"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
