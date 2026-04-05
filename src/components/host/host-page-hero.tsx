import type { ReactNode } from "react";

export default function HostPageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="relative mb-10 overflow-hidden rounded-2xl border border-[#10B981]/20 bg-gradient-to-br from-[#10B981]/[0.07] via-card to-background p-6 shadow-sm ring-1 ring-[#10B981]/10 sm:mb-12 sm:p-8">
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#10B981]/10 blur-3xl"
        aria-hidden
      />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#059669] sm:text-sm">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-[2rem] lg:leading-tight">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
        {children ? <div className="mt-6 flex flex-wrap gap-3">{children}</div> : null}
      </div>
    </div>
  );
}
