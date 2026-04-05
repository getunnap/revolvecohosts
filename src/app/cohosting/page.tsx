import { redirect } from "next/navigation";

/** @deprecated Use /cohosts — kept for existing links */
export default function CohostingPage() {
  redirect("/cohosts");
}
