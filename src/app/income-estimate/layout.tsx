import MarketingSiteHeader from "@/components/marketing/marketing-site-header";

export default function IncomeEstimateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <MarketingSiteHeader />
      {children}
    </div>
  );
}
