"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OperatorLeadActions({
  introId,
  initialStatus,
}: {
  introId: string;
  initialStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null);

  if (status !== "pending") {
    return (
      <p className="mt-6 text-sm font-semibold text-muted-foreground">
        {status === "accepted"
          ? "You accepted this intro — host details are unlocked below."
          : "You declined this intro. The host has been notified."}
      </p>
    );
  }

  async function respond(action: "accept" | "decline") {
    setError(null);
    setLoading(action);
    try {
      const res = await fetch(`/api/operator/intro-requests/${introId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = (await res.json()) as { error?: string; status?: string };
      if (!res.ok) {
        setError(json.error ?? "Could not update.");
        return;
      }
      const next =
        json.status ?? (action === "accept" ? "accepted" : "declined");
      setStatus(next);
      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mt-8 rounded-2xl border border-border/80 bg-muted/20 p-6">
      <p className="text-sm font-semibold text-foreground">Review decision</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Accept uses one intro credit and unlocks the host&apos;s contact details for you.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => void respond("accept")}
          className="flex-1 rounded-full bg-[#059669] py-3 text-sm font-bold text-white shadow-md shadow-emerald-200/40 disabled:opacity-50"
        >
          {loading === "accept" ? "Accepting…" : "Accept intro"}
        </button>
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => void respond("decline")}
          className="flex-1 rounded-full border-2 border-border bg-background py-3 text-sm font-bold text-foreground disabled:opacity-50"
        >
          {loading === "decline" ? "Updating…" : "Decline"}
        </button>
      </div>
      {error ? (
        <p className="mt-3 text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
