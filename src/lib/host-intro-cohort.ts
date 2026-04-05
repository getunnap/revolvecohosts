import { HOST_INTRO_COHORT_KEY } from "@/lib/client-storage";

export function getOrCreateHostIntroCohortId(): string {
  if (typeof window === "undefined") {
    return "";
  }
  try {
    const existing = sessionStorage.getItem(HOST_INTRO_COHORT_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem(HOST_INTRO_COHORT_KEY, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

/** New mock match batch: next intro requests group under a fresh cohort id */
export function startNewHostIntroCohortId(): string {
  if (typeof window === "undefined") {
    return "";
  }
  try {
    const id = crypto.randomUUID();
    sessionStorage.setItem(HOST_INTRO_COHORT_KEY, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}
