import { Loader } from "@googlemaps/js-api-loader";

let loaderInstance: Loader | null = null;
let googleMapsPromise: Promise<typeof google> | null = null;
let activeApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export function setMapsApiKey(key: string) {
  if (key && key !== activeApiKey) {
    activeApiKey = key;
    loaderInstance = new Loader({
      apiKey: key,
      version: "weekly",
      libraries: ["places", "geometry", "marker"],
    });
  }
}

/**
 * Returns a singleton Loader instance configured with application settings.
 */
export function getMapsLoader(overrideKey?: string): Loader {
  const key = overrideKey || activeApiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  if (!loaderInstance || loaderInstance.apiKey !== key) {
    activeApiKey = key;
    loaderInstance = new Loader({
      apiKey: key,
      version: "weekly",
      libraries: ["places", "geometry", "marker"],
    });
  }
  return loaderInstance;
}

/**
 * Asynchronously retrieves Google Maps API key from env or via /api/maps/config fallback.
 */
export async function getMapsApiKey(): Promise<string> {
  if (activeApiKey) return activeApiKey;
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/maps/config");
      if (res.ok) {
        const data = await res.json();
        if (data.apiKey) {
          setMapsApiKey(data.apiKey);
          return data.apiKey;
        }
      }
    } catch {
      // Fallback
    }
  }
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
}

/**
 * Async helper that loads the Google Maps JavaScript API and caches the loaded google object.
 * Returns null if running server-side or if NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured.
 */
export async function loadMapsApi(): Promise<typeof google | null> {
  if (typeof window === "undefined") return null;
  const apiKey = await getMapsApiKey();
  if (!apiKey) return null;

  if (window.google?.maps) {
    return window.google;
  }

  if (!googleMapsPromise) {
    const loader = getMapsLoader(apiKey);
    googleMapsPromise = loader.load().then(() => window.google);
  }

  return googleMapsPromise;
}
