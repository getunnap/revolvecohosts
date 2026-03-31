"use client";

import {
  guestReportStorageKey,
  PENDING_GENERATION_KEY,
} from "@/lib/client-storage";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart,
  Camera,
  Check,
  DollarSign,
  MapPin,
  Search,
  Shield,
  Tag,
} from "lucide-react";

type PendingGeneration = {
  listingUrl: string;
  targetGuest: string;
  email: string;
};

export default function GeneratingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval>;

    async function run() {
      let pending: PendingGeneration | null = null;
      try {
        const raw = sessionStorage.getItem(PENDING_GENERATION_KEY);
        if (!raw) {
          router.replace("/");
          return;
        }
        pending = JSON.parse(raw) as PendingGeneration;
      } catch {
        router.replace("/");
        return;
      }

      const started = Date.now();
      const minDisplayMs = 4500;

      const tick = () => {
        const elapsed = Date.now() - started;
        const p = Math.min(95, (elapsed / minDisplayMs) * 95);
        setProgress(p);
      };
      intervalId = setInterval(tick, 50);
      tick();

      try {
        const response = await fetch("/api/reports/free", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            listingUrl: pending.listingUrl,
            targetGuest: pending.targetGuest,
            email: pending.email,
          }),
        });
        const raw = await response.text();
        let data: {
          error?: string;
          reportId?: string;
          freeReport?: unknown;
          emailSent?: boolean;
        };
        try {
          data = raw ? (JSON.parse(raw) as typeof data) : {};
        } catch {
          throw new Error(
            `Server returned an unexpected response (HTTP ${response.status}). Open Vercel → this project → Logs while retrying.`,
          );
        }
        if (!response.ok || !data.reportId) {
          throw new Error(
            data.error ||
              `Could not generate pre-report (HTTP ${response.status}).`,
          );
        }
        if (cancelled) return;

        localStorage.setItem(
          guestReportStorageKey(data.reportId),
          JSON.stringify({
            listing: {
              listingUrl: pending.listingUrl,
              targetGuest: pending.targetGuest,
              location: "Not provided",
              title: "Not provided",
              description: "Not provided",
              amenities: "Not provided",
            },
            freeReport: data.freeReport,
            email: pending.email,
            emailSent: data.emailSent === true,
          }),
        );
        sessionStorage.removeItem(PENDING_GENERATION_KEY);

        const elapsed = Date.now() - started;
        if (elapsed < minDisplayMs) {
          await new Promise((r) => setTimeout(r, minDisplayMs - elapsed));
        }
        if (cancelled) return;
        clearInterval(intervalId);
        setProgress(100);
        await new Promise((r) => setTimeout(r, 400));
        if (cancelled) return;
        router.replace(`/pre-report/${data.reportId}`);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Something went wrong.");
        clearInterval(intervalId);
      }
    }

    void run();
    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [router]);

  const getAnalysisMessage = (p: number) => {
    if (p < 15)
      return {
        icon: Search,
        text: "Fetching your Airbnb listing data…",
        detail: "Analyzing title, description, amenities, and photos",
      };
    if (p < 30)
      return {
        icon: MapPin,
        text: "Analyzing market data…",
        detail: "Comparing to similar listings in your area",
      };
    if (p < 45)
      return {
        icon: DollarSign,
        text: "Calculating pricing opportunities…",
        detail: "Identifying revenue optimization potential",
      };
    if (p < 60)
      return {
        icon: Camera,
        text: "Evaluating photo quality…",
        detail: "Comparing against high-performing listings",
      };
    if (p < 75)
      return {
        icon: Tag,
        text: "Reviewing SEO and keywords…",
        detail: "Checking search visibility and ranking factors",
      };
    if (p < 90)
      return {
        icon: BarChart,
        text: "Running competitive analysis…",
        detail: "Benchmarking against top earners",
      };
    return {
      icon: Check,
      text: "Finalizing your report…",
      detail: "Compiling actionable recommendations",
    };
  };

  const currentMessage = getAnalysisMessage(progress);
  const MessageIcon = currentMessage.icon;

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-lg bg-[#10B981] px-4 py-2 text-white"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#10B981]/5 via-background to-[#059669]/5 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="flex items-center justify-center gap-2 mb-12">
          <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center text-sm font-semibold">
            <Check className="w-5 h-5" />
          </div>
          <div className="h-1 w-16 bg-[#10B981] rounded" />
          <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center text-sm font-semibold">
            <Check className="w-5 h-5" />
          </div>
          <div className="h-1 w-16 bg-[#10B981] rounded" />
          <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center text-base font-bold ring-4 ring-[#10B981]/20">
            3
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-2xl p-8 sm:p-12">
          <div className="w-20 h-20 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl flex items-center justify-center mb-8 mx-auto animate-pulse">
            <MessageIcon className="w-10 h-10 text-white" />
          </div>

          <div className="text-center mb-6">
            <div className="text-6xl font-bold bg-gradient-to-r from-[#10B981] to-[#059669] bg-clip-text text-transparent mb-2">
              {Math.round(progress)}%
            </div>
            <div className="text-xl font-semibold mb-2">{currentMessage.text}</div>
            <div className="text-muted-foreground">{currentMessage.detail}</div>
          </div>

          <div className="relative h-3 bg-secondary rounded-full overflow-hidden mb-12">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#10B981] to-[#059669] transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { icon: Search, label: "Listing Data", done: progress > 15 },
              { icon: MapPin, label: "Market Analysis", done: progress > 30 },
              { icon: DollarSign, label: "Pricing", done: progress > 45 },
              { icon: Camera, label: "Photos", done: progress > 60 },
              { icon: Tag, label: "SEO", done: progress > 75 },
              { icon: BarChart, label: "Competition", done: progress > 90 },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className={`flex items-center gap-2 p-3 rounded-lg transition-all duration-500 ${
                    item.done
                      ? "bg-[#10B981]/10 border border-[#10B981]/20"
                      : "bg-secondary/50 border border-transparent"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.done
                        ? "bg-[#10B981] text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.done ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      item.done
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            <Shield className="w-5 h-5 text-[#10B981] inline mr-2" />
            Your data is being analyzed securely. This usually takes under a
            minute.
          </div>
        </div>
      </div>
    </div>
  );
}
