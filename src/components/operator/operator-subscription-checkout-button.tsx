"use client";

import { useResetUiAfterBfcache } from "@/hooks/use-reset-ui-after-bfcache";
import { useState } from "react";

export default function OperatorSubscriptionCheckoutButton({
  monthlyIntros,
  label,
  className,
  disabled = false,
}: {
  monthlyIntros: 5 | 10 | 25;
  label: string;
  className?: string;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useResetUiAfterBfcache(setLoading, setError);

  async function onClick() {
    if (disabled) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/operator-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flow: "subscription", monthlyIntros }),
      });
      const data = (await res.json()) as {
        url?: string;
        error?: string;
      };
      if (!res.ok || !data.url) {
        setError(data.error?.trim() || "Checkout could not start.");
        return;
      }
      setLoading(false);
      window.location.assign(data.url);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        disabled={loading || disabled}
        onClick={() => void onClick()}
        className={
          className ??
          "inline-flex w-full items-center justify-center rounded-xl bg-[#10B981] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-60"
        }
      >
        {disabled ? "Available after approval" : loading ? "Redirecting…" : label}
      </button>
      {error ? (
        <p className="mt-2 text-center text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
