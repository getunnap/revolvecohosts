"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Handshake,
  LayoutDashboard,
  LogOut,
  Mail,
  Settings,
  TrendingUp,
  UserRound,
} from "lucide-react";
import SignOutButton from "@/components/account/sign-out-button";
import { REVOLVE_LOGO_URL } from "@/lib/site-brand";

function accountNavClass(active: boolean) {
  return active
    ? "rounded-full bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-sm ring-1 ring-border/70"
    : "rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground";
}

function toolChipClass() {
  return "inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background/90 px-3 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-[#10B981]/40 hover:bg-[#10B981]/[0.06]";
}

function emailInitial(email: string) {
  const c = email.trim()[0];
  return c ? c.toUpperCase() : "?";
}

export default function HostAccountChrome({
  email,
  children,
}: {
  email: string;
  children: ReactNode;
}) {
  const pathname = usePathname();

  const mainNav = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/host/intros", label: "Intro requests", icon: Mail },
    { href: "/dashboard/settings", label: "Settings", icon: Settings, prefix: "/dashboard/settings" },
  ] as const;

  function isMainActive(item: (typeof mainNav)[number]) {
    if ("prefix" in item && item.prefix) return pathname.startsWith(item.prefix);
    return pathname === item.href;
  }

  return (
    <div className="relative min-h-screen bg-background">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#10B981]/[0.07] via-background via-50% to-[#059669]/[0.04] dark:from-[#10B981]/12 dark:via-background dark:to-[#059669]/10"
        aria-hidden
      />

      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 shadow-[0_1px_0_0_rgb(0_0_0/0.03)] backdrop-blur-md dark:shadow-[0_1px_0_0_rgb(255_255_255/0.04)]">
        <div className="mx-auto max-w-6xl px-4 pt-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
            <div className="flex min-w-0 flex-1 items-center gap-3 sm:flex-none">
              <Link
                href="/dashboard"
                className="flex shrink-0 items-center gap-2 rounded-lg outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-[#10B981]"
              >
                <img src={REVOLVE_LOGO_URL} alt="Revolve Co-Hosts" className="h-9 w-auto" />
              </Link>
              <div className="hidden h-9 w-px bg-border sm:block" aria-hidden />
              <div className="hidden min-w-0 sm:block">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Host area
                </p>
                <p className="truncate text-sm font-semibold text-foreground">Your account</p>
              </div>
            </div>

            <nav
              className="order-last flex w-full gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] md:order-none md:mx-4 md:w-auto md:justify-center md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden"
              aria-label="Host account"
            >
              <div className="flex min-w-max items-center gap-0.5 rounded-full bg-muted/60 p-1 ring-1 ring-border/50 dark:bg-muted/40">
                {mainNav.map((item) => {
                  const Icon = item.icon;
                  const active = isMainActive(item);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center gap-1.5 whitespace-nowrap ${accountNavClass(active)}`}
                    >
                      <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                      <span className="hidden sm:inline">{item.label}</span>
                      <span className="sm:hidden">{item.label.split(" ")[0]}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="flex shrink-0 items-center gap-2">
              <div className="hidden max-w-[240px] items-center gap-2.5 rounded-full border border-border/80 bg-card/95 py-1 pl-1 pr-3 shadow-sm sm:flex">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#10B981]/12 text-sm font-bold text-[#047857] dark:text-[#34d399]"
                  aria-hidden
                >
                  {emailInitial(email)}
                </span>
                <span className="min-w-0 truncate text-sm text-foreground" title={email}>
                  {email}
                </span>
              </div>
              <SignOutButton
                afterHref="/login"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted/60 sm:px-4"
              >
                <LogOut className="h-4 w-4 opacity-70" aria-hidden />
                <span className="hidden sm:inline">Log out</span>
              </SignOutButton>
            </div>
          </div>
        </div>

        <div className="border-t border-border/60 bg-muted/25 dark:bg-muted/15">
          <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
            <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Run a tool
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/audit" className={toolChipClass()}>
                <BarChart3 className="h-4 w-4 shrink-0 text-[#059669]" aria-hidden />
                Listing audit
              </Link>
              <Link href="/find-cohost" className={toolChipClass()}>
                <Handshake className="h-4 w-4 shrink-0 text-[#059669]" aria-hidden />
                Co-host matchmaking
              </Link>
              <Link href="/income-estimate" className={toolChipClass()}>
                <TrendingUp className="h-4 w-4 shrink-0 text-[#059669]" aria-hidden />
                Income estimate
              </Link>
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 rounded-xl border border-dashed border-border/90 bg-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-[#10B981]/35 hover:text-foreground"
              >
                <BookOpen className="h-4 w-4 shrink-0" aria-hidden />
                All tools guide
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {children}
        <footer className="mt-14 border-t border-border/70 pt-8">
          <div className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
            <p className="text-sm text-muted-foreground">
              <UserRound className="mr-1.5 inline-block h-4 w-4 align-text-bottom text-[#059669]" />
              You are signed in as a host. Tools stay available from the bar above.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium">
              <Link
                href="/"
                className="text-[#059669] underline-offset-4 transition-colors hover:underline"
              >
                Revolve home
              </Link>
              <span className="text-border" aria-hidden>
                ·
              </span>
              <Link
                href="/tools"
                className="text-[#059669] underline-offset-4 transition-colors hover:underline"
              >
                How tools work
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
