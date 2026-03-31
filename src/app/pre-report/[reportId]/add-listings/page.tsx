"use client";

import { additionalListingsKey } from "@/lib/client-storage";
import { formatTierSummary } from "@/lib/pricing";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowRight, TrendingUp } from "lucide-react";

export default function AddListingsPage() {
  const params = useParams<{ reportId: string }>();
  const reportId = params.reportId;
  const [listingUrls, setListingUrls] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validExtras = listingUrls.map((u) => u.trim()).filter(Boolean);
  const quantity = 1 + validExtras.length;
  const tierLabel = formatTierSummary(quantity);

  function addUrlInput() {
    setListingUrls((prev) => [...prev, ""]);
  }

  function updateUrl(index: number, value: string) {
    setListingUrls((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function removeUrl(index: number) {
    setListingUrls((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev,
    );
  }

  async function goCheckout(extras: string[]) {
    if (!reportId) return;
    setLoading(true);
    setError(null);
    try {
      sessionStorage.setItem(
        additionalListingsKey(reportId),
        JSON.stringify(extras),
      );
      const q = 1 + extras.length;
      const isGuest = reportId.startsWith("guest_");
      const response = await fetch("/api/stripe/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          isGuest,
          quantity: q,
          additionalListingUrls: extras,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.checkoutUrl) {
        throw new Error(data.error || "Checkout could not start.");
      }
      window.location.href = data.checkoutUrl;
    } catch (e) {
      setLoading(false);
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#10B981]/5 via-background to-[#059669]/5 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <p className="text-center text-sm text-muted-foreground mb-4">
          <Link href={`/pre-report/${reportId}`} className="hover:text-foreground">
            ← Back to preview
          </Link>
        </p>

        <div className="bg-card border border-border rounded-2xl shadow-2xl p-8 sm:p-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-3">Analyze multiple listings?</h2>
            <p className="text-muted-foreground text-lg">
              Add extra Airbnb URLs to buy one full audit per listing. Volume
              pricing applies automatically.
            </p>
            <p className="mt-3 text-sm font-medium text-[#10B981]">{tierLabel}</p>
          </div>

          <div className="space-y-4 mb-6">
            {listingUrls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => updateUrl(index, e.target.value)}
                  placeholder={`Additional listing URL ${index + 1}`}
                  className="flex-1 px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                />
                {listingUrls.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeUrl(index)}
                    className="px-4 py-3 rounded-xl border border-border hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive transition-all"
                  >
                    ✕
                  </button>
                ) : null}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addUrlInput}
            className="w-full py-3 rounded-xl border-2 border-dashed border-[#10B981]/30 text-[#10B981] hover:border-[#10B981] hover:bg-[#10B981]/5 transition-all mb-8 font-medium"
          >
            + Add another listing
          </button>

          {error ? (
            <p className="mb-4 text-sm text-destructive text-center">{error}</p>
          ) : null}

          <div className="space-y-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => goCheckout(validExtras)}
              className="w-full bg-gradient-to-r from-[#10B981] to-[#059669] text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Redirecting…" : "Continue to secure checkout"}
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => goCheckout([])}
              className="w-full text-muted-foreground hover:text-foreground transition-colors py-2 text-sm"
            >
              Skip — pay for one listing only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
