import { redirect } from "next/navigation";
import OperatorSignupForm from "./operator-signup-form";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function OperatorSignupPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/operator");
  }

  return <OperatorSignupForm />;
}
