import AccountSignInPreference from "@/components/account/account-sign-in-preference";
import SignOutButton from "@/components/account/sign-out-button";
import OperatorPortalShell from "@/components/operator/operator-portal-shell";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function OperatorAccountSettingsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?as=cohost");
  }

  return (
    <OperatorPortalShell email={user.email ?? ""}>
      <div className="border-b border-border/80 bg-gradient-to-br from-[#10B981]/[0.07] via-background to-background px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-medium text-[#059669]">Co-host portal</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Account settings
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage how you stay signed in and your password.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <section>
          <h2 className="text-base font-semibold text-foreground">Your account</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{user.email}</span>
          </p>
          <Link
            href="/operator"
            className="mt-3 inline-block text-sm font-semibold text-[#059669] underline-offset-4 hover:underline"
          >
            Back to portal home
          </Link>
        </section>

        <AccountSignInPreference />

        <section className="rounded-xl border border-border/80 bg-muted/10 p-5">
          <h2 className="text-base font-semibold text-foreground">Password</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Update the password for this email address.
          </p>
          <Link
            href="/auth/update-password?next=%2Foperator%2Fsettings"
            className="mt-4 inline-flex rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50"
          >
            Change password
          </Link>
        </section>

        <section className="rounded-xl border border-border/80 bg-muted/10 p-5">
          <h2 className="text-base font-semibold text-foreground">Session</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign out on this browser. You can sign in again anytime.
          </p>
          <div className="mt-4">
            <SignOutButton afterHref="/login?as=cohost" />
          </div>
        </section>
      </div>
    </OperatorPortalShell>
  );
}
