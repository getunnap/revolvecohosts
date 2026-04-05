import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  Handshake,
  Lightbulb,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";
import MarketingSiteHeader from "@/components/marketing/marketing-site-header";
import ProductPreviewStrip from "@/components/marketing/product-preview-strip";
import { REVOLVE_LOGO_URL } from "@/lib/site-brand";

export default function ToolsLanding() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingSiteHeader cta={{ href: "/audit", label: "Run audit" }} />

      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-muted/30 to-background py-16 sm:py-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-25"
          style={{
            backgroundImage: `linear-gradient(rgb(16 185 129 / 0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgb(16 185 129 / 0.04) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[#059669] sm:text-xs">
            Host tools
          </p>
          <h1 className="mb-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Free Airbnb and co-host tools
          </h1>
          <p className="mx-auto max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Three paths into Revolve: a live-listing audit, curated co-host matchmaking, and a
            rental income estimate. Each one gives you something useful on its own - and each
            feeds the same matching spine when you are ready for introductions.
          </p>
          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link
              href="/audit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#10B981] px-6 py-3.5 font-semibold text-white shadow-md transition-colors hover:bg-[#059669]"
            >
              Airbnb listing audit
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/find-cohost"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 font-semibold text-foreground transition-colors hover:bg-muted/50"
            >
              Co-host matchmaking
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/income-estimate"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 font-semibold text-foreground transition-colors hover:bg-muted/50"
            >
              Income estimate
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <section
          id="airbnb-listing-audit"
          className="scroll-mt-28 border-b border-border/70 pb-16 sm:pb-20"
          aria-labelledby="audit-tool-heading"
        >
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#10B981]/10">
            <BarChart3 className="h-7 w-7 text-[#10B981]" />
          </div>
          <h2
            id="audit-tool-heading"
            className="mb-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            Airbnb listing audit
          </h2>
          <p className="mb-6 text-pretty text-base leading-relaxed text-muted-foreground">
            Built for hosts with a live Airbnb URL. You paste your listing link, confirm a few
            details, and get an optimisation-style readout: where revenue may be left on the table,
            what to fix first, and how your positioning lines up with the guests you say you want.
            It is the fastest way to see concrete improvements before you think about hiring a
            co-host.
          </p>
          <ul className="mb-10 space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li className="flex gap-2">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#10B981]" />
              <span>
                <strong className="text-foreground">Instant angle:</strong> pricing, calendar, and
                demand signals summarised in plain language, not generic hosting blog advice.
              </span>
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#10B981]" />
              <span>
                <strong className="text-foreground">Action list:</strong> headline, photos, amenities,
                and guest-fit tweaks you can ship without a management contract.
              </span>
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#10B981]" />
              <span>
                <strong className="text-foreground">Path to depth:</strong> free preview first; full
                report unlock when you want every section unpacked for your exact listing.
              </span>
            </li>
          </ul>

          <div
            className="rounded-2xl border border-border/80 bg-muted/25 p-6 sm:p-8"
            role="note"
            aria-label="Illustrative example of audit-style output"
          >
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Lightbulb className="h-5 w-5 text-[#10B981]" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Example output (illustrative only)
              </span>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Your real report is generated from your URL and settings. The block below shows the
              kind of structure hosts typically see - not your data.
            </p>
            <div className="space-y-4 rounded-xl border border-border bg-card/80 p-5 text-sm shadow-sm">
              <div>
                <p className="mb-1 font-semibold text-foreground">Missed revenue signals</p>
                <p className="text-muted-foreground">
                  &ldquo;Weekend ADR sits 12% under comparable 2-bed units in your postcode band -
                  tightening minimum stay on Fri-Sun could recover roughly £X-Y per booked
                  night.&rdquo;
                </p>
              </div>
              <div>
                <p className="mb-1 font-semibold text-foreground">Quick wins</p>
                <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                  <li>Lead photo does not show the main sleeping space guests filter for.</li>
                  <li>Title omits a high-intent keyword your comp set uses (e.g. parking, desk).</li>
                  <li>Cleaning fee is an outlier vs similar listings - may hurt conversion.</li>
                </ul>
              </div>
              <div>
                <p className="mb-1 font-semibold text-foreground">Guest fit</p>
                <p className="text-muted-foreground">
                  &ldquo;Listing copy skews luxury couples, but amenities and photos read
                  family-weekend - align tone and hero shots with the guest type you want.&rdquo;
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <Link
              href="/audit"
              className="inline-flex items-center gap-2 font-semibold text-[#059669] underline-offset-4 hover:underline"
            >
              Open the free Airbnb audit
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section
          id="cohost-matchmaking"
          className="scroll-mt-28 border-b border-border/70 py-16 sm:py-20"
          aria-labelledby="matchmaking-tool-heading"
        >
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#10B981]/10">
            <Handshake className="h-7 w-7 text-[#10B981]" />
          </div>
          <h2
            id="matchmaking-tool-heading"
            className="mb-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            Co-host matchmaking
          </h2>
          <p className="mb-6 text-pretty text-base leading-relaxed text-muted-foreground">
            For Airbnb and short-term rental hosts who want operator help - including pre-list or
            portfolio hosts without a public URL. You move through a guided funnel: location and
            property shape, listing stage, guest type, how hands-on you want to be, and bandwidth
            for multiple properties. We use that context to surface a short, curated set of
            co-host profiles and a clear path to request introductions - not an open directory.
          </p>
          <ul className="mb-10 space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li className="flex gap-2">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#10B981]" />
              <span>
                <strong className="text-foreground">Fit signals:</strong> area, property type,
                portfolio scale, guest profile, and the style of co-host relationship you want.
              </span>
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#10B981]" />
              <span>
                <strong className="text-foreground">Curated shortlist:</strong> a small number of
                vetted operators chosen for relevance - you compare, then request intros when it
                feels right.
              </span>
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#10B981]" />
              <span>
                <strong className="text-foreground">Off-platform deals:</strong> we focus on
                qualified handoffs; contracts and commercials stay between you and the co-host.
              </span>
            </li>
          </ul>

          <div
            className="rounded-2xl border border-border/80 bg-muted/25 p-6 sm:p-8"
            role="note"
            aria-label="Illustrative example of match cards"
          >
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Users className="h-5 w-5 text-[#10B981]" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Example shortlist (illustrative only)
              </span>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              Real results show live operator profiles for your inputs. Names and stats below are
              placeholders.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  area: "Your city · urban 2-bed",
                  proof: "9 active listings · 4.95 avg guest rating",
                  angle: "Strong on corporate midweek + event peaks",
                },
                {
                  area: "Your region · whole-home",
                  proof: "Portfolio of 14 · family and multi-gen stays",
                  angle: "Owner-absentee playbook and local contractor bench",
                },
                {
                  area: "Your postcode band",
                  proof: "6 listings · similar ADR band to your comp set",
                  angle: "Guest-type match: leisure couples and small groups",
                },
              ].map((card) => (
                <div
                  key={card.area}
                  className="rounded-xl border border-border bg-card p-4 text-left shadow-sm"
                >
                  <div className="mb-2 flex items-start gap-2 text-xs text-muted-foreground">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#10B981]" />
                    <span>{card.area}</span>
                  </div>
                  <p className="mb-2 text-sm font-medium text-foreground">{card.proof}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">{card.angle}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <Link
              href="/find-cohost"
              className="inline-flex items-center gap-2 font-semibold text-[#059669] underline-offset-4 hover:underline"
            >
              Start co-host matchmaking
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section
          id="rental-income-estimate"
          className="scroll-mt-28 pt-4 sm:pt-6"
          aria-labelledby="income-tool-heading"
        >
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#10B981]/10">
            <BarChart3 className="h-7 w-7 text-[#10B981]" />
          </div>
          <h2
            id="income-tool-heading"
            className="mb-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            Rental income estimate
          </h2>
          <p className="mb-6 text-pretty text-base leading-relaxed text-muted-foreground">
            A short flow over property type, bedrooms, how open your calendar is, and an optional
            gross bracket. You get a 12-month indicative gross range, plain-language reasoning, and
            three co-host suggestions using the same cards as matchmaking.
          </p>
          <ul className="mb-10 space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li className="flex gap-2">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#10B981]" />
              <span>
                <strong className="text-foreground">Availability-aware:</strong> year-round vs
                seasonal or blocked calendars scales the annual picture, not just one busy month.
              </span>
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#10B981]" />
              <span>
                <strong className="text-foreground">Same matching spine:</strong> we reuse the
                matchmaking mock operators so recommended co-hosts look identical to the funnel
                results.
              </span>
            </li>
          </ul>

          <div
            className="rounded-2xl border border-border/90 bg-muted/15 p-6 sm:p-8"
            role="note"
            aria-label="Example of income estimate output"
          >
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#10B981]" />
              <span className="text-xs font-semibold uppercase tracking-wide text-[#059669]">
                Example output
              </span>
            </div>
            <div className="rounded-xl border border-border bg-card/60 p-5 text-sm text-muted-foreground">
              <p className="mb-3 font-semibold text-foreground">12-month gross band</p>
              <p className="mb-4">
                &ldquo;Estimated gross £18k–£32k over the next 12 months (mid ~£25k), after your
                mostly-open calendar — plus why we used your bedrooms, property type, and optional
                revenue bracket, and three co-host cards below.&rdquo;
              </p>
              <p className="text-xs">
                Figures are indicative gross bookings only — not after fees, cleaning, tax, or
                co-host splits.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <Link
              href="/income-estimate"
              className="inline-flex items-center gap-2 font-semibold text-[#059669] underline-offset-4 hover:underline"
            >
              Run income estimate
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </article>

      <section
        className="border-t border-border/60 bg-gradient-to-b from-background to-muted/25 py-16 sm:py-20"
        aria-labelledby="tools-preview-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[#059669] sm:text-xs">
              Previews
            </p>
            <h2
              id="tools-preview-heading"
              className="mb-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
              What each tool looks like
            </h2>
            <p className="text-pretty text-muted-foreground">
              Illustrative layouts — your real outputs are personalised to your listing and answers.
            </p>
          </div>
          <ProductPreviewStrip />
        </div>
      </section>

      <section className="border-t border-border/60 bg-gradient-to-b from-muted/20 to-background py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Pick a tool and start in minutes
          </h2>
          <p className="mb-8 text-pretty text-muted-foreground">
            Live listing? Start with the audit. Co-host-first? Use matchmaking. Planning income
            before you commit? Run the estimate — all three feed the same intro path.
          </p>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/audit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#10B981] px-8 py-4 font-semibold text-white transition-colors hover:bg-[#059669]"
            >
              Run the audit
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/find-cohost"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-8 py-4 font-semibold text-foreground transition-colors hover:bg-muted/50"
            >
              Matchmaking funnel
            </Link>
            <Link
              href="/income-estimate"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-8 py-4 font-semibold text-foreground transition-colors hover:bg-muted/50"
            >
              Income estimate
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-muted/35 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 grid gap-10 md:grid-cols-4">
            <div className="md:col-span-1">
              <Link href="/" className="mb-4 inline-flex items-center gap-3">
                <Image
                  src={REVOLVE_LOGO_URL}
                  alt="Revolve Co-Hosts - Airbnb co-host matching"
                  width={160}
                  height={40}
                  className="h-10 w-auto"
                  sizes="160px"
                />
              </Link>
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                Curated co-host marketplace for Airbnb and short-term rental hosts. Free listing
                tools, vetted operator matchmaking, and introductions - not a passive directory.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground">
                Hosts & landlords
              </h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">Host tools</span>
                  <span className="text-muted-foreground"> (this page)</span>
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
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground">
                Co-host operators
              </h3>
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
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground">
                Legal
              </h3>
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
