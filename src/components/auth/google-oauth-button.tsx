"use client";

import { safeAuthRedirectPath } from "@/lib/auth-redirect";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { useState } from "react";

const baseClass =
  "flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground outline-none ring-offset-background transition-shadow hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-[#10B981] disabled:pointer-events-none disabled:opacity-50";

function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden width={20} height={20}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

type GoogleOAuthButtonProps = {
  /** Post-auth path (same-origin, e.g. /dashboard); falls back to / if invalid */
  redirectNext: string;
  /** Sets user_metadata.revolve_portal on first OAuth sign-in when unset (host vs co-host). */
  portalIntent?: "host" | "cohost";
  label?: string;
  /** Extra classes for the button (e.g. match get-in-touch zinc borders) */
  className?: string;
};

export default function GoogleOAuthButton({
  redirectNext,
  portalIntent,
  label = "Continue with Google",
  className = "",
}: GoogleOAuthButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setError(null);
    const next = safeAuthRedirectPath(redirectNext) ?? "/";
    setLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();
      const origin = window.location.origin;
      const portalQ =
        portalIntent === "cohost" || portalIntent === "host"
          ? `&portal=${encodeURIComponent(portalIntent)}`
          : "";
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}${portalQ}`,
        },
      });
      if (oauthErr) {
        throw oauthErr;
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err && typeof err.message === "string"
          ? err.message
          : "Could not start Google sign-in.";
      setError(msg);
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => void onClick()}
        disabled={loading}
        className={`${baseClass} ${className}`.trim()}
      >
        <GoogleGlyph />
        {loading ? "Redirecting…" : label}
      </button>
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function AuthMethodDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`relative py-1 ${className}`.trim()}>
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <span className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs font-medium uppercase tracking-wide">
        <span className="bg-background px-3 text-muted-foreground">Or</span>
      </div>
    </div>
  );
}
