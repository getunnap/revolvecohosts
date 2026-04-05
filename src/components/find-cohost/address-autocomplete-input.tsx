"use client";

import { useEffect, useId, useRef } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onPlaceResolved?: (place: { formattedAddress: string; placeId?: string }) => void;
  disabled?: boolean;
};

declare global {
  interface Window {
    google?: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            opts?: {
              fields?: string[];
              componentRestrictions?: { country: string | string[] };
            },
          ) => {
            addListener: (
              event: string,
              fn: () => void,
            ) => { remove: () => void };
            getPlace: () => { formatted_address?: string; place_id?: string };
          };
        };
      };
    };
  }
}

const SCRIPT_ID = "revolve-google-maps-places";

export function AddressAutocompleteInput({
  value,
  onChange,
  onPlaceResolved,
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const listenerRef = useRef<{ remove?: () => void } | null>(null);
  const onChangeRef = useRef(onChange);
  const onPlaceRef = useRef(onPlaceResolved);
  onChangeRef.current = onChange;
  onPlaceRef.current = onPlaceResolved;
  const id = useId();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey || !inputRef.current || disabled) return;

    function attach() {
      const input = inputRef.current;
      if (!input || !window.google?.maps?.places?.Autocomplete) return;

      listenerRef.current?.remove?.();
      const ac = new window.google.maps.places.Autocomplete(input, {
        fields: ["formatted_address", "place_id", "address_components"],
        componentRestrictions: { country: ["gb"] },
      });
      const listener = ac.addListener("place_changed", () => {
        const p = ac.getPlace();
        const formatted = p.formatted_address?.trim() ?? "";
        if (formatted) {
          onChangeRef.current(formatted);
          onPlaceRef.current?.({ formattedAddress: formatted, placeId: p.place_id });
        }
      });
      listenerRef.current = { remove: () => listener.remove() };
    }

    if (window.google?.maps?.places) {
      attach();
      return () => listenerRef.current?.remove?.();
    }

    let existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!existing) {
      existing = document.createElement("script");
      existing.id = SCRIPT_ID;
      existing.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&loading=async&v=weekly`;
      existing.async = true;
      document.head.appendChild(existing);
    }

    const onLoad = () => attach();
    existing.addEventListener("load", onLoad);
    return () => {
      existing?.removeEventListener("load", onLoad);
      listenerRef.current?.remove?.();
    };
  }, [apiKey, disabled]);

  return (
    <div className="w-full">
      <label className="sr-only" htmlFor={id}>
        Property address
      </label>
      <input
        ref={inputRef}
        id={id}
        type="text"
        autoComplete="street-address"
        disabled={disabled}
        placeholder="Start typing your address…"
        className="min-h-[52px] w-full rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground outline-none ring-[#10B981] focus:ring-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {!apiKey ? (
        <p className="mt-2 text-xs text-muted-foreground">
          You can type your full address manually — suggestions are optional.
        </p>
      ) : null}
    </div>
  );
}
