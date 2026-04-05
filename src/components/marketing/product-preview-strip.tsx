/**
 * Stylised UI previews (no screenshots) so hosts see what each tool “looks like” before clicking through.
 */
export default function ProductPreviewStrip() {
  return (
    <div className="grid gap-8 lg:grid-cols-3 lg:gap-6">
      <figure className="flex flex-col rounded-2xl border border-border/80 bg-card/90 p-5 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.06]">
        <figcaption className="mb-4 text-left">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[#059669]">
            Listing audit
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">Optimisation snapshot</p>
        </figcaption>
        <div className="relative flex flex-1 flex-col overflow-hidden rounded-xl border border-border/70 bg-gradient-to-b from-muted/40 to-background p-4">
          <div className="mb-3 flex items-center justify-between gap-2 border-b border-border/60 pb-3">
            <span className="text-[10px] font-medium text-muted-foreground">Report preview</span>
            <span className="rounded-full bg-[#10B981]/15 px-2 py-0.5 text-[10px] font-semibold text-[#047857]">
              Free tier
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-[#10B981]/35 bg-[#10B981]/10 text-lg font-bold text-[#059669]"
              aria-hidden
            >
              78
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="h-2 w-full max-w-[90%] rounded-full bg-muted" />
              <div className="h-2 w-full max-w-[70%] rounded-full bg-muted" />
              <div className="h-2 w-full max-w-[55%] rounded-full bg-muted" />
            </div>
          </div>
          <ul className="mt-4 space-y-2 text-left text-[11px] leading-snug text-muted-foreground">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#10B981]" />
              Pricing & calendar signals summarised
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#10B981]" />
              Missed revenue angles & quick fixes
            </li>
          </ul>
        </div>
      </figure>

      <figure className="flex flex-col rounded-2xl border border-border/80 bg-card/90 p-5 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.06]">
        <figcaption className="mb-4 text-left">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[#059669]">
            Matchmaking
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">Funnel → three matches</p>
        </figcaption>
        <div className="relative flex flex-1 flex-col overflow-hidden rounded-xl border border-border/70 bg-gradient-to-b from-muted/40 to-background p-4">
          <div className="mb-3 flex gap-1">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className={`h-1.5 flex-1 rounded-full ${n <= 2 ? "bg-[#10B981]" : "bg-muted"}`}
              />
            ))}
          </div>
          <p className="mb-3 text-[10px] font-medium text-muted-foreground">Property & guest fit</p>
          <div className="flex flex-wrap gap-1.5">
            {["Coastal", "2 bed", "Families"].map((t) => (
              <span
                key={t}
                className="rounded-md border border-[#10B981]/30 bg-[#10B981]/8 px-2 py-1 text-[10px] font-medium text-[#047857]"
              >
                {t}
              </span>
            ))}
          </div>
          <div className="mt-4 flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`flex h-11 w-11 items-center justify-center rounded-full border-2 text-[10px] font-bold ${
                  i === 1
                    ? "border-[#10B981] bg-[#10B981]/15 text-[#059669]"
                    : "border-border bg-muted/50 text-muted-foreground"
                }`}
                aria-hidden
              >
                {i + 1}
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-[10px] text-muted-foreground">Curated shortlist</p>
        </div>
      </figure>

      <figure className="flex flex-col rounded-2xl border border-border/80 bg-card/90 p-5 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.06]">
        <figcaption className="mb-4 text-left">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[#059669]">
            Income estimate
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">Monthly range output</p>
        </figcaption>
        <div className="relative flex flex-1 flex-col overflow-hidden rounded-xl border border-border/70 bg-gradient-to-b from-emerald-50/80 to-background p-4 dark:from-emerald-950/20">
          <p className="text-[10px] font-medium text-teal-800/90 dark:text-teal-200/90">
            Estimated monthly (12 mo)
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            £2,100 – £2,800
          </p>
          <p className="text-[11px] text-muted-foreground">Illustrative preview — not your listing</p>
          <div className="mt-4 flex h-24 items-end justify-between gap-1 px-1">
            {[40, 55, 48, 62, 58, 70, 65, 72, 68, 75, 80, 78].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-gradient-to-t from-[#10B981]/50 to-[#10B981]/85"
                style={{ height: `${h}%` }}
                aria-hidden
              />
            ))}
          </div>
        </div>
      </figure>
    </div>
  );
}
