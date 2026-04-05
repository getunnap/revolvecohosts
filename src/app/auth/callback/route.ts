import { safeAuthRedirectPath } from "@/lib/auth-redirect";
import {
  readPortalIntentFromMetadata,
  REVOLVE_PORTAL_META_KEY,
} from "@/lib/revolve-portal";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * OAuth / magic-link callback. Session cookies MUST be applied to the same
 * NextResponse as the redirect; using cookies() from next/headers here often
 * does not attach Set-Cookie to the redirect, so the browser keeps the old user.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeAuthRedirectPath(searchParams.get("next"));
  const portalParam = searchParams.get("portal");
  const destination = `${origin}${next ?? "/"}`;

  if (!code) {
    return NextResponse.redirect(destination);
  }

  const response = NextResponse.redirect(destination);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
          Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
        },
      },
    },
  );

  const { data: exchangeData, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const login = new URL("/login", origin);
    login.searchParams.set("error", "auth_callback");
    return NextResponse.redirect(login);
  }

  const user = exchangeData?.session?.user;
  if (
    user &&
    (portalParam === "cohost" || portalParam === "host") &&
    !readPortalIntentFromMetadata(user.user_metadata as Record<string, unknown>)
  ) {
    await supabase.auth.updateUser({
      data: { [REVOLVE_PORTAL_META_KEY]: portalParam },
    });
  }

  return response;
}
