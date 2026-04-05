import type { ReactNode } from "react";
import OperatorPortalHeader from "@/components/operator/operator-portal-header";

export default function OperatorPortalShell({
  email,
  children,
}: {
  email: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <OperatorPortalHeader email={email} />
      {children}
    </div>
  );
}
