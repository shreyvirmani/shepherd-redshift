"use client";

import { useEffect, useRef, useState } from "react";
import { getMapsLoader } from "@/lib/maps/loader";
import type { ConcernLevel, SentinelSession, TravelMode } from "@/lib/types/sentinel";

interface SafeRouteMapProps {
  session: SentinelSession;
  currentCoords: { lat: number; lng: number } | null;
  corridorRadiusMeters?: number;
}

const CORRIDOR_COLORS: Record<ConcernLevel, { fill: string; color: string; opacity: number }> = {
  normal: { fill: "rgba(15, 90, 78, 0.12)", color: "#0f5a4e", opacity: 0.12 },
  advisory: { fill: "rgba(146, 64, 14, 0.18)", color: "#92400e", opacity: 0.18 },
  warning: { fill: "rgba(194, 65, 12, 0.22)", color: "#c2410c", opacity: 0.22 },
  critical: { fill: "rgba(153, 27, 27, 0.28)", color: "#991b1b", opacity: 0.28 },
};

const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ visibility: "simplified" }] },
];

function getTravelMode(mode: TravelMode): google.maps.TravelMode {
  if (typeof google === "undefined" || !google.maps) {
    return "WALKING" as unknown as google.maps.TravelMode;
  }
  switch (mode) {
    case "transit":
      return google.maps.TravelMode.TRANSIT;
    case "driving":
      return google.maps.TravelMode.DRIVING;
    case "walking":
    default:
      return google.maps.TravelMode.WALKING;
  }
}

export function SafeRouteMap({
  session,
  currentCoords,
  corridorRadiusMeters = 200,
}: SafeRouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const circlesRef = useRef<google.maps.Circle[]>([]);
  // Store markers as any to support either AdvancedMarkerElement or standard Marker
  const currentPosMarkerRef = useRef<any>(null);
  const destinationMarkerRef = useRef<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const hasApiKey = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

  useEffect(() => {
    if (!hasApiKey || !mapContainerRef.current) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function initMap() {
      try {
        const loader = getMapsLoader();
        const [{ Map }, markerLib] = await Promise.all([
          loader.importLibrary("maps") as Promise<google.maps.MapsLibrary>,
          loader.importLibrary("marker") as Promise<google.maps.MarkerLibrary>,
        ]);

        if (!isMounted || !mapContainerRef.current) return;

        // Determine default center
        const defaultCenter = currentCoords
          ? { lat: currentCoords.lat, lng: currentCoords.lng }
          : session.start_lat && session.start_lng
            ? { lat: session.start_lat, lng: session.start_lng }
            : session.destination_lat && session.destination_lng
              ? { lat: session.destination_lat, lng: session.destination_lng }
              : { lat: 28.6139, lng: 77.209 }; // Default fallback

        // Initialize Map
        const map = new Map(mapContainerRef.current, {
          center: defaultCenter,
          zoom: 15,
          mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID",
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        mapRef.current = map;

        // 1. Current Position Marker (pulsing blue circle)
        const posToUse = currentCoords || (session.start_lat && session.start_lng
          ? { lat: session.start_lat, lng: session.start_lng }
          : null);

        if (posToUse) {
          const pulseContainer = document.createElement("div");
          pulseContainer.style.position = "relative";
          pulseContainer.style.width = "24px";
          pulseContainer.style.height = "24px";
          pulseContainer.style.display = "flex";
          pulseContainer.style.alignItems = "center";
          pulseContainer.style.justifyContent = "center";

          const pulseRing = document.createElement("span");
          pulseRing.style.position = "absolute";
          pulseRing.style.width = "24px";
          pulseRing.style.height = "24px";
          pulseRing.style.borderRadius = "50%";
          pulseRing.style.backgroundColor = "rgba(37, 99, 235, 0.35)";
          pulseRing.style.animation = "ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite";

          const coreDot = document.createElement("span");
          coreDot.style.position = "relative";
          coreDot.style.width = "12px";
          coreDot.style.height = "12px";
          coreDot.style.borderRadius = "50%";
          coreDot.style.backgroundColor = "#2563eb";
          coreDot.style.border = "2px solid #ffffff";
          coreDot.style.boxShadow = "0 1px 3px rgba(0,0,0,0.3)";

          pulseContainer.appendChild(pulseRing);
          pulseContainer.appendChild(coreDot);

          try {
            if (markerLib?.AdvancedMarkerElement) {
              currentPosMarkerRef.current = new markerLib.AdvancedMarkerElement({
                map,
                position: posToUse,
                content: pulseContainer,
                title: "Your Location",
              });
            } else {
              throw new Error("AdvancedMarkerElement unavailable");
            }
          } catch {
            currentPosMarkerRef.current = new google.maps.Marker({
              map,
              position: posToUse,
              title: "Your Location",
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 7,
                fillColor: "#2563eb",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
              },
            });
          }
        }

        // 2. If Destination coordinates exist, calculate Directions & Safe Corridor
        if (session.destination_lat && session.destination_lng) {
          const destCoords = {
            lat: session.destination_lat,
            lng: session.destination_lng,
          };

          // Destination marker: standard pin in emerald #065f46
          try {
            if (markerLib?.PinElement && markerLib?.AdvancedMarkerElement) {
              const pin = new markerLib.PinElement({
                background: "#065f46",
                borderColor: "#044e39",
                glyphColor: "#ffffff",
                scale: 1,
              });
              destinationMarkerRef.current = new markerLib.AdvancedMarkerElement({
                map,
                position: destCoords,
                content: pin.element,
                title: session.destination_name || "Destination",
              });
            } else {
              throw new Error("Advanced pin unavailable");
            }
          } catch {
            destinationMarkerRef.current = new google.maps.Marker({
              map,
              position: destCoords,
              title: session.destination_name || "Destination",
              icon: {
                path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                fillColor: "#065f46",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 1.5,
                scale: 1.4,
                anchor: new google.maps.Point(12, 22),
              },
            });
          }

          const origin = session.start_lat && session.start_lng
            ? { lat: session.start_lat, lng: session.start_lng }
            : currentCoords
              ? { lat: currentCoords.lat, lng: currentCoords.lng }
              : null;

          if (origin) {
            const directionsService = new google.maps.DirectionsService();
            directionsService.route(
              {
                origin,
                destination: destCoords,
                travelMode: getTravelMode(session.travel_mode),
              },
              (result, status) => {
                if (!isMounted || !mapRef.current) return;

                if (status === google.maps.DirectionsStatus.OK && result) {
                  const overviewPath = result.routes[0]?.overview_path || [];

                  // Clean up previous polylines & circles
                  if (polylineRef.current) polylineRef.current.setMap(null);
                  circlesRef.current.forEach((c) => c.setMap(null));
                  circlesRef.current = [];

                  // Render route Polyline with #0f5a4e
                  polylineRef.current = new google.maps.Polyline({
                    path: overviewPath,
                    strokeColor: "#0f5a4e",
                    strokeWeight: 4,
                    strokeOpacity: 0.9,
                    map: mapRef.current,
                  });

                  // Draw corridor circles at every 5th route step point
                  const concernConfig = CORRIDOR_COLORS[session.concern_level] || CORRIDOR_COLORS.normal;
                  for (let i = 0; i < overviewPath.length; i += 5) {
                    const circle = new google.maps.Circle({
                      map: mapRef.current,
                      center: overviewPath[i],
                      radius: corridorRadiusMeters,
                      fillColor: concernConfig.fill,
                      fillOpacity: concernConfig.opacity,
                      strokeColor: concernConfig.color,
                      strokeOpacity: 0.28,
                      strokeWeight: 1,
                    });
                    circlesRef.current.push(circle);
                  }

                  // Fit bounds to show route and origin/destination
                  const bounds = new google.maps.LatLngBounds();
                  overviewPath.forEach((pt) => bounds.extend(pt));
                  if (currentCoords) {
                    bounds.extend(currentCoords);
                  }
                  mapRef.current.fitBounds(bounds, 36);
                }
              },
            );
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.warn("Google Maps initialization failed:", err);
        setIsLoading(false);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (polylineRef.current) polylineRef.current.setMap(null);
      circlesRef.current.forEach((c) => c.setMap(null));
      circlesRef.current = [];
      if (currentPosMarkerRef.current?.setMap) {
        currentPosMarkerRef.current.setMap(null);
      } else if (currentPosMarkerRef.current) {
        currentPosMarkerRef.current.map = null;
      }
      if (destinationMarkerRef.current?.setMap) {
        destinationMarkerRef.current.setMap(null);
      } else if (destinationMarkerRef.current) {
        destinationMarkerRef.current.map = null;
      }
    };
  }, [
    hasApiKey,
    session.destination_lat,
    session.destination_lng,
    session.start_lat,
    session.start_lng,
    session.travel_mode,
    session.concern_level,
    corridorRadiusMeters,
  ]);

  // Update current location position live as coords change
  useEffect(() => {
    if (!currentCoords || !currentPosMarkerRef.current) return;
    const pos = { lat: currentCoords.lat, lng: currentCoords.lng };
    if ("position" in currentPosMarkerRef.current) {
      currentPosMarkerRef.current.position = pos;
    } else if (typeof currentPosMarkerRef.current.setPosition === "function") {
      currentPosMarkerRef.current.setPosition(pos);
    }
  }, [currentCoords]);

  if (!hasApiKey) {
    return (
      <div className="flex h-52 w-full flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-4 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
        <p className="font-semibold text-zinc-700 dark:text-zinc-300">Live Route Map Preview</p>
        <p className="mt-1 max-w-xs text-[11px]">
          Configure <code className="rounded bg-zinc-200 px-1 py-0.5 dark:bg-zinc-800">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to enable dynamic route corridors and GPS telemetry.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-52 w-full overflow-hidden rounded-xl border border-zinc-200 shadow-xs dark:border-zinc-800">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex animate-pulse items-center justify-center bg-zinc-100 text-xs text-zinc-400 dark:bg-zinc-800">
          Loading Safe Route Corridor...
        </div>
      )}
      <div ref={mapContainerRef} className="h-full w-full" />
    </div>
  );
}
