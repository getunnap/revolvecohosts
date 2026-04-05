"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  CreditCard,
  MapPin,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { useCallback, useState } from "react";
import MarketingSiteHeader from "@/components/marketing/marketing-site-header";
import {
  formatGbpWhole,
  OPERATOR_FREE_INTRO_CREDITS,
  OPERATOR_INTRO_PRICE_GBP,
} from "@/lib/operator-intro-pricing";

const LISTING_BANDS = [
  { value: "1", label: "1 listing" },
  { value: "2-5", label: "2–5 listings" },
  { value: "6-15", label: "6–15 listings" },
  { value: "16+", label: "16+ listings" },
];

export default function CohostApplyLanding() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [areasServed, setAreasServed] = useState("");
  const [listingsManaged, setListingsManaged] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [pitch, setPitch] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!agreed) {
        setErrorMessage("Please confirm you agree to our privacy policy.");
        setStatus("error");
        return;
      }
      setStatus("submitting");
      setErrorMessage("");
      try {
        const res = await fetch("/api/cohost-apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName,
            email,
            phone: phone.trim() || undefined,
            areasServed,
            listingsManaged,
            portfolioUrl: portfolioUrl.trim() || undefined,
            pitch: pitch.trim() || undefined,
          }),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          setErrorMessage(
            data.error ?? "Something went wrong. Please try again.",
          );
          setStatus("error");
          return;
        }
        setStatus("success");
      } catch {
        setErrorMessage("Network error. Please try again.");
        setStatus("error");
      }
    },
    [
      agreed,
      areasServed,
      email,
      fullName,
      listingsManaged,
      phone,
      pitch,
      portfolioUrl,
    ],
  );

  return (
    <div className="min-h-screen bg-background">
      <MarketingSiteHeader cta={{ href: "#apply", label: "Apply" }} />

      <section className="relative overflow-hidden border-b border-border">
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#10B981]/[0.11] via-background via-45% to-[#059669]/[0.07] dark:from-[#10B981]/20 dark:via-background dark:via-40% dark:to-[#059669]/15"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-[20%] top-[10%] h-[min(70vw,440px)] w-[min(70vw,440px)] rounded-full bg-[#059669]/15 blur-3xl dark:bg-[#059669]/20"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/80 bg-secondary/80 px-4 py-2 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 shrink-0 text-[#10B981]" />
              <span className="text-sm text-muted-foreground">
                For operators — not hosts hiring help
              </span>
            </div>
            <h1 className="mb-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Get introduced to hosts who already want a co-host
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Revolve pulls in Airbnb and short-let hosts through free tools and
              curated matching — then delivers qualified intros to vetted
              operators. Your first {OPERATOR_FREE_INTRO_CREDITS} intros are free; after that{" "}
              {formatGbpWhole(OPERATOR_INTRO_PRICE_GBP)} per intro via credits. Deals close
              off-platform.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <a
                href="#apply"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#10B981] px-8 py-4 font-semibold text-white shadow-lg transition-colors hover:bg-[#059669] sm:w-auto"
              >
                Apply to join
                <ArrowRight className="h-5 w-5" />
              </a>
              <Link
                href="/tools"
                className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-card/80 px-8 py-4 font-semibold text-foreground backdrop-blur-sm transition-colors hover:bg-muted/50 sm:w-auto"
              >
                How hosts find us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        className="border-b border-border bg-gradient-to-b from-muted/30 via-background to-background py-16 sm:py-20"
        aria-labelledby="why-revolve-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[#059669] sm:text-xs">
              Why operators apply
            </p>
            <h2
              id="why-revolve-heading"
              className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
              Demand first — not directory browsing
            </h2>
            <p className="mt-3 text-muted-foreground">
              Hosts arrive with context from our tools and funnel. You are not
              competing for cold clicks on a passive marketplace.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Target,
                title: "Qualified intros",
                body: "Leads are matched by area, property type, and fit — so conversations start closer to a real engagement.",
              },
              {
                icon: CreditCard,
                title: "Simple economics",
                body: `Your first ${OPERATOR_FREE_INTRO_CREDITS} intros are free when you join. Then ${formatGbpWhole(OPERATOR_INTRO_PRICE_GBP)} per intro — buy packs or subscribe as you scale.`,
              },
              {
                icon: ShieldCheck,
                title: "Vetted supply side",
                body: "We review applications, portfolio proof, and coverage so hosts keep trusting the shortlist.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-border bg-card/80 p-6 shadow-sm transition-colors hover:border-[#10B981]/40"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#10B981]/10">
                  <Icon className="h-6 w-6 text-[#10B981]" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-22" aria-labelledby="how-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            id="how-heading"
            className="mb-10 text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            From application to intros
          </h2>
          <ol className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "1",
                title: "Apply",
                text: "Tell us your markets, scale, and proof (profile or portfolio link).",
              },
              {
                step: "2",
                title: "Review",
                text: "We check fit for our host pipeline and coverage needs.",
              },
              {
                step: "3",
                title: "Credits",
                text: `When approved, you get ${OPERATOR_FREE_INTRO_CREDITS} free intros, then ${formatGbpWhole(OPERATOR_INTRO_PRICE_GBP)} each — top up with packs or a plan on the operator side.`,
              },
              {
                step: "4",
                title: "Matched leads",
                text: "Receive intros that align with area and property type — you close directly with the host.",
              },
            ].map((item) => (
              <li
                key={item.step}
                className="relative rounded-2xl border border-border bg-muted/20 p-5"
              >
                <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#10B981] text-sm font-bold text-white">
                  {item.step}
                </span>
                <h3 className="mb-2 font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-y border-border bg-muted/15 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 text-[#059669]">
                <Users className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">
                  Ideal profile
                </span>
              </div>
              <h2 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">
                What we look for
              </h2>
              <ul className="space-y-3 text-muted-foreground">
                {[
                  "Active co-host or STR operator with guest-facing experience",
                  "Clear geographic coverage or willingness to define your service areas",
                  "Evidence of listings managed (Airbnb host/co-host profile, site, or portfolio)",
                  "Professional comms — hosts are trusting you with their asset",
                ].map((line) => (
                  <li key={line} className="flex gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#10B981]" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
              <div className="mb-4 inline-flex items-center gap-2 text-[#059669]">
                <MapPin className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">
                  Transparency
                </span>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-foreground">
                Commercials
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                Revenue is at intro delivery: you purchase credits for
                qualified handoffs. Final agreements, pricing, and contracts
                between you and the host stay off-platform — we focus on match
                quality and intent.
              </p>
              <p className="text-sm text-muted-foreground">
                Exact intro pricing and pack sizes are confirmed when your
                application is approved.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20" aria-labelledby="faq-heading">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2
            id="faq-heading"
            className="mb-8 text-center text-2xl font-bold text-foreground sm:text-3xl"
          >
            Questions
          </h2>
          <dl className="space-y-6">
            {[
              {
                q: "Is this the same as hosts hiring me for a monthly fee?",
                a: "No. This page is for operators who want intros to hosts on Revolve. Hosts use our tools and funnel separately.",
              },
              {
                q: "Who are the hosts?",
                a: "Airbnb and short-term rental owners who have used our audit, income estimate, or co-host matching path — often with property context already on file.",
              },
              {
                q: "Do you guarantee bookings or management contracts?",
                a: "We deliver curated introductions; closing the deal is between you and the host.",
              },
              {
                q: "How fast is review?",
                a: "We aim to respond within a few business days. Incomplete applications take longer.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-border pb-6 last:border-0">
                <dt className="mb-2 font-semibold text-foreground">{q}</dt>
                <dd className="text-sm leading-relaxed text-muted-foreground">
                  {a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section
        id="apply"
        className="scroll-mt-24 border-t border-border bg-gradient-to-b from-background to-muted/20 py-16 sm:py-24"
      >
        <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Apply in a few minutes
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              No payment on this step — we review fit first.
            </p>
          </div>

          {status === "success" ? (
            <div className="rounded-2xl border-2 border-[#10B981]/50 bg-[#10B981]/5 p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#10B981]/15">
                <Check className="h-8 w-8 text-[#10B981]" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Application received
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Check your inbox for a confirmation email. We will follow up
                within a few business days.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                Once approved, use{" "}
                <strong className="font-medium text-foreground">Log in</strong> (top right) with
                your email and password to open the co-host portal — credits, leads, and top-up.
              </p>
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/login?as=cohost"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#10B981] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#059669]"
                >
                  Co-host log in
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/operator/signup"
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50"
                >
                  Co-host sign up
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#059669] hover:underline"
                >
                  Back to home
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
            >
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="ca-name"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Full name
                  </label>
                  <input
                    id="ca-name"
                    name="fullName"
                    required
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-input bg-input-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-offset-background focus-visible:border-[#10B981]/40 focus-visible:ring-2 focus-visible:ring-[#10B981]/35"
                  />
                </div>
                <div>
                  <label
                    htmlFor="ca-email"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Work email
                  </label>
                  <input
                    id="ca-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-input bg-input-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-offset-background focus-visible:border-[#10B981]/40 focus-visible:ring-2 focus-visible:ring-[#10B981]/35"
                  />
                </div>
                <div>
                  <label
                    htmlFor="ca-phone"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Phone{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </label>
                  <input
                    id="ca-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-input bg-input-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-offset-background focus-visible:border-[#10B981]/40 focus-visible:ring-2 focus-visible:ring-[#10B981]/35"
                  />
                </div>
                <div>
                  <label
                    htmlFor="ca-areas"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Markets / areas you serve
                  </label>
                  <textarea
                    id="ca-areas"
                    name="areasServed"
                    required
                    rows={3}
                    placeholder="e.g. Greater London, Edinburgh, coastal Cornwall…"
                    value={areasServed}
                    onChange={(e) => setAreasServed(e.target.value)}
                    className="w-full resize-y rounded-xl border border-input bg-input-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-offset-background focus-visible:border-[#10B981]/40 focus-visible:ring-2 focus-visible:ring-[#10B981]/35"
                  />
                </div>
                <div>
                  <label
                    htmlFor="ca-listings"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Listings you co-host or manage today
                  </label>
                  <select
                    id="ca-listings"
                    name="listingsManaged"
                    required
                    value={listingsManaged}
                    onChange={(e) => setListingsManaged(e.target.value)}
                    className="w-full rounded-xl border border-input bg-input-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-offset-background focus-visible:border-[#10B981]/40 focus-visible:ring-2 focus-visible:ring-[#10B981]/35"
                  >
                    <option value="">Select…</option>
                    {LISTING_BANDS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="ca-url"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Portfolio or profile URL{" "}
                    <span className="font-normal text-muted-foreground">
                      (Airbnb, site, LinkedIn — optional but helps)
                    </span>
                  </label>
                  <input
                    id="ca-url"
                    name="portfolioUrl"
                    type="url"
                    inputMode="url"
                    placeholder="https://"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    className="w-full rounded-xl border border-input bg-input-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-offset-background focus-visible:border-[#10B981]/40 focus-visible:ring-2 focus-visible:ring-[#10B981]/35"
                  />
                </div>
                <div>
                  <label
                    htmlFor="ca-pitch"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Anything else we should know
                  </label>
                  <textarea
                    id="ca-pitch"
                    name="pitch"
                    rows={3}
                    placeholder="Services you offer, niche, team size…"
                    value={pitch}
                    onChange={(e) => setPitch(e.target.value)}
                    className="w-full resize-y rounded-xl border border-input bg-input-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-offset-background focus-visible:border-[#10B981]/40 focus-visible:ring-2 focus-visible:ring-[#10B981]/35"
                  />
                </div>
                <div className="flex gap-3 rounded-xl border border-border bg-muted/30 p-4">
                  <input
                    id="ca-consent"
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-input text-[#10B981] focus:ring-[#10B981]"
                  />
                  <label
                    htmlFor="ca-consent"
                    className="text-sm text-muted-foreground"
                  >
                    I agree to the{" "}
                    <Link
                      href="/privacy"
                      className="font-medium text-[#059669] underline-offset-2 hover:underline"
                    >
                      privacy policy
                    </Link>{" "}
                    and understand Revolve will use these details to review my
                    application.
                  </label>
                </div>
              </div>

              {status === "error" && errorMessage ? (
                <p
                  className="mt-4 text-sm text-red-600 dark:text-red-400"
                  role="alert"
                >
                  {errorMessage}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#10B981] py-4 text-base font-semibold text-white shadow-lg transition-colors hover:bg-[#059669] disabled:pointer-events-none disabled:opacity-60"
              >
                {status === "submitting" ? (
                  "Sending…"
                ) : (
                  <>
                    Submit application
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
              <p className="mt-4 text-center text-xs text-muted-foreground">
                Prefer email?{" "}
                <a
                  href="mailto:hello@revolvecohosts.com?subject=Co-host%20application"
                  className="font-medium text-[#059669] underline-offset-2 hover:underline"
                >
                  hello@revolvecohosts.com
                </a>
              </p>
            </form>
          )}
        </div>
      </section>

      <footer className="border-t border-border py-10 text-center text-sm text-muted-foreground">
        <p>&copy; 2026 Revolve Co-Hosts</p>
        <div className="mt-2 flex flex-wrap justify-center gap-4">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <Link href="/tools" className="hover:text-foreground">
            Host tools
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
        </div>
      </footer>
    </div>
  );
}
