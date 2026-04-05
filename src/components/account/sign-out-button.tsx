"use client";

import { type ReactNode, useState } from "react";

type SignOutButtonProps = {
  /** Where to send the browser after cookies are cleared */
  afterHref?: string;
  className?: string;
  children?: ReactNode;
};

export default function SignOutButton({
  afterHref = "/",
  className = "rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted/60",
  children = "Log out",
}: SignOutButtonProps) {
  const [busy, setBusy] = useState(false);

  async function onClick() {
    setBusy(true);
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } finally {
      window.location.href = afterHref;
    }
  }

  return (
    <button type="button" disabled={busy} onClick={() => void onClick()} className={className}>
      {busy ? "Signing out…" : children}
    </button>
  );
}
