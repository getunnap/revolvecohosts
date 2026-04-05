/** localStorage key: whether the user wants “keep me signed in” as the default on the sign-in form */
export const KEEP_SIGNED_IN_STORAGE_KEY = "revolve_keep_signed_in";

export function readKeepSignedInPreference(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(KEEP_SIGNED_IN_STORAGE_KEY);
    if (raw === "0" || raw === "false") return false;
    return true;
  } catch {
    return true;
  }
}

export function writeKeepSignedInPreference(value: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEEP_SIGNED_IN_STORAGE_KEY, value ? "1" : "0");
  } catch {
    /* ignore quota / private mode */
  }
}
