"use client";

import {
  readKeepSignedInPreference,
  writeKeepSignedInPreference,
} from "@/lib/auth-sign-in-preference";
import { useEffect, useState } from "react";

const labelClass = "text-sm font-medium text-foreground";
const boxClass =
  "mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3";

export default function AccountSignInPreference() {
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  /* Hydrate from localStorage after mount (no access during SSR). */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional post-hydration read
    setKeepSignedIn(readKeepSignedInPreference());
  }, []);

  function onChange(checked: boolean) {
    setKeepSignedIn(checked);
    writeKeepSignedInPreference(checked);
  }

  return (
    <section className="rounded-xl border border-border/80 bg-muted/10 p-5">
      <h2 className="text-base font-semibold text-foreground">Sign-in on this device</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        This controls the default for the &quot;Keep me signed in&quot; option on the sign-in page.
        Always sign out when using a shared computer.
      </p>
      <label className={boxClass}>
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-[#10B981] focus:ring-[#10B981]"
          checked={keepSignedIn}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>
          <span className={labelClass}>Prefer staying signed in</span>
          <span className="mt-0.5 block text-sm text-muted-foreground">
            When enabled, we default to keeping your session on this browser after you sign in.
          </span>
        </span>
      </label>
    </section>
  );
}
