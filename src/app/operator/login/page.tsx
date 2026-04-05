import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function OperatorLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/operator");
  }

  const sp = await searchParams;
  const q = new URLSearchParams();
  q.set("as", "cohost");
  const n = sp.next?.trim();
  if (n && n.startsWith("/") && !n.startsWith("//")) {
    q.set("next", n);
  }
  redirect(`/login?${q.toString()}`);
}
