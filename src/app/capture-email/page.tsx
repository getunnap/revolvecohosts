"use client";

import {
  PENDING_AUDIT_KEY,
  PENDING_GENERATION_KEY,
} from "@/lib/client-storage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Check,
  Lock,
  Mail,
  Zap,
} from "lucide-react";

type PendingAudit = {
  listingUrl: string;
  targetGuest: string;
};

export default function CaptureEmailPage() {
  const router = useRouter();
  const [pending, setPending] = useState<PendingAudit | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /* sessionStorage is unavailable on the server; reading after mount avoids hydration mismatch */
    /* eslint-disable react-hooks/set-state-in-effect */
    const raw = sessionStorage.getItem(PENDING_AUDIT_KEY);
    if (!raw) {
      router.replace("/");
      return;
    }

    const defaultGuest = "Leisure and business travelers";

    try {
      const parsed = JSON.parse(raw) as unknown;
      if (
        parsed &&
        typeof parsed === "object" &&
        "listingUrl" in parsed &&
        typeof (parsed as PendingAudit).listingUrl === "string"
      ) {
        const p = parsed as PendingAudit;
        setPending({
          listingUrl: p.listingUrl,
          targetGuest:
            typeof p.targetGuest === "string" && p.targetGuest.trim().length >= 2
              ? p.targetGuest
              : defaultGuest,
        });
        return;
      }
    } catch {
      /* legacy: plain URL string in sessionStorage */
      if (/^https?:\/\//i.test(raw.trim())) {
        setPending({
          listingUrl: raw.trim(),
          targetGuest: defaultGuest,
        });
        return;
      }
    }

    router.replace("/");
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [router]);

  function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    if (!pending || !email.trim()) return;
    setError(null);
    try {
      sessionStorage.setItem(
        PENDING_GENERATION_KEY,
        JSON.stringify({
          listingUrl: pending.listingUrl,
          targetGuest: pending.targetGuest,
          email: email.trim(),
        }),
      );
      sessionStorage.removeItem(PENDING_AUDIT_KEY);
      router.push("/generating");
    } catch {
      setError("Could not continue. Please try again.");
    }
  }

  if (!pending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#10B981]/5 via-background to-[#059669]/5 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center text-sm font-semibold">
            <Check className="w-5 h-5" />
          </div>
          <div className="h-1 w-16 bg-[#10B981] rounded" />
          <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center text-base font-bold ring-4 ring-[#10B981]/20">
            2
          </div>
          <div className="h-1 w-16 bg-border rounded" />
          <div className="w-8 h-8 rounded-full bg-border text-muted-foreground flex items-center justify-center text-sm font-semibold">
            3
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-2xl p-8 sm:p-12">
          <div className="w-16 h-16 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <Zap className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-3xl sm:text-4xl text-center mb-4">
            Your Analysis is Ready!
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-8">
            Enter your email to unlock your free Airbnb optimization report and
            see exactly what is costing you money.
          </p>

          <div className="space-y-3 mb-8 bg-secondary/50 rounded-xl p-6">
            {[
              "Instant revenue loss breakdown",
              "Visual optimization opportunities",
              "Pricing and SEO recommendations",
              "Before/after revenue projections",
            ].map((benefit) => (
              <div key={benefit} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#10B981] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-foreground">{benefit}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-xl outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-all text-lg"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#10B981] hover:bg-[#059669] text-white py-4 rounded-xl transition-colors text-lg font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#10B981]/20"
            >
              Get My Free Analysis
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {error ? (
            <p className="mt-4 text-sm text-destructive text-center">{error}</p>
          ) : null}

          <div className="mt-6 pt-6 border-t border-border space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4 text-[#10B981]" />
              <span>Your data is secure and will never be shared</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-[#10B981]" />
              <span>10,000+ hosts have already unlocked their reports</span>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-center">
            <div>
              <div className="text-2xl font-semibold text-[#10B981]">4.9/5</div>
              <div className="text-xs text-muted-foreground">Rating</div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <div className="text-2xl font-semibold text-[#10B981]">$2.4M+</div>
              <div className="text-xs text-muted-foreground">Revenue Added</div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <div className="text-2xl font-semibold text-[#10B981]">10K+</div>
              <div className="text-xs text-muted-foreground">Hosts</div>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            ← Back to edit listing URL
          </Link>
        </div>
      </div>
    </div>
  );
}
