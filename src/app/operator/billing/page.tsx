import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react";
import OperatorPackCheckoutButton from "@/components/operator/operator-pack-checkout-buttons";
import OperatorSubscriptionCheckoutButton from "@/components/operator/operator-subscription-checkout-button";
import OperatorPortalShell from "@/components/operator/operator-portal-shell";
import { formatBillDate, getNextMonthlyBillDate } from "@/lib/operator-billing-dates";
import {
  formatGbpWhole,
  operatorPackTotalGbp,
  OPERATOR_FREE_INTRO_CREDITS,
  OPERATOR_INTRO_PRICE_GBP,
} from "@/lib/operator-intro-pricing";
import { ensureOperatorProfileRow } from "@/lib/operator/ensure-operator-row";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Billing & credits",
  description: `Co-host billing: ${OPERATOR_FREE_INTRO_CREDITS} free intros when you join, then ${formatGbpWhole(OPERATOR_INTRO_PRICE_GBP)} per intro — monthly plan, top-ups, and upcoming charges.`,
};

function CheckoutButton({
  href,
  children,
  disabled,
}: {
  href: string | undefined;
  children: ReactNode;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <span className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 px-5 py-3 text-sm font-semibold text-muted-foreground">
        {children}
      </span>
    );
  }
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center rounded-xl bg-[#10B981] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#059669]"
      >
        {children}
      </a>
    );
  }
  return (
    <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3 text-center text-sm text-muted-foreground">
      Checkout link not configured yet.
    </p>
  );
}

export default async function OperatorBillingPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?as=cohost&next=${encodeURIComponent("/operator/billing")}`);
  }

  await ensureOperatorProfileRow(supabase, user);

  const { data: opRow } = await supabase
    .from("cohost_operators")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle();

  const billingUnlocked = opRow?.status === "approved";

  const monthlyUrl = process.env.STRIPE_PAYMENT_LINK_OPERATOR_MONTHLY?.trim();
  const pack5Url = process.env.STRIPE_PAYMENT_LINK_OPERATOR_PACK_5?.trim();
  const pack10Url = process.env.STRIPE_PAYMENT_LINK_OPERATOR_PACK_10?.trim();
  const hasAnyLink = Boolean(monthlyUrl || pack5Url || pack10Url);

  const oneOffIntroProduct = process.env.STRIPE_PRODUCT_OPERATOR_INTRO_ONE_OFF?.trim();
  const pricePack5 = process.env.STRIPE_PRICE_OPERATOR_PACK_5_INTROS?.trim();
  const pricePack10 = process.env.STRIPE_PRICE_OPERATOR_PACK_10_INTROS?.trim();
  const pricePack25 = process.env.STRIPE_PRICE_OPERATOR_PACK_25_INTROS?.trim();

  const canCheckoutPack5 = Boolean(oneOffIntroProduct || pricePack5);
  const canCheckoutPack10 = Boolean(oneOffIntroProduct || pricePack10);
  const canCheckoutPack25 = Boolean(oneOffIntroProduct || pricePack25);
  const hasApiPackCheckout =
    canCheckoutPack5 || canCheckoutPack10 || canCheckoutPack25;

  const subProduct5 = process.env.STRIPE_PRODUCT_OPERATOR_SUBSCRIPTION_5_INTROS_MONTHLY?.trim();
  const subProduct10 = process.env.STRIPE_PRODUCT_OPERATOR_SUBSCRIPTION_10_INTROS_MONTHLY?.trim();
  const subProduct25 = process.env.STRIPE_PRODUCT_OPERATOR_SUBSCRIPTION_25_INTROS_MONTHLY?.trim();
  const hasApiMonthlyCheckout = Boolean(subProduct5 || subProduct10 || subProduct25);

  const nextMonthly = getNextMonthlyBillDate();
  const nextMonthlyLabel = formatBillDate(nextMonthly);

  // Until Stripe Customer API + DB sync: show structure with placeholders.
  const hasMonthlyPlan = false;
  const monthlyAmountLabel = "—";

  return (
    <OperatorPortalShell email={user.email ?? ""}>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/operator"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#059669] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to portal
        </Link>

        <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Billing & credits
        </h1>

        {!billingUnlocked && opRow?.status === "pending_review" ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/35 dark:text-amber-100">
            <strong className="font-semibold text-foreground">Purchases unlock after approval.</strong>{" "}
            Complete your{" "}
            <Link href="/operator/verify" className="font-semibold text-[#059669] underline-offset-2 hover:underline">
              verification profile
            </Link>{" "}
            and wait for our team to approve your operator account. Stripe checkout is disabled until
            then so you are not charged before you can receive intros.
          </div>
        ) : null}
        {!billingUnlocked && opRow?.status === "suspended" ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950 dark:border-red-900/50 dark:bg-red-950/35 dark:text-red-100">
            Billing is paused while your account is suspended. Contact hello@revolvecohosts.com for
            next steps.
          </div>
        ) : null}

        <ul className="mt-4 space-y-2 rounded-xl border border-border/80 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="font-medium text-foreground">Starter:</span>
            Your first{" "}
            <strong className="font-semibold text-foreground">{OPERATOR_FREE_INTRO_CREDITS} intros</strong> are{" "}
            <strong className="font-semibold text-foreground">free</strong>. After that, each paid intro is{" "}
            <strong className="font-semibold text-foreground">{formatGbpWhole(OPERATOR_INTRO_PRICE_GBP)}</strong>.
          </li>
          <li className="flex gap-2">
            <span className="font-medium text-foreground">Monthly plan:</span>
            Billed on the <strong className="font-semibold text-foreground">1st of each month</strong>
            . Credits from your allowance follow that cycle.
          </li>
          <li className="flex gap-2">
            <span className="font-medium text-foreground">Top-ups:</span>
            Charged <strong className="font-semibold text-foreground">immediately</strong> when you
            complete checkout — nothing scheduled for the 1st.
          </li>
        </ul>

        {!hasAnyLink ? (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
            Some checkout shortcuts are not available yet. Use the buttons below to buy credits or
            subscribe, or contact{" "}
            <a
              href="mailto:hello@revolvecohosts.com"
              className="font-semibold text-[#059669] underline-offset-2 hover:underline"
            >
              hello@revolvecohosts.com
            </a>{" "}
            if you need help.
          </p>
        ) : null}

        {/* Billing overview — upcoming */}
        <section
          id="billing-overview"
          className="scroll-mt-24 mt-10 rounded-2xl border border-border/80 bg-card p-6 shadow-sm"
          aria-labelledby="billing-overview-heading"
        >
          <div className="mb-4 flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-[#059669]" aria-hidden />
            <h2 id="billing-overview-heading" className="text-lg font-semibold text-foreground">
              Upcoming charges
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Scheduled payments only — top-ups you already paid will not appear here.
          </p>

          <div className="mt-4 overflow-hidden rounded-xl border border-border/70 bg-card">
            {hasMonthlyPlan ? (
              <div className="flex flex-col gap-3 border-b border-border/70 px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-foreground">Monthly intro plan</p>
                  <p className="text-sm text-muted-foreground">Recurring · charged on the 1st</p>
                </div>
                <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 text-sm">
                  <div>
                    <span className="text-muted-foreground">Next charge</span>
                    <p className="font-medium text-foreground">{nextMonthlyLabel}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Amount</span>
                    <p className="font-medium text-foreground">{monthlyAmountLabel}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                <p>
                  No monthly subscription on file yet. When you subscribe, your next charge on the{" "}
                  <strong className="font-medium text-foreground">1st of the month</strong> will
                  appear here.
                </p>
                <p className="mt-3 text-xs">
                  Example next 1st billing date:{" "}
                  <strong className="font-medium text-foreground">{nextMonthlyLabel}</strong>
                </p>
              </div>
            )}
          </div>

          <h3 className="mt-8 text-sm font-semibold text-foreground">Recent billing</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Instant top-ups and past monthly invoices will list here after your first paid invoice.
          </p>
          <div className="mt-3 rounded-xl border border-dashed border-border bg-muted/15 px-4 py-6 text-center text-sm text-muted-foreground">
            No invoice history to show yet.
          </div>
        </section>

        {/* Change monthly plan */}
        <section
          id="change-monthly-plan"
          className="scroll-mt-24 mt-10 rounded-2xl border border-border/80 bg-card p-6 shadow-sm"
          aria-labelledby="change-monthly-heading"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10">
            <RefreshCw className="h-5 w-5 text-[#059669]" aria-hidden />
          </div>
          <h2 id="change-monthly-heading" className="text-lg font-semibold text-foreground">
            Monthly plan
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Start, switch, or replace your subscription. Billing always runs on the{" "}
            <strong className="font-medium text-foreground">1st</strong> of the month.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <CheckoutButton
              href={monthlyUrl}
              disabled={!billingUnlocked}
            >
              {billingUnlocked
                ? hasMonthlyPlan
                  ? "Change plan"
                  : "Subscribe monthly"
                : "Available after approval"}
            </CheckoutButton>
            {hasMonthlyPlan ? (
              <span className="text-xs text-muted-foreground">
                To cancel a subscription, use the link in your payment receipt or billing portal.
              </span>
            ) : null}
          </div>

          {hasApiMonthlyCheckout ? (
            <div className="mt-6">
              <p className="mb-3 text-sm font-medium text-foreground">Or subscribe here</p>
              <p className="mb-4 text-xs text-muted-foreground">
                Credits from your monthly allowance are added automatically after each successful payment.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {subProduct5 ? (
                  <OperatorSubscriptionCheckoutButton
                    monthlyIntros={5}
                    label="5 intros / month"
                    disabled={!billingUnlocked}
                  />
                ) : null}
                {subProduct10 ? (
                  <OperatorSubscriptionCheckoutButton
                    monthlyIntros={10}
                    label="10 intros / month"
                    disabled={!billingUnlocked}
                  />
                ) : null}
                {subProduct25 ? (
                  <OperatorSubscriptionCheckoutButton
                    monthlyIntros={25}
                    label="25 intros / month"
                    disabled={!billingUnlocked}
                  />
                ) : null}
              </div>
            </div>
          ) : null}
        </section>

        {/* Top-up */}
        <section
          id="top-up-credits"
          className="scroll-mt-24 mt-10"
          aria-labelledby="top-up-credits-heading"
        >
          <div className="mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-600 dark:text-amber-500" aria-hidden />
            <h2 id="top-up-credits-heading" className="text-lg font-semibold text-foreground">
              Top up (instant charge)
            </h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            One-time packs — you pay now, credits add as soon as payment succeeds.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                <Sparkles className="h-5 w-5 text-amber-700 dark:text-amber-500" aria-hidden />
              </div>
              <h3 className="font-semibold text-foreground">5 intros</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">
                {formatGbpWhole(operatorPackTotalGbp(5))} · smaller pack
              </p>
              <div className="mt-5">
                {hasApiPackCheckout && canCheckoutPack5 ? (
                  <OperatorPackCheckoutButton
                    packIntros={5}
                    label="Buy 5 credits"
                    disabled={!billingUnlocked}
                  />
                ) : (
                  <CheckoutButton href={pack5Url} disabled={!billingUnlocked}>
                    {billingUnlocked ? "Buy 5 credits" : "Available after approval"}
                  </CheckoutButton>
                )}
              </div>
            </div>
            <div className="flex flex-col rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                <Sparkles className="h-5 w-5 text-amber-700 dark:text-amber-500" aria-hidden />
              </div>
              <h3 className="font-semibold text-foreground">10 intros</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">
                {formatGbpWhole(operatorPackTotalGbp(10))} · larger pack
              </p>
              <div className="mt-5">
                {hasApiPackCheckout && canCheckoutPack10 ? (
                  <OperatorPackCheckoutButton
                    packIntros={10}
                    label="Buy 10 credits"
                    disabled={!billingUnlocked}
                  />
                ) : (
                  <CheckoutButton href={pack10Url} disabled={!billingUnlocked}>
                    {billingUnlocked ? "Buy 10 credits" : "Available after approval"}
                  </CheckoutButton>
                )}
              </div>
            </div>
            <div className="flex flex-col rounded-2xl border border-border/80 bg-card p-6 shadow-sm sm:col-span-2 lg:col-span-1">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                <Sparkles className="h-5 w-5 text-amber-700 dark:text-amber-500" aria-hidden />
              </div>
              <h3 className="font-semibold text-foreground">25 intros</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">
                {formatGbpWhole(operatorPackTotalGbp(25))} · volume pack
              </p>
              <div className="mt-5">
                {hasApiPackCheckout && canCheckoutPack25 ? (
                  <OperatorPackCheckoutButton
                    packIntros={25}
                    label="Buy 25 credits"
                    disabled={!billingUnlocked}
                  />
                ) : (
                  <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3 text-center text-sm text-muted-foreground">
                    The 25-credit pack is not available online yet. Email{" "}
                    <a
                      href="mailto:hello@revolvecohosts.com?subject=25%20intro%20pack"
                      className="font-semibold text-[#059669] underline-offset-2 hover:underline"
                    >
                      hello@revolvecohosts.com
                    </a>{" "}
                    for volume purchases.
                  </p>
                )}
              </div>
            </div>
          </div>
          {hasApiPackCheckout ? (
            <p className="mt-4 text-xs text-muted-foreground">
              Card payments usually credit your account within a few minutes. If anything looks wrong
              after paying, contact{" "}
              <a
                href="mailto:hello@revolvecohosts.com"
                className="font-medium text-[#059669] underline-offset-2 hover:underline"
              >
                hello@revolvecohosts.com
              </a>
              .
            </p>
          ) : null}
        </section>
      </div>
    </OperatorPortalShell>
  );
}
