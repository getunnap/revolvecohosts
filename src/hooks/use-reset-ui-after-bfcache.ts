"use client";

import { useEffect } from "react";

/**
 * After a full navigation away (e.g. Stripe Checkout) and Back, Chrome may restore
 * this page from bfcache with stale React state — often `loading` still true so buttons
 * stay disabled. Reset when the document is restored from cache.
 */
export function useResetUiAfterBfcache(
  setLoading: (value: boolean) => void,
  setError: (value: string | null) => void,
): void {
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        setLoading(false);
        setError(null);
      }
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [setLoading, setError]);
}
