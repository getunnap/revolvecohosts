/** Allowlisted post-login paths (same-origin relative only). */
export function safeAuthRedirectPath(next: string | null): string | null {
  if (!next || typeof next !== "string") return null;
  const t = next.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return null;
  if (t.includes("://") || t.includes("\\")) return null;
  if (t.includes("@")) return null;
  return t;
}
