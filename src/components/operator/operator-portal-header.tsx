"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { REVOLVE_LOGO_URL } from "@/lib/site-brand";

const navLinkClass =
  "text-sm font-semibold text-muted-foreground transition-colors hover:text-[#059669]";
const navLinkActiveClass = "text-[#059669]";

export default function OperatorPortalHeader({ email }: { email: string }) {
  const pathname = usePathname();

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    window.location.href = "/login?as=cohost";
  }

  function navClass(href: string) {
    const active = pathname === href || (href !== "/operator" && pathname.startsWith(href));
    return `${navLinkClass} ${active ? navLinkActiveClass : ""}`.trim();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:flex-none">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <img src={REVOLVE_LOGO_URL} alt="Revolve Co-Hosts" className="h-9 w-auto" />
          </Link>
          <span className="hidden border-l border-border pl-3 text-sm font-semibold text-foreground sm:inline">
            Co-host portal
          </span>
        </div>
        <nav
          className="order-last flex w-full basis-full items-center gap-4 border-t border-border/60 pt-3 sm:order-none sm:w-auto sm:basis-auto sm:border-t-0 sm:pt-0 md:gap-6"
          aria-label="Portal sections"
        >
          <Link href="/operator" className={navClass("/operator")}>
            Home
          </Link>
          <Link href="/operator/verify" className={navClass("/operator/verify")}>
            Verification
          </Link>
          <Link href="/operator/billing" className={navClass("/operator/billing")}>
            Billing
          </Link>
          <Link href="/operator/settings" className={navClass("/operator/settings")}>
            Settings
          </Link>
        </nav>
        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <span className="hidden max-w-[200px] truncate text-xs text-muted-foreground sm:inline sm:max-w-[280px] sm:text-sm">
            {email}
          </span>
          <button
            type="button"
            onClick={() => void signOut()}
            className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted/60"
          >
            Log out
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl border-t border-border/50 px-4 pb-3 pt-3 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap items-center gap-2" aria-label="Host tools and demand">
          <span className="w-full text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:mr-2 sm:w-auto sm:py-1">
            Where hosts enter
          </span>
          <Link
            href="/tools"
            className="rounded-lg border border-border/80 bg-card/80 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-[#10B981]/40 hover:bg-[#10B981]/5 sm:text-sm"
          >
            Host tools guide
          </Link>
          <Link
            href="/audit"
            className="rounded-lg border border-border/80 bg-card/80 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-[#10B981]/40 hover:bg-[#10B981]/5 sm:text-sm"
          >
            Listing audit
          </Link>
          <Link
            href="/find-cohost"
            className="rounded-lg border border-border/80 bg-card/80 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-[#10B981]/40 hover:bg-[#10B981]/5 sm:text-sm"
          >
            Matchmaking
          </Link>
          <Link
            href="/income-estimate"
            className="rounded-lg border border-border/80 bg-card/80 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-[#10B981]/40 hover:bg-[#10B981]/5 sm:text-sm"
          >
            Income estimate
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-dashed border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-[#10B981]/35 hover:text-foreground sm:text-sm"
          >
            Revolve home
          </Link>
        </nav>
      </div>
    </header>
  );
}
