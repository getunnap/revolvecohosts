import { NextResponse } from "next/server";

export function isProductionLike(): boolean {
  return process.env.NODE_ENV === "production";
}

function safePublicErrorMessage(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error ?? "");
  if (
    msg.includes("Supabase is not configured") ||
    msg.includes("NEXT_PUBLIC_SUPABASE_URL") ||
    msg.includes("SUPABASE_SERVICE_ROLE_KEY")
  ) {
    return "Server misconfiguration: database credentials are missing. Check Vercel env vars (Supabase URL and service role key).";
  }
  return "Something went wrong. Please try again later.";
}

/** Log server-side; return a safe client message in production. */
export function serverErrorResponse(
  status: number,
  clientMessage: string,
  error: unknown,
): NextResponse {
  console.error(clientMessage, error);
  const body = isProductionLike()
    ? { error: safePublicErrorMessage(error) }
    : {
        error: clientMessage,
        details:
          error instanceof Error ? error.message : String(error ?? "unknown"),
      };
  return NextResponse.json(body, { status });
}
