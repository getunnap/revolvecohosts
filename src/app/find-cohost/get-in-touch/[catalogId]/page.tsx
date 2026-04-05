import GetInTouchClient from "@/components/find-cohost/get-in-touch-client";
import type { Metadata } from "next";

type Props = { params: Promise<{ catalogId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { catalogId } = await params;
  return {
    title: `Get in touch · ${catalogId}`,
    description: "Submit your intro request to a matched co-host on Revolve Co-Hosts.",
  };
}

export default async function GetInTouchPage({ params }: Props) {
  const { catalogId } = await params;
  return <GetInTouchClient catalogId={catalogId} />;
}
