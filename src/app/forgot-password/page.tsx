"use client";

import AccountPageShell from "@/components/marketing/account-page-shell";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition-shadow focus-visible:ring-2 focus-visible:ring-[#10B981]";

function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const nextRaw = searchParams.get("next");
  const afterResetPath =
    nextRaw && nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/dashboard";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus(null);
    setLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const origin = window.location.origin;
      const redirectTo = `${origin}/auth/update-password?next=${encodeURIComponent(afterResetPath)}`;
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });
      if (resetErr) {
        throw resetErr;
      }
      setStatus("If an account exists for that email, we sent a link to reset your password.");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err && typeof err.message === "string"
          ? err.message
          : "Something went wrong.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AccountPageShell
      title="Reset password"
      description="Enter your account email. We will send you a link to choose a new password."
      headerCta={{ href: "/audit", label: "Run audit" }}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="forgot-email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="you@company.com"
          />
        </div>
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        {status ? (
          <p className="text-sm text-muted-foreground" role="status">
            {status}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#10B981] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#059669] disabled:pointer-events-none disabled:opacity-50"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-semibold text-[#059669] underline-offset-4 hover:underline">
          Back to sign in
        </Link>
        {" · "}
        <Link
          href="/login?as=cohost"
          className="font-semibold text-[#059669] underline-offset-4 hover:underline"
        >
          Co-host sign in
        </Link>
      </p>
    </AccountPageShell>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <AccountPageShell title="Reset password" description="Loading…" headerCta={{ href: "/login", label: "Sign in" }}>
          <p className="text-sm text-muted-foreground">Loading…</p>
        </AccountPageShell>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
