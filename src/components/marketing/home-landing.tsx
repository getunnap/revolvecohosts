import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  Handshake,
  Home,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import HomeHeroVisual from "@/components/marketing/home-hero-visual";
import MarketingSiteHeader from "@/components/marketing/marketing-site-header";
import ProductPreviewStrip from "@/components/marketing/product-preview-strip";
import { REVOLVE_LOGO_URL } from "@/lib/site-brand";

export default function HomeLanding() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingSiteHeader />

      <section className="relative overflow-hidden bg-background">
        {/* Base wash */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#10B981]/[0.11] via-background via-45% to-[#059669]/[0.07] dark:from-[#10B981]/20 dark:via-background dark:via-40% dark:to-[#059669]/15"
          aria-hidden
        />
        {/* Soft mesh orbs */}
        <div
          className="pointer-events-none absolute -left-[35%] -top-[20%] h-[min(85vw,520px)] w-[min(85vw,520px)] rounded-full bg-[#10B981]/20 blur-3xl dark:bg-[#10B981]/25"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-[25%] top-[10%] h-[min(70vw,440px)] w-[min(70vw,440px)] rounded-full bg-[#059669]/15 blur-3xl dark:bg-[#059669]/20"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-[-15%] left-[25%] h-[min(55vw,360px)] w-[min(55vw,360px)] rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-500/15"
          aria-hidden
        />
        {/* Highlight arcs */}
        <div
          className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-50"
          style={{
            backgroundImage: `radial-gradient(ellipse 90% 55% at 15% 25%, rgb(16 185 129 / 0.14), transparent 55%),
              radial-gradient(ellipse 70% 50% at 85% 55%, rgb(5 150 105 / 0.12), transparent 50%)`,
          }}
          aria-hidden
        />
        {/* Subtle structure grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.45] dark:opacity-[0.22]"
          style={{
            backgroundImage: `linear-gradient(rgb(16 185 129 / 0.035) 1px, transparent 1px),
              linear-gradient(90deg, rgb(16 185 129 / 0.035) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse 85% 75% at 50% 45%, black 20%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 85% 75% at 50% 45%, black 20%, transparent 75%)",
          }}
          aria-hidden
        />
        {/* Bottom fade into page */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent dark:from-background"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="text-center lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/80 bg-secondary/80 px-4 py-2 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 shrink-0 text-[#10B981]" />
                <span className="text-sm text-muted-foreground">
                  Curated matching - not directory roulette
                </span>
              </div>
              <h1 className="mb-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-[2.75rem] lg:leading-[1.1]">
                Find your perfect co-host for your property
              </h1>
              <p className="mx-auto mb-8 max-w-xl text-base text-muted-foreground sm:text-lg lg:mx-0">
                Curated co-host matching for short-term rental hosts - by area, property,
                and fit - with introductions to vetted operators, not a passive directory.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start sm:gap-4">
                <Link
                  href="/find-cohost"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#10B981] px-8 py-4 font-semibold text-white shadow-lg transition-colors hover:bg-[#059669] sm:w-auto"
                >
                  Get started
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/cohosts"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-card/80 px-8 py-4 font-semibold text-foreground backdrop-blur-sm transition-colors hover:bg-muted/50 sm:w-auto"
                >
                  Apply as a co-host
                </Link>
              </div>
            </div>
            <div className="mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none">
              <HomeHeroVisual />
            </div>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-24 border-t border-border bg-gradient-to-b from-muted/30 via-background to-background py-20 sm:py-28"
        aria-labelledby="how-it-works-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[#059669] sm:text-xs">
              How it works
            </p>
            <h2
              id="how-it-works-heading"
              className="mb-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl"
            >
              From free host tools to vetted co-host introductions
            </h2>
            <p className="text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Airbnb hosts and short-term rental owners start with our audit, co-host matchmaking, or
              rental income estimates. We capture listing stage, portfolio scale, and how you want to
              work - then surface curated co-host matches and introductions, not endless profile
              scrolling.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3 md:gap-8">
            {[
              {
                icon: Wrench,
                title: "Tools and context",
                body: "Run the free Airbnb optimisation report, start co-host matchmaking, or get a rental income estimate. You get value up front; we learn what matters for operator fit.",
              },
              {
                icon: Users,
                title: "Curated co-host matching",
                body: "We score area, property type, guest profile, portfolio bandwidth, and operator expertise so shortlist quality stays high for hosts and co-hosts alike.",
              },
              {
                icon: Home,
                title: "Introductions that land",
                body: "Request an intro when you are ready. Co-hosts close deals off-platform; we focus on qualified handoffs between Airbnb hosts and proven operators.",
              },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="group rounded-2xl border border-border/80 bg-card/90 p-8 shadow-sm ring-1 ring-transparent transition-all hover:border-[#10B981]/35 hover:shadow-md hover:ring-[#10B981]/10"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#10B981]/10 transition-colors group-hover:bg-[#10B981]/15">
                    <Icon className="h-7 w-7 text-[#10B981]" />
                  </div>
                  <h3 className="mb-3 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                    {step.title}
                  </h3>
                  <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {step.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="tools"
        className="scroll-mt-24 border-t border-border/60 bg-muted/25 py-20 sm:py-28"
        aria-labelledby="tools-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[#059669] sm:text-xs">
              Host tools
            </p>
            <h2
              id="tools-heading"
              className="mb-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl"
            >
              Free Airbnb and co-host tools
            </h2>
            <p className="text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Each path feeds the same curated matching model: short-term rental and Airbnb hosts get
              actionable insight first, then co-host introductions when the fit is right.
            </p>
            <p className="mt-6">
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 font-semibold text-[#059669] underline-offset-4 transition-colors hover:text-[#047857] hover:underline"
              >
                Full guide: what each tool does and example results
                <ArrowRight className="h-4 w-4" />
              </Link>
            </p>
          </div>
          <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            <div className="flex min-h-0 flex-col gap-4">
              <Link
                href="/audit"
                className="group flex min-h-0 flex-1 flex-col rounded-2xl border border-border/80 bg-card p-8 shadow-sm ring-1 ring-transparent transition-all hover:border-[#10B981]/45 hover:shadow-md hover:ring-[#10B981]/10"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#10B981]/10 transition-colors group-hover:bg-[#10B981]/15">
                  <BarChart3 className="h-6 w-6 text-[#10B981]" />
                </div>
                <h3 className="mb-2 text-xl font-semibold tracking-tight group-hover:text-[#059669]">
                  Airbnb listing audit
                </h3>
                <p className="mb-6 flex-1 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Free optimisation report for live Airbnb listings: missed revenue, fixes, and
                  improvements you can ship fast. No listing yet? Use co-host matchmaking or Get
                  started in the hero to share property context instead.
                </p>
                <span className="inline-flex items-center gap-2 font-medium text-[#10B981]">
                  Run the audit
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
              <p className="flex gap-2 px-1 text-sm leading-relaxed text-muted-foreground">
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]"
                  aria-hidden
                />
                <span>
                  <span className="sr-only">Listing audit: </span>
                  Audit, matchmaking, and income tools share one matching spine
                </span>
              </p>
            </div>

            <div className="flex min-h-0 flex-col gap-4">
              <Link
                href="/find-cohost"
                className="group flex min-h-0 flex-1 flex-col rounded-2xl border border-border/80 bg-card p-8 shadow-sm ring-1 ring-transparent transition-all hover:border-[#10B981]/45 hover:shadow-md hover:ring-[#10B981]/10"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#10B981]/10 transition-colors group-hover:bg-[#10B981]/15">
                  <Handshake className="h-6 w-6 text-[#10B981]" />
                </div>
                <h3 className="mb-2 text-xl font-semibold tracking-tight group-hover:text-[#059669]">
                  Co-host matchmaking
                </h3>
                <p className="mb-6 flex-1 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Step-by-step funnel for STR and Airbnb hosts: property, listing stage, guest type,
                  and how you want to work. We return curated co-host matches and intro-ready
                  handoffs - not directory roulette.
                </p>
                <span className="inline-flex items-center gap-2 font-medium text-[#10B981]">
                  Start matchmaking
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
              <p className="flex gap-2 px-1 text-sm leading-relaxed text-muted-foreground">
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]"
                  aria-hidden
                />
                <span>
                  <span className="sr-only">Co-host matchmaking: </span>
                  Active demand and curated intros - not a passive co-host directory
                </span>
              </p>
            </div>

            <div className="flex min-h-0 flex-col gap-4 sm:col-span-2 lg:col-span-1">
              <Link
                href="/income-estimate"
                className="group flex min-h-0 flex-1 flex-col rounded-2xl border border-border/80 bg-card p-8 shadow-sm ring-1 ring-transparent transition-all hover:border-[#10B981]/45 hover:shadow-md hover:ring-[#10B981]/10"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#10B981]/10 transition-colors group-hover:bg-[#10B981]/15">
                  <TrendingUp className="h-6 w-6 text-[#10B981]" />
                </div>
                <h3 className="mb-2 text-xl font-semibold tracking-tight group-hover:text-[#059669]">
                  Rental income estimate
                </h3>
                <p className="mb-6 flex-1 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Monthly-style earnings projections for short-term rental and Airbnb-style lets. Add
                  a few inputs and get a clear figure for planning and co-host matching context.
                </p>
                <span className="inline-flex items-center gap-2 font-medium text-[#10B981]">
                  Run income estimate
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
              <p className="flex gap-2 px-1 text-sm leading-relaxed text-muted-foreground">
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]"
                  aria-hidden
                />
                <span>
                  <span className="sr-only">Rental income estimate: </span>
                  One Airbnb or a portfolio of STR properties, live or pre-list
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="see-the-tools"
        className="scroll-mt-24 border-t border-border/60 bg-muted/20 py-20 sm:py-28"
        aria-labelledby="preview-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[#059669] sm:text-xs">
              Inside the tools
            </p>
            <h2
              id="preview-heading"
              className="mb-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl"
            >
              What you get before the intro
            </h2>
            <p className="text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Stylised previews of each path — run the real flows for your own listing or property
              context.
            </p>
          </div>
          <ProductPreviewStrip />
        </div>
      </section>

      <section
        id="reviews"
        className="scroll-mt-24 border-t border-border/60 bg-gradient-to-b from-background to-muted/25 py-20 sm:py-28"
        aria-labelledby="reviews-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[#059669] sm:text-xs">
              Reviews
            </p>
            <h2
              id="reviews-heading"
              className="mb-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl"
            >
              What hosts and operators say
            </h2>
            <p className="text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Curated matching cuts noise for hosts and operators. Here is the kind of feedback we
              hear once tools and intros are in the mix.
            </p>
          </div>
          <div className="mx-auto mb-12 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {[
              { k: "3", label: "Free host tools" },
              { k: "7", label: "Match signals" },
              { k: "3", label: "Curated matches" },
              { k: "UK", label: "Operator focus" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border/80 bg-card/80 px-4 py-3 text-center shadow-sm"
              >
                <p className="text-xl font-bold tabular-nums text-[#059669] sm:text-2xl">{s.k}</p>
                <p className="mt-0.5 text-xs font-medium leading-snug text-muted-foreground sm:text-sm">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-3 md:gap-8">
            {[
              {
                quote:
                  "The audit surfaced revenue gaps I had been ignoring. Matchmaking felt tailored - three operators who actually fit my coastal lets, not a random list.",
                name: "James R.",
                initials: "JR",
                avatarClass: "from-sky-500 to-indigo-600",
                role: "STR host",
                location: "South West England",
              },
              {
                quote:
                  "We run multiple Airbnb listings and needed bandwidth, not another job board. The intro flow was clear and the co-hosts we met were pre-filtered for our area.",
                name: "Priya M.",
                initials: "PM",
                avatarClass: "from-violet-500 to-fuchsia-600",
                role: "Portfolio host",
                location: "London",
              },
              {
                quote:
                  "As an operator, I get leads with context - property type, guest mix, what the host wants. Way less noise than open directories.",
                name: "Tom S.",
                initials: "TS",
                avatarClass: "from-teal-500 to-emerald-700",
                role: "Co-host operator",
                location: "UK",
              },
            ].map((item) => (
              <figure
                key={item.name}
                className="group flex h-full flex-col rounded-2xl border border-border/80 bg-card/90 p-8 shadow-sm ring-1 ring-transparent transition-all hover:border-[#10B981]/35 hover:shadow-md hover:ring-[#10B981]/10"
              >
                <div className="mb-4 flex items-center gap-1 text-[#10B981]" aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-[#10B981] text-[#10B981]"
                    />
                  ))}
                </div>
                <blockquote className="mb-6 flex-1 text-pretty text-sm leading-relaxed text-foreground sm:text-base">
                  <span className="sr-only">Quote: </span>
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <figcaption className="flex items-center gap-3 border-t border-border/60 pt-5">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${item.avatarClass} text-sm font-bold text-white shadow-sm`}
                    aria-hidden
                  >
                    {item.initials}
                  </div>
                  <div className="min-w-0 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{item.name}</span>
                    <span className="mx-1.5 text-border" aria-hidden>
                      &middot;
                    </span>
                    <span className="block sm:inline">
                      {item.role}, {item.location}
                    </span>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section
        className="border-t border-border/60 bg-gradient-to-b from-background to-muted/20 py-20 sm:py-28"
        aria-labelledby="audit-cta-heading"
      >
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#10B981] via-[#0d9668] to-[#047857] p-10 text-white shadow-lg ring-1 ring-white/10 sm:p-14">
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-black/10 blur-2xl"
              aria-hidden
            />
            <div className="relative">
              <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-white/70 sm:text-xs">
                Airbnb hosts
              </p>
              <h2
                id="audit-cta-heading"
                className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl"
              >
                Free Airbnb listing audit
              </h2>
              <p className="mx-auto mb-4 max-w-xl text-pretty text-lg leading-relaxed opacity-95">
                See missed revenue signals and concrete fixes for your live short-term rental listing
                - the fastest on-ramp before co-host matching.
              </p>
              <p className="mx-auto mb-8 max-w-lg text-pretty text-base leading-relaxed opacity-90">
                No Airbnb URL yet? Use{" "}
                <Link
                  href="/find-cohost"
                  className="font-semibold text-white underline decoration-white/40 underline-offset-2 transition-opacity hover:opacity-100 hover:decoration-white"
                >
                  co-host matchmaking
                </Link>{" "}
                or Get started above to tell us about your property and goals.
              </p>
              <Link
                href="/audit"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-[#059669] shadow-md transition-all hover:bg-white/95 hover:shadow-lg"
              >
                Open the Airbnb audit
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-muted/35 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 grid gap-10 md:grid-cols-4">
            <div className="md:col-span-1">
              <div className="mb-4 flex items-center gap-3">
                <Image
                  src={REVOLVE_LOGO_URL}
                  alt="Revolve Co-Hosts - Airbnb co-host matching"
                  width={160}
                  height={40}
                  className="h-10 w-auto"
                  sizes="160px"
                />
              </div>
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                Curated co-host marketplace for Airbnb and short-term rental hosts. Free listing
                tools, vetted operator matchmaking, and paid-quality introductions - not a passive
                directory.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground">
                Hosts & landlords
              </h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/tools"
                    className="transition-colors hover:text-[#059669] hover:underline hover:underline-offset-2"
                  >
                    All host tools
                  </Link>
                </li>
                <li>
                  <Link
                    href="/find-cohost"
                    className="transition-colors hover:text-[#059669] hover:underline hover:underline-offset-2"
                  >
                    Co-host matchmaking
                  </Link>
                </li>
                <li>
                  <Link
                    href="/audit"
                    className="transition-colors hover:text-[#059669] hover:underline hover:underline-offset-2"
                  >
                    Airbnb listing audit
                  </Link>
                </li>
                <li>
                  <Link
                    href="/income-estimate"
                    className="transition-colors hover:text-[#059669] hover:underline hover:underline-offset-2"
                  >
                    Income estimate
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="transition-colors hover:text-[#059669] hover:underline hover:underline-offset-2"
                  >
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="transition-colors hover:text-[#059669] hover:underline hover:underline-offset-2"
                  >
                    Sign up
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground">
                Co-host operators
              </h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/cohosts"
                    className="transition-colors hover:text-[#059669] hover:underline hover:underline-offset-2"
                  >
                    Apply as a co-host
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login?as=cohost"
                    className="transition-colors hover:text-[#059669] hover:underline hover:underline-offset-2"
                  >
                    Co-host log in
                  </Link>
                </li>
                <li>
                  <Link
                    href="/operator/signup"
                    className="transition-colors hover:text-[#059669] hover:underline hover:underline-offset-2"
                  >
                    Co-host sign up
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:hello@revolvecohosts.com"
                    className="transition-colors hover:text-[#059669] hover:underline hover:underline-offset-2"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground">
                Legal
              </h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/privacy"
                    className="transition-colors hover:text-foreground hover:underline hover:underline-offset-2"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="transition-colors hover:text-foreground hover:underline hover:underline-offset-2"
                  >
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/80 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 Revolve Co-Hosts. Airbnb co-host matching and host tools.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
