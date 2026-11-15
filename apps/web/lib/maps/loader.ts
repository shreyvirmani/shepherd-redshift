import { Loader } from "@googlemaps/js-api-loader";

let loaderInstance: Loader | null = null;
let googleMapsPromise: Promise<typeof google> | null = null;

/**
 * Returns a singleton Loader instance configured with application settings.
 */
export function getMapsLoader(): Loader {
  if (!loaderInstance) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
    loaderInstance = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["places", "geometry"],
    });
  }
  return loaderInstance;
}

/**
 * Async helper that loads the Google Maps JavaScript API and caches the loaded google object.
 * Returns null if running server-side or if NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured.
 */
export async function loadMapsApi(): Promise<typeof google | null> {
  if (typeof window === "undefined") return null;
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  if (window.google?.maps) {
    return window.google;
  }

  if (!googleMapsPromise) {
    const loader = getMapsLoader();
    googleMapsPromise = loader.load().then(() => window.google);
  }

  return googleMapsPromise;
}
