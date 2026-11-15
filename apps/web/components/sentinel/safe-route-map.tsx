"use client";

import { useEffect, useRef, useState } from "react";
import type { ConcernLevel, SentinelSession } from "@/lib/types/sentinel";

interface SafeRouteMapProps {
  session: SentinelSession;
  currentCoords: { lat: number; lng: number } | null;
  corridorRadiusMeters?: number;
}

const CORRIDOR_COLORS: Record<ConcernLevel, { fill: string; color: string; opacity: number }> = {
  normal: { fill: "rgba(15, 90, 78, 0.14)", color: "#0f5a4e", opacity: 0.14 },
  advisory: { fill: "rgba(146, 64, 14, 0.18)", color: "#92400e", opacity: 0.18 },
  warning: { fill: "rgba(194, 65, 12, 0.22)", color: "#c2410c", opacity: 0.22 },
  critical: { fill: "rgba(153, 27, 27, 0.28)", color: "#991b1b", opacity: 0.28 },
};

export function SafeRouteMap({
  session,
  currentCoords,
  corridorRadiusMeters = 200,
}: SafeRouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;

    async function initLeaflet() {
      try {
        const L = (await import("leaflet")).default;
        if (!isMounted || !mapContainerRef.current) return;

        const defaultCenter: [number, number] = currentCoords
          ? [currentCoords.lat, currentCoords.lng]
          : session.start_lat && session.start_lng
            ? [session.start_lat, session.start_lng]
            : session.destination_lat && session.destination_lng
              ? [session.destination_lat, session.destination_lng]
              : [28.6139, 77.209];

        if (!mapRef.current) {
          const map = L.map(mapContainerRef.current, {
            center: defaultCenter,
            zoom: 15,
            zoomControl: true,
            attributionControl: true,
          });

          L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
            {
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
              maxZoom: 19,
              subdomains: "abcd",
            }
          ).addTo(map);

          mapRef.current = map;
          layerGroupRef.current = L.layerGroup().addTo(map);
        }

        const map = mapRef.current;
        const layerGroup = layerGroupRef.current;
        if (!map || !layerGroup) return;

        layerGroup.clearLayers();

        // 1. Current Position Marker (pulsing blue circle)
        const posToUse = currentCoords || (session.start_lat && session.start_lng
          ? { lat: session.start_lat, lng: session.start_lng }
          : null);

        if (posToUse) {
          const pulseIcon = L.divIcon({
            className: "leaflet-user-pulse-marker",
            html: `
              <div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">
                <span style="position:absolute;width:24px;height:24px;border-radius:50%;background:rgba(37,99,235,0.35);animation:ping 1.8s cubic-bezier(0,0,0.2,1) infinite;"></span>
                <span style="position:relative;width:12px;height:12px;border-radius:50%;background:#2563eb;border:2px solid #ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.35);"></span>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          const userMarker = L.marker([posToUse.lat, posToUse.lng], { icon: pulseIcon })
            .bindPopup("<strong>Your Live Location</strong>");
          layerGroup.addLayer(userMarker);
          userMarkerRef.current = userMarker;
        }

        // 2. Destination Marker and Corridor Line
        if (session.destination_lat && session.destination_lng) {
          const destLat = session.destination_lat;
          const destLng = session.destination_lng;

          const destIcon = L.divIcon({
            className: "leaflet-dest-marker",
            html: `
              <div style="display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:#065f46;color:#ffffff;font-size:12px;border:2px solid #ffffff;box-shadow:0 2px 5px rgba(0,0,0,0.35);">
                📍
              </div>
            `,
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          });

          const destMarker = L.marker([destLat, destLng], { icon: destIcon })
            .bindPopup(`<strong>Destination:</strong> ${session.destination_name || "Safe Haven"}`);
          layerGroup.addLayer(destMarker);

          if (posToUse) {
            // Draw connecting safe corridor line
            const routePath: [number, number][] = [
              [posToUse.lat, posToUse.lng],
              [destLat, destLng],
            ];

            const routeLine = L.polyline(routePath, {
              color: "#0f5a4e",
              weight: 4,
              opacity: 0.9,
              dashArray: "6, 6",
            });
            layerGroup.addLayer(routeLine);

            // Corridor safety buffer circle around destination and origin
            const concernConfig = CORRIDOR_COLORS[session.concern_level] || CORRIDOR_COLORS.normal;
            const destCircle = L.circle([destLat, destLng], {
              radius: corridorRadiusMeters,
              color: concernConfig.color,
              weight: 1,
              opacity: 0.35,
              fillColor: concernConfig.fill,
              fillOpacity: concernConfig.opacity,
            });
            layerGroup.addLayer(destCircle);

            const userCircle = L.circle([posToUse.lat, posToUse.lng], {
              radius: corridorRadiusMeters,
              color: concernConfig.color,
              weight: 1,
              opacity: 0.35,
              fillColor: concernConfig.fill,
              fillOpacity: concernConfig.opacity,
            });
            layerGroup.addLayer(userCircle);

            // Fit map bounds
            map.fitBounds(L.latLngBounds([
              [posToUse.lat, posToUse.lng],
              [destLat, destLng],
            ]), { padding: [35, 35] });
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.warn("Leaflet Sentinel map initialization error:", err);
        setIsLoading(false);
      }
    }

    initLeaflet();
  }, [
    session.destination_lat,
    session.destination_lng,
    session.start_lat,
    session.start_lng,
    session.concern_level,
    corridorRadiusMeters,
  ]);

  // Update live user coordinates as GPS position updates
  useEffect(() => {
    if (!currentCoords || !userMarkerRef.current) return;
    try {
      userMarkerRef.current.setLatLng([currentCoords.lat, currentCoords.lng]);
    } catch {
      // Ignore
    }
  }, [currentCoords]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative h-52 w-full overflow-hidden rounded-xl border border-zinc-200 shadow-xs dark:border-zinc-800 z-0">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex animate-pulse items-center justify-center bg-zinc-100 text-xs text-zinc-400 dark:bg-zinc-800">
          Loading Safe Corridor Map...
        </div>
      )}
      <div ref={mapContainerRef} className="h-full w-full z-0" />
      <div className="absolute bottom-2 right-2 z-[1000] flex items-center gap-1 rounded-full border border-border/80 bg-background/90 px-2 py-0.5 text-[10px] font-medium shadow-xs backdrop-blur-xs text-foreground">
        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Leaflet Live GPS</span>
      </div>
    </div>
  );
}
