import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Revolve Co-Hosts",
  description: "How we collect, use, and store data for the listing audit tool.",
};

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Privacy policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: March 2026</p>
        </div>
        <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <p className="text-foreground/90">
            This policy describes how Revolve Co-Hosts (“we”, “us”) handles information when you use
            our Airbnb listing audit tool at our website. It is a summary for transparency; have it
            reviewed by your legal advisers if you rely on it for compliance.
          </p>

          <section className="space-y-3" id="what-we-collect">
            <h2 className="text-lg font-semibold text-foreground">What we collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-foreground">Listing and audit inputs:</strong> Airbnb listing
                URL, how you describe your ideal guests, and any optional listing text you provide.
              </li>
              <li>
                <strong className="text-foreground">Contact:</strong> email address you submit so we can
                send your report and related messages.
              </li>
              <li>
                <strong className="text-foreground">Identifiers we create:</strong> internal report and
                session identifiers stored with your intake record to link preview, payment, and
                delivery.
              </li>
              <li>
                <strong className="text-foreground">Payment data:</strong> handled by Stripe. We do not
                store full card numbers on our servers; Stripe provides payment status and transaction
                references as needed to fulfil your purchase.
              </li>
              <li>
                <strong className="text-foreground">Generated reports:</strong> free and paid report
                content we create and store so you can retrieve it after checkout where applicable.
              </li>
              <li>
                <strong className="text-foreground">Technical data:</strong> standard server and host
                logs (for example from Vercel) may include IP address, user agent, and timestamps for
                security and abuse prevention (such as rate limiting on free previews).
              </li>
            </ul>
          </section>

          <section className="space-y-3" id="security">
            <h2 className="text-lg font-semibold text-foreground">How we use and protect data</h2>
            <p>
              We use this information to generate and email your audit, process one-off payments,
              prevent abuse, improve reliability, and meet legal obligations. We do not sell your
              personal data.
            </p>
          </section>

          <section className="space-y-3" id="processors">
            <h2 className="text-lg font-semibold text-foreground">Who we share with</h2>
            <p>We use service providers as processors, including for example:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Supabase (database and related infrastructure)</li>
              <li>Stripe (payments)</li>
              <li>OpenAI (report generation)</li>
              <li>Resend (transactional email), when enabled</li>
              <li>Vercel (hosting)</li>
            </ul>
            <p>
              Those providers process data under their own terms and privacy policies; we configure
              them to support the service only.
            </p>
          </section>

          <section className="space-y-3" id="retention">
            <h2 className="text-lg font-semibold text-foreground">Retention</h2>
            <p>
              We keep guest intake and report records for as long as needed to provide the service,
              resolve disputes, and meet legal and accounting requirements. You can ask us to delete
              or export data subject to those constraints using the contact below.
            </p>
          </section>

          <section className="space-y-3" id="cookies">
            <h2 className="text-lg font-semibold text-foreground">Cookies and storage</h2>
            <p>
              The tool may use browser storage (for example session or local storage) to keep your
              place in the audit flow on your device. We do not use third-party advertising cookies
              for this product by default. If we add analytics cookies later, we will update this
              policy.
            </p>
          </section>

          <section className="space-y-3" id="rights">
            <h2 className="text-lg font-semibold text-foreground">Your rights</h2>
            <p>
              Depending on where you live (including the UK and EEA), you may have rights to access,
              correct, delete, or restrict processing of your personal data, and to object to certain
              processing or lodge a complaint with a supervisory authority. Contact us to exercise
              these rights.
            </p>
          </section>

          <section className="space-y-3" id="contact">
            <h2 className="text-lg font-semibold text-foreground">Contact</h2>
            <p>
              Questions about this policy or your data:{" "}
              <a
                href="mailto:hello@revolvecohosts.com"
                className="text-[#10B981] font-medium hover:underline"
              >
                hello@revolvecohosts.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
