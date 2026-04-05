import Link from "next/link";
import MarketingSiteHeader from "@/components/marketing/marketing-site-header";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingSiteHeader cta={{ href: "/tools", label: "Free tools" }} />
      <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center sm:py-32">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[#059669]">
          404
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-4 text-pretty text-muted-foreground">
          That link may be old or mistyped. Head back to tools or the home page to run an audit,
          matchmaking, or an income estimate.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-[#10B981] px-8 py-3.5 font-semibold text-white shadow-md transition-colors hover:bg-[#059669]"
          >
            Home
          </Link>
          <Link
            href="/tools"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-8 py-3.5 font-semibold text-foreground transition-colors hover:bg-muted/50"
          >
            Host tools
          </Link>
        </div>
      </main>
    </div>
  );
}
