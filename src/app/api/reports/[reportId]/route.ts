import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reportId: string }> },
) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const { reportId } = await params;
  const reportRes = await supabase
    .from("reports")
    .select("id, free_report_json, stripe_payment_status, status, created_at")
    .eq("id", reportId)
    .eq("user_id", user.id)
    .single();

  if (reportRes.error || !reportRes.data) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  return NextResponse.json({ report: reportRes.data });
}
