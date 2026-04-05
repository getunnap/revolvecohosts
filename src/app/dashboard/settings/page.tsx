import AccountSignInPreference from "@/components/account/account-sign-in-preference";
import SignOutButton from "@/components/account/sign-out-button";
import HostAccountChrome from "@/components/host/host-account-chrome";
import HostPageHero from "@/components/host/host-page-hero";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function HostAccountSettingsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect(`/login?next=${encodeURIComponent("/dashboard/settings")}`);
  }

  return (
    <HostAccountChrome email={user.email}>
      <HostPageHero
        eyebrow="Account"
        title="Settings"
        description="Manage how you stay signed in and your password. You remain logged in across host tools until you sign out."
      />

      <div className="space-y-8 rounded-2xl border border-border/80 bg-card/90 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        <section>
          <h2 className="text-base font-semibold text-foreground">Your account</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{user.email}</span>
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50"
            >
              Back to overview
            </Link>
            <Link
              href="/host/intros"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50"
            >
              Intro requests
            </Link>
          </div>
        </section>

        <AccountSignInPreference />

        <section className="rounded-xl border border-border/80 bg-muted/10 p-5">
          <h2 className="text-base font-semibold text-foreground">Password</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Update the password for this email address.
          </p>
          <Link
            href="/auth/update-password?next=%2Fdashboard%2Fsettings"
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
            <SignOutButton afterHref="/login" />
          </div>
        </section>
      </div>
    </HostAccountChrome>
  );
}
