"use client";

import EmailPasswordSignupForm from "@/components/auth/email-password-signup-form";
import AccountPageShell from "@/components/marketing/account-page-shell";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignupFormSection() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const successPath =
    next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  return (
    <EmailPasswordSignupForm
      successPath={successPath}
      loginHref={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
      emailRedirectNext={successPath}
      portalIntent="host"
    />
  );
}

export default function SignupPage() {
  return (
    <AccountPageShell
      title="Create account"
      description="Sign up with Google or email to save audits and access paid reports with the same account you use at checkout."
      headerCta={{ href: "/audit", label: "Run audit" }}
    >
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <SignupFormSection />
      </Suspense>
    </AccountPageShell>
  );
}
