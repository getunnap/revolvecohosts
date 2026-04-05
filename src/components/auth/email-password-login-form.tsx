"use client";

import GoogleOAuthButton, { AuthMethodDivider } from "@/components/auth/google-oauth-button";
import {
  readKeepSignedInPreference,
  writeKeepSignedInPreference,
} from "@/lib/auth-sign-in-preference";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition-shadow focus-visible:ring-2 focus-visible:ring-[#10B981]";
const labelClass = "text-sm font-medium text-foreground";

type EmailPasswordLoginFormProps = {
  /** Where to send the user after a successful sign-in */
  successPath: string;
  signupHref: string;
  forgotPasswordHref: string;
  /** First-time Google sign-in: tag account as host vs co-host when metadata is still empty. */
  oauthPortalHint?: "host" | "cohost";
};

export default function EmailPasswordLoginForm({
  successPath,
  signupHref,
  forgotPasswordHref,
  oauthPortalHint = "host",
}: EmailPasswordLoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  useEffect(() => {
    setKeepSignedIn(readKeepSignedInPreference());
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error: signErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signErr) {
        throw signErr;
      }
      writeKeepSignedInPreference(keepSignedIn);
      router.push(successPath);
      router.refresh();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err && typeof err.message === "string"
          ? err.message
          : "Could not sign in. Check your email and password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-muted/15 px-4 py-3">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-[#10B981] focus:ring-[#10B981]"
          checked={keepSignedIn}
          onChange={(e) => {
            const v = e.target.checked;
            setKeepSignedIn(v);
            writeKeepSignedInPreference(v);
          }}
        />
        <span>
          <span className="text-sm font-medium text-foreground">Keep me signed in on this device</span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            Recommended for personal devices. Uncheck on shared computers, then sign out when finished.
          </span>
        </span>
      </label>
      <GoogleOAuthButton
        redirectNext={successPath}
        portalIntent={oauthPortalHint}
        label="Sign in with Google"
      />
      <AuthMethodDivider />
      <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="auth-login-email" className={labelClass}>
          Email
        </label>
        <input
          id="auth-login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          placeholder="you@company.com"
        />
      </div>
      <div>
        <label htmlFor="auth-login-password" className={labelClass}>
          Password
        </label>
        <input
          id="auth-login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          placeholder="••••••••"
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
        {loading ? "Signing in…" : "Sign in"}
      </button>
      <div className="flex flex-col gap-2 border-t border-border pt-4 text-center text-sm sm:flex-row sm:justify-between sm:text-left">
        <Link
          href={forgotPasswordHref}
          className="font-medium text-[#059669] underline-offset-4 hover:underline"
        >
          Forgot password?
        </Link>
        <span className="text-muted-foreground">
          No account?{" "}
          <Link href={signupHref} className="font-semibold text-[#059669] underline-offset-4 hover:underline">
            Sign up
          </Link>
        </span>
      </div>
      </form>
    </div>
  );
}
