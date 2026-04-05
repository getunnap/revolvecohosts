"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition-shadow focus-visible:ring-2 focus-visible:ring-[#10B981]";

function UpdatePasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextRaw = searchParams.get("next");
  const successPath =
    nextRaw && nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/dashboard";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error: updErr } = await supabase.auth.updateUser({ password });
      if (updErr) {
        throw updErr;
      }
      router.push(successPath);
      router.refresh();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err && typeof err.message === "string"
          ? err.message
          : "Could not update password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-16">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-border/80 bg-card p-8 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Set new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a new password for your account.
        </p>
        {!ready ? (
          <p className="mt-6 text-sm text-muted-foreground">
            Verifying reset link… If this hangs, open the link from your email again or request a
            new reset from sign in.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="new-password" className="text-sm font-medium text-foreground">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="text-sm font-medium text-foreground">
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={inputClass}
              />
            </div>
            {error ? (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#10B981] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#059669] disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? "Saving…" : "Save password"}
            </button>
          </form>
        )}
        <p className="mt-6 text-center text-sm">
          <Link href="/login" className="font-semibold text-[#059669] underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function UpdatePasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-muted-foreground">
          Loading…
        </div>
      }
    >
      <UpdatePasswordContent />
    </Suspense>
  );
}
