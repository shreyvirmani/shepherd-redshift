"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";

interface DestinationAutocompleteProps {
  value: string;
  onChange: (name: string, lat?: number, lng?: number) => void;
  placeholder?: string;
  required?: boolean;
  id?: string;
  className?: string;
}

interface NominatimPlace {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
}

export function DestinationAutocomplete({
  value,
  onChange,
  placeholder = "e.g., Central Metro Station, Office, Home",
  required,
  id = "destination",
  className,
}: DestinationAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState<NominatimPlace[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
      const res = await fetch(url, {
        headers: {
          "Accept-Language": "en",
        },
      });
      if (res.ok) {
        const data: NominatimPlace[] = await res.json();
        setSuggestions(data);
        setIsOpen(data.length > 0);
      }
    } catch {
      // Gracefully fall back to plain input on network glitch
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (text: string) => {
    onChange(text);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(text);
    }, 350);
  };

  const handleSelectPlace = (place: NominatimPlace) => {
    const cleanName = place.display_name.split(",")[0] || place.display_name;
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    onChange(place.display_name, lat, lng);
    setIsOpen(false);
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Input
          id={id}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          required={required}
          className={className}
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute right-2.5 top-2.5 flex items-center justify-center text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-md">
          {suggestions.map((item) => (
            <li
              key={item.place_id}
              onClick={() => handleSelectPlace(item)}
              className="flex cursor-pointer items-start gap-2 rounded-md px-2.5 py-1.5 text-xs text-popover-foreground transition-colors hover:bg-muted"
            >
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" />
              <div className="flex flex-col overflow-hidden">
                <span className="font-semibold truncate">
                  {item.display_name.split(",")[0]}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {item.display_name}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
