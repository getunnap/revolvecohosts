"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { readPortalIntentFromMetadata } from "@/lib/revolve-portal";
import { REVOLVE_LOGO_URL } from "@/lib/site-brand";

type SignedInLink = { href: string; label: string };

export type MarketingSiteHeaderProps = {
  /** Extra classes on the logo img (e.g. PDF capture exclusions). */
  logoClassName?: string;
  /** Primary header CTA — use a hash for same-page anchors (e.g. audit form). */
  cta?: { href: string; label: string };
  /** Hide the Log in control (e.g. when already on /login). */
  hideLoginLink?: boolean;
};

export default function MarketingSiteHeader({
  logoClassName = "",
  cta = { href: "/tools", label: "Free tools" },
  hideLoginLink = false,
}: MarketingSiteHeaderProps) {
  const [signedInLink, setSignedInLink] = useState<SignedInLink | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    async function resolveAccountLink() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        setSignedInLink(null);
        return;
      }
      const intent = readPortalIntentFromMetadata(
        user.user_metadata as Record<string, unknown>,
      );
      if (intent === "cohost") {
        setSignedInLink({ href: "/operator", label: "Co-host portal" });
        return;
      }
      if (intent === "host") {
        setSignedInLink({ href: "/dashboard", label: "My account" });
        return;
      }
      const { data: opRow } = await supabase
        .from("cohost_operators")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (opRow) {
        setSignedInLink({ href: "/operator", label: "Co-host portal" });
      } else {
        setSignedInLink({ href: "/dashboard", label: "My account" });
      }
    }

    void resolveAccountLink();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => void resolveAccountLink());
    return () => subscription.unsubscribe();
  }, []);

  const ctaClassName =
    "inline-block rounded-lg bg-[#10B981] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#059669] sm:text-base";
  const loginClassName =
    "text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground sm:text-base";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <img
            src={REVOLVE_LOGO_URL}
            alt="Revolve Co-Hosts"
            className={`h-10 w-auto ${logoClassName}`.trim()}
          />
        </Link>
        <nav className="flex items-center gap-4 text-sm sm:gap-6 md:text-base lg:gap-8">
          <Link
            href="/#how-it-works"
            className="hidden text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            How it works
          </Link>
          <Link
            href="/tools"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Tools
          </Link>
          <Link
            href="/cohosts"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Co-hosts
          </Link>
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {cta.href.startsWith("#") ? (
            <a href={cta.href} className={ctaClassName}>
              {cta.label}
            </a>
          ) : (
            <Link href={cta.href} className={ctaClassName}>
              {cta.label}
            </Link>
          )}
          {!hideLoginLink ? (
            signedInLink ? (
              <Link href={signedInLink.href} className={loginClassName}>
                {signedInLink.label}
              </Link>
            ) : (
              <Link href="/login" className={loginClassName}>
                Log in
              </Link>
            )
          ) : null}
        </div>
      </div>
    </header>
  );
}
