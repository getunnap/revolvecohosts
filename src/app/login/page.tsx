"use client";

import EmailPasswordLoginForm from "@/components/auth/email-password-login-form";
import AccountPageShell from "@/components/marketing/account-page-shell";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useMemo } from "react";

type LoginRole = "host" | "cohost";

function safeNext(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

function LoginFormSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextRaw = searchParams.get("next");
  const nextSafe = safeNext(nextRaw);

  const role: LoginRole =
    searchParams.get("as") === "cohost" ? "cohost" : "host";

  const setRole = useCallback(
    (r: LoginRole) => {
      const p = new URLSearchParams(searchParams.toString());
      if (r === "cohost") {
        p.set("as", "cohost");
      } else {
        p.delete("as");
      }
      const qs = p.toString();
      router.replace(qs ? `/login?${qs}` : "/login", { scroll: false });
    },
    [router, searchParams],
  );

  const { successPath, signupHref, forgotPasswordHref, footerSignupLabel, footerSignupHref } =
    useMemo(() => {
      if (role === "cohost") {
        const coDefault = "/operator";
        const success =
          nextSafe && nextSafe.startsWith("/operator") ? nextSafe : coDefault;
        return {
          successPath: success,
          signupHref: "/operator/signup",
          forgotPasswordHref: "/forgot-password?next=%2Foperator",
          footerSignupLabel: "Create a co-host portal account",
          footerSignupHref: "/operator/signup",
        };
      }
      const hostDefault = "/dashboard";
      const success = nextSafe ?? hostDefault;
      const nextQ = nextSafe ? `?next=${encodeURIComponent(nextSafe)}` : "";
      return {
        successPath: success,
        signupHref: `/signup${nextQ}`,
        forgotPasswordHref: "/forgot-password",
        footerSignupLabel: "Create a host account",
        footerSignupHref: `/signup${nextQ}`,
      };
    }, [role, nextSafe]);

  const cardDescription =
    role === "cohost"
      ? "Co-host portal — credits, matched leads, and billing."
      : "Listing audits, paid reports, and intro requests.";

  return (
    <>
      <div
        className="mb-6 flex rounded-full bg-muted/80 p-1 ring-1 ring-border/60"
        role="tablist"
        aria-label="Account type"
      >
        <button
          type="button"
          role="tab"
          aria-selected={role === "host"}
          onClick={() => setRole("host")}
          className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition-colors ${
            role === "host"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Host
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={role === "cohost"}
          onClick={() => setRole("cohost")}
          className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition-colors ${
            role === "cohost"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Co-host
        </button>
      </div>

      <p className="mb-6 text-sm text-muted-foreground">{cardDescription}</p>

      <EmailPasswordLoginForm
        successPath={successPath}
        signupHref={signupHref}
        forgotPasswordHref={forgotPasswordHref}
        oauthPortalHint={role === "cohost" ? "cohost" : "host"}
      />
      <p className="mt-6 border-t border-border pt-6 text-center text-sm text-muted-foreground">
        Need an account?{" "}
        <Link
          href={footerSignupHref}
          className="font-semibold text-[#059669] underline-offset-4 hover:underline"
        >
          {footerSignupLabel}
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <AccountPageShell
      title="Sign in"
      description="Choose Host or Co-host, then sign in with Google or email and password."
      headerCta={{ href: "/tools", label: "Free tools" }}
      hideHeaderLoginLink
    >
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <LoginFormSection />
      </Suspense>
    </AccountPageShell>
  );
}
