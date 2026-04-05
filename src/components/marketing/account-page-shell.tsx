"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import MarketingSiteHeader, {
  type MarketingSiteHeaderProps,
} from "@/components/marketing/marketing-site-header";

type AccountPageShellProps = {
  children: ReactNode;
  /** Shown in the main card header area */
  title: string;
  description?: string;
  headerCta?: MarketingSiteHeaderProps["cta"];
  hideHeaderLoginLink?: boolean;
};

export default function AccountPageShell({
  children,
  title,
  description,
  headerCta = { href: "/tools", label: "Free tools" },
  hideHeaderLoginLink = false,
}: AccountPageShellProps) {
  return (
    <div className="relative min-h-screen bg-background">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#10B981]/[0.08] via-background via-45% to-[#059669]/[0.05] dark:from-[#10B981]/15 dark:via-background dark:to-[#059669]/12"
        aria-hidden
      />
      <div className="relative flex min-h-screen flex-col">
        <MarketingSiteHeader cta={headerCta} hideLoginLink={hideHeaderLoginLink} />
        <main className="flex flex-1 flex-col px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-3xl">
            <div className="mb-8">
              <p className="text-sm font-medium text-[#059669]">Account</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {title}
              </h1>
              {description ? (
                <p className="mt-2 text-pretty text-muted-foreground">{description}</p>
              ) : null}
            </div>
            <div className="rounded-2xl border border-border/80 bg-card/90 p-6 shadow-sm backdrop-blur-sm sm:p-8">
              {children}
            </div>
            <p className="mt-8 text-center text-sm text-muted-foreground">
              <Link
                href="/"
                className="font-medium text-[#059669] underline-offset-4 hover:underline"
              >
                Back to home
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
