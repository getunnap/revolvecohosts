"use server";

import { isOperatorVerificationProfileComplete } from "@/lib/operator/operator-verification";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type VerifyFormState = { ok: true } | { ok: false; error: string };

export async function submitOperatorVerification(
  _prev: VerifyFormState | undefined,
  formData: FormData,
): Promise<VerifyFormState> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return { ok: false, error: "You need to be signed in." };
  }

  const { data: row } = await supabase
    .from("cohost_operators")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (row?.status === "suspended") {
    return { ok: false, error: "Your account cannot be updated while suspended. Contact support." };
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const areasServed = String(formData.get("areasServed") ?? "").trim();
  const listingsManaged = String(formData.get("listingsManaged") ?? "").trim();
  const portfolioUrl = String(formData.get("portfolioUrl") ?? "").trim();
  const pitch = String(formData.get("pitch") ?? "").trim();

  if (!fullName || fullName.length > 200) {
    return { ok: false, error: "Please enter your full name." };
  }
  if (!areasServed || areasServed.length < 3 || areasServed.length > 4000) {
    return { ok: false, error: "Please describe the markets or areas you serve." };
  }
  if (!listingsManaged || listingsManaged.length > 64) {
    return { ok: false, error: "Please select how many listings you co-host or manage." };
  }
  if (phone.length > 40) {
    return { ok: false, error: "Phone number is too long." };
  }
  if (portfolioUrl.length > 2000) {
    return { ok: false, error: "Portfolio URL is too long." };
  }
  if (pitch.length > 4000) {
    return { ok: false, error: "Notes are too long." };
  }

  let urlToStore: string | null = null;
  if (portfolioUrl) {
    try {
      urlToStore = new URL(portfolioUrl).toString();
    } catch {
      return { ok: false, error: "Portfolio URL must be a valid http(s) link." };
    }
  }

  if (
    !isOperatorVerificationProfileComplete(areasServed, listingsManaged)
  ) {
    return { ok: false, error: "Please complete areas served and listings managed." };
  }

  const { error } = await supabase
    .from("cohost_operators")
    .update({
      full_name: fullName,
      phone: phone || null,
      areas_served: areasServed,
      listings_managed: listingsManaged,
      portfolio_url: urlToStore,
      pitch: pitch || null,
    })
    .eq("user_id", user.id);

  if (error) {
    console.error("submitOperatorVerification", error);
    return { ok: false, error: "Could not save. Try again or contact support." };
  }

  revalidatePath("/operator");
  revalidatePath("/operator/verify");
  revalidatePath("/operator/billing");
  return { ok: true };
}
