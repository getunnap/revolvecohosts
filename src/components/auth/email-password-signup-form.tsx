"use client";

import GoogleOAuthButton, { AuthMethodDivider } from "@/components/auth/google-oauth-button";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import {
  REVOLVE_PORTAL_META_KEY,
  type RevolvePortalIntent,
} from "@/lib/revolve-portal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none ring-offset-background transition-shadow focus-visible:ring-2 focus-visible:ring-[#10B981]";
const labelClass = "text-sm font-medium text-foreground";

type EmailPasswordSignupFormProps = {
  /** Post sign-up redirect when session exists (no email confirm) */
  successPath: string;
  loginHref: string;
  emailRedirectNext: string;
  /** Stored on the auth user for routing (marketing header, operator row creation). */
  portalIntent: RevolvePortalIntent;
};

export default function EmailPasswordSignupForm({
  successPath,
  loginHref,
  emailRedirectNext,
  portalIntent,
}: EmailPasswordSignupFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
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
      const origin = window.location.origin;
      const { data, error: signErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(emailRedirectNext)}&portal=${encodeURIComponent(portalIntent)}`,
          data: { [REVOLVE_PORTAL_META_KEY]: portalIntent },
        },
      });
      if (signErr) {
        throw signErr;
      }
      if (data.session) {
        router.push(successPath);
        router.refresh();
        return;
      }
      setInfo("Check your email to confirm your account, then sign in.");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err && typeof err.message === "string"
          ? err.message
          : "Could not create account.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <GoogleOAuthButton
        redirectNext={emailRedirectNext}
        portalIntent={portalIntent}
        label="Sign up with Google"
      />
      <AuthMethodDivider />
      <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="auth-signup-email" className={labelClass}>
          Email
        </label>
        <input
          id="auth-signup-email"
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
        <label htmlFor="auth-signup-password" className={labelClass}>
          Password
        </label>
        <input
          id="auth-signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          placeholder="At least 8 characters"
        />
      </div>
      <div>
        <label htmlFor="auth-signup-confirm" className={labelClass}>
          Confirm password
        </label>
        <input
          id="auth-signup-confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={inputClass}
          placeholder="Repeat password"
        />
      </div>
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      {info ? (
        <p className="text-sm text-muted-foreground" role="status">
          {info}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[#10B981] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#059669] disabled:pointer-events-none disabled:opacity-50"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>
      <p className="border-t border-border pt-4 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href={loginHref} className="font-semibold text-[#059669] underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
      </form>
    </div>
  );
}
