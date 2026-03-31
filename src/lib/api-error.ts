import { NextResponse } from "next/server";

export function isProductionLike(): boolean {
  return process.env.NODE_ENV === "production";
}

/** Log server-side; return a safe client message in production. */
export function serverErrorResponse(
  status: number,
  clientMessage: string,
  error: unknown,
): NextResponse {
  console.error(clientMessage, error);
  const body = isProductionLike()
    ? { error: "Something went wrong. Please try again later." }
    : {
        error: clientMessage,
        details:
          error instanceof Error ? error.message : String(error ?? "unknown"),
      };
  return NextResponse.json(body, { status });
}
