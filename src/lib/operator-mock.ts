/** Demo data for the operator hub UI until real credits and leads are wired up. */

export const OPERATOR_EXAMPLE_LEAD_ID = "example";

export type OperatorLeadRow = {
  id: string;
  hostLabel: string;
  area: string;
  propertySummary: string;
  listingStage: string;
  guestProfile: string;
  intent: string;
  receivedLabel: string;
  isDemo?: boolean;
};

export const OPERATOR_DEMO_LEADS: OperatorLeadRow[] = [
  {
    id: OPERATOR_EXAMPLE_LEAD_ID,
    hostLabel: "Host (Cornwall)",
    area: "Cornwall · coastal",
    propertySummary: "2-bed cottage · live Airbnb",
    listingStage: "Live · 18 months",
    guestProfile: "Families & weekend breaks",
    intent: "Co-host for ops + guest comms; host travels often",
    receivedLabel: "Sample preview",
    isDemo: true,
  },
];

export function getOperatorLeadById(id: string): OperatorLeadRow | undefined {
  return OPERATOR_DEMO_LEADS.find((l) => l.id === id);
}
