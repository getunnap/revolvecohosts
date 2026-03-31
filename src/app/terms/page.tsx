import Link from "next/link";

export const metadata = {
  title: "Terms of Service | Revolve Co-Hosts",
  description: "Terms for using the Revolve Co-Hosts listing audit tool.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background px-4 sm:px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          href="/"
          className="text-sm font-medium text-[#10B981] hover:underline inline-block"
        >
          ← Back to home
        </Link>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Terms of service</h1>
          <p className="text-sm text-muted-foreground">Last updated: March 2026</p>
        </div>
        <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <p className="text-foreground/90">
            These terms govern use of the Revolve Co-Hosts Airbnb listing audit tool (“Service”).
            By using the Service you agree to them. They are not legal advice; obtain your own
            counsel if you need certainty.
          </p>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">The service</h2>
            <p>
              We provide AI-assisted listing analysis, previews, and optional paid full reports
              based on information you supply (such as your listing URL and guest description).
              Output is indicative and depends on the quality and completeness of your inputs. We do
              not guarantee specific revenue, ranking, or booking outcomes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Accounts and guests</h2>
            <p>
              You may use the Service as a guest (email + listing details) without a long-lived
              account. Where sign-in exists, you are responsible for keeping credentials secure.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Payments and refunds</h2>
            <p>
              Paid reports are billed as one-off purchases through Stripe. Pricing shown at checkout
              applies. Refunds follow the refund policy stated at purchase (for example a standard
              one-off refund window where offered). Chargebacks and abuse may lead to suspension of
              access.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Acceptable use</h2>
            <p>
              You may not misuse the Service, including probing or bypassing rate limits, submitting
              unlawful content, or attempting to access others’ data. We may suspend or terminate use
              where necessary.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Intellectual property</h2>
            <p>
              You retain rights to content you submit. We grant you a licence to use report output
              for your own listing and business purposes. You may not resell automated access to the
              Service or systematically scrape it.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Disclaimer and liability</h2>
            <p>
              The Service is provided “as is”. To the maximum extent permitted by law, we exclude
              implied warranties and limit liability for indirect or consequential loss. Nothing
              excludes liability that cannot be limited under applicable law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Changes</h2>
            <p>
              We may update these terms or the Service. Material changes will be reflected in the
              “Last updated” date above; continued use after changes constitutes acceptance where
              permitted by law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Contact</h2>
            <p>
              <a
                href="mailto:hello@revolvecohosts.com"
                className="text-[#10B981] font-medium hover:underline"
              >
                hello@revolvecohosts.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
