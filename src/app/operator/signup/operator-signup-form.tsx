"use client";

import EmailPasswordSignupForm from "@/components/auth/email-password-signup-form";
import MarketingSiteHeader from "@/components/marketing/marketing-site-header";
import Link from "next/link";

export default function OperatorSignupForm() {
  return (
    <div className="relative min-h-screen bg-background">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#10B981]/[0.08] via-background via-45% to-[#059669]/[0.05] dark:from-[#10B981]/15 dark:via-background dark:to-[#059669]/12"
        aria-hidden
      />
      <div className="relative flex min-h-screen flex-col">
        <MarketingSiteHeader cta={{ href: "/cohosts", label: "Apply" }} />
        <main className="flex flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-md">
            <p className="text-sm font-medium text-[#059669]">Co-host operators</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Create your portal account
            </h1>
            <p className="mt-2 text-pretty text-sm text-muted-foreground">
              Use a work email you control. You will land in the co-host portal right away: complete
              your verification profile there, then we review your details before routing live host
              intros or enabling paid top-ups.
            </p>
            <div className="mt-8 rounded-2xl border border-border/80 bg-card/90 p-6 shadow-sm backdrop-blur-sm sm:p-8">
              <EmailPasswordSignupForm
                successPath="/operator"
                loginHref="/login?as=cohost"
                emailRedirectNext="/operator"
                portalIntent="cohost"
              />
            </div>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Not an operator?{" "}
              <Link href="/signup" className="font-semibold text-[#059669] underline-offset-4 hover:underline">
                Host sign up
              </Link>
              {" · "}
              <Link href="/" className="font-medium text-[#059669] underline-offset-4 hover:underline">
                Home
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
