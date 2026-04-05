import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BarChart3 } from "lucide-react";
import IncomeEstimateFunnel from "@/components/income-estimate/income-estimate-funnel";

export const metadata: Metadata = {
  title: "Income estimate",
  description:
    "Project 12-month short-let gross from your property, availability, and market bands — then see co-host matches.",
};

export default function IncomeEstimatePage() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="border-b border-border/70 bg-muted/20 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-lg items-center gap-3 sm:max-w-6xl">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Tools
          </Link>
          <span className="text-border">|</span>
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <BarChart3 className="h-4 w-4 text-[#10B981]" aria-hidden />
            Income estimate
          </div>
        </div>
      </div>
      <IncomeEstimateFunnel />
    </main>
  );
}
