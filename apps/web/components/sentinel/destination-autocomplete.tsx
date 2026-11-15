"use client";

import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { getMapsLoader } from "@/lib/maps/loader";

interface DestinationAutocompleteProps {
  value: string;
  onChange: (name: string, lat?: number, lng?: number) => void;
  placeholder?: string;
  required?: boolean;
  id?: string;
  className?: string;
}

export function DestinationAutocomplete({
  value,
  onChange,
  placeholder = "e.g., Central Metro Station, Office, Home",
  required,
  id = "destination",
  className,
}: DestinationAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const hasApiKey = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

  useEffect(() => {
    if (!hasApiKey || !inputRef.current) return;

    let isMounted = true;

    async function initAutocomplete() {
      try {
        const placesLib = (await getMapsLoader().importLibrary("places")) as google.maps.PlacesLibrary;
        if (!isMounted || !inputRef.current) return;

        const autocomplete = new placesLib.Autocomplete(inputRef.current, {
          fields: ["geometry", "name", "formatted_address"],
        });
        autocompleteRef.current = autocomplete;

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place || !place.geometry?.location) {
            if (inputRef.current) {
              onChange(inputRef.current.value);
            }
            return;
          }

          const name = place.name || place.formatted_address || "";
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          onChange(name, lat, lng);
        });
      } catch (err) {
        console.warn("Google Places Autocomplete initialization skipped:", err);
      }
    }

    initAutocomplete();

    return () => {
      isMounted = false;
      if (autocompleteRef.current && typeof window !== "undefined" && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [hasApiKey, onChange]);

  return (
    <Input
      ref={inputRef}
      id={id}
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className={className}
      autoComplete={hasApiKey ? "off" : undefined}
    />
  );
}
