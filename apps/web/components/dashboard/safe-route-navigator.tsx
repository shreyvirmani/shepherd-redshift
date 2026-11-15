"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Check,
  Clock,
  Compass,
  Footprints,
  Info,
  Lightbulb,
  MapPin,
  Moon,
  Navigation,
  Route,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Store,
  Sun,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RouteOption {
  id: "safe" | "shortest";
  name: string;
  badge: string;
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
  distanceKm: number;
  durationMins: number;
  safetyScore: number; // 0 - 100
  lightingScore: number; // percentage
  lightingDescription: string;
  incidentCount: number;
  incidentDetails: string;
  safeHavenCount: number;
  safeHavens: string[];
  hazards: Array<{
    lat: number;
    lng: number;
    title: string;
    description: string;
    type: "incident" | "lighting";
  }>;
  path: Array<{ lat: number; lng: number }>;
}

interface CorridorPreset {
  id: string;
  name: string;
  originName: string;
  destinationName: string;
  originCoords: { lat: number; lng: number };
  destCoords: { lat: number; lng: number };
  safeRoute: RouteOption;
  shortestRoute: RouteOption;
}

const PRESET_CORRIDORS: CorridorPreset[] = [
  {
    id: "metro-cyberhub",
    name: "Central Metro → Cyber Hub Tech Park",
    originName: "Central Metro Station Exit 2",
    destinationName: "Cyber Hub Gate 1",
    originCoords: { lat: 28.4965, lng: 77.0862 },
    destCoords: { lat: 28.4912, lng: 77.0925 },
    safeRoute: {
      id: "safe",
      name: "SHEPHERD Safe Route",
      badge: "Safest Choice",
      badgeVariant: "default",
      distanceKm: 1.3,
      durationMins: 17,
      safetyScore: 96,
      lightingScore: 94,
      lightingDescription: "Continuous LED streetlights, wide illuminated sidewalks, open commercial storefronts",
      incidentCount: 0,
      incidentDetails: "Zero reported harassment or threat incidents on this boulevard",
      safeHavenCount: 4,
      safeHavens: ["24/7 Apollo Pharmacy", "Metro Police Post Gate 2", "Cyber Hub Security Station", "Convenience Mart"],
      hazards: [],
      path: [
        { lat: 28.4965, lng: 77.0862 },
        { lat: 28.4955, lng: 77.0878 },
        { lat: 28.4942, lng: 77.0895 },
        { lat: 28.4928, lng: 77.0912 },
        { lat: 28.4912, lng: 77.0925 },
      ],
    },
    shortestRoute: {
      id: "shortest",
      name: "Direct Shortest Route",
      badge: "Elevated Risk",
      badgeVariant: "destructive",
      distanceKm: 0.9,
      durationMins: 12,
      safetyScore: 52,
      lightingScore: 36,
      lightingDescription: "280m unlit blind alley behind construction compound with broken street fixtures",
      incidentCount: 2,
      incidentDetails: "2 historical harassment incidents reported after 8:30 PM (verbal threats & following)",
      safeHavenCount: 0,
      safeHavens: [],
      hazards: [
        {
          lat: 28.4948,
          lng: 77.0872,
          title: "Past Harassment Report",
          description: "Stalking & intimidation reported at 9:15 PM",
          type: "incident",
        },
        {
          lat: 28.4932,
          lng: 77.0898,
          title: "Dark Blindspot",
          description: "Zero illumination across 280m service lane",
          type: "lighting",
        },
      ],
      path: [
        { lat: 28.4965, lng: 77.0862 },
        { lat: 28.4948, lng: 77.0872 },
        { lat: 28.4932, lng: 77.0898 },
        { lat: 28.4912, lng: 77.0925 },
      ],
    },
  },
  {
    id: "lajpat-residency",
    name: "Central Market → Residential Sector 62",
    originName: "Central Market South Gate",
    destinationName: "Sector 62 Residency Gate 3",
    originCoords: { lat: 28.5682, lng: 77.2435 },
    destCoords: { lat: 28.5624, lng: 77.2518 },
    safeRoute: {
      id: "safe",
      name: "SHEPHERD Safe Route",
      badge: "Safest Choice",
      badgeVariant: "default",
      distanceKm: 1.6,
      durationMins: 21,
      safetyScore: 94,
      lightingScore: 92,
      lightingDescription: "Major arterial road with high-density lighting, active traffic, and 24-hour kiosks",
      incidentCount: 0,
      incidentDetails: "Clean safety record. Monitored by municipal CCTV network",
      safeHavenCount: 3,
      safeHavens: ["Police Assistance Kiosk", "24/7 Fuel Station Store", "MedPlus Pharmacy"],
      hazards: [],
      path: [
        { lat: 28.5682, lng: 77.2435 },
        { lat: 28.5670, lng: 77.2455 },
        { lat: 28.5652, lng: 77.2482 },
        { lat: 28.5638, lng: 77.2502 },
        { lat: 28.5624, lng: 77.2518 },
      ],
    },
    shortestRoute: {
      id: "shortest",
      name: "Direct Shortest Route",
      badge: "Elevated Risk",
      badgeVariant: "destructive",
      distanceKm: 1.1,
      durationMins: 15,
      safetyScore: 56,
      lightingScore: 42,
      lightingDescription: "Cuts through isolated park periphery with trees obscuring overhead lighting",
      incidentCount: 1,
      incidentDetails: "1 harassment incident recorded near boundary wall",
      safeHavenCount: 0,
      safeHavens: [],
      hazards: [
        {
          lat: 28.5658,
          lng: 77.2468,
          title: "Park Periphery Incident",
          description: "Followed on foot, low visibility zone",
          type: "incident",
        },
      ],
      path: [
        { lat: 28.5682, lng: 77.2435 },
        { lat: 28.5658, lng: 77.2468 },
        { lat: 28.5635, lng: 77.2495 },
        { lat: 28.5624, lng: 77.2518 },
      ],
    },
  },
  {
    id: "campus-metro",
    name: "University North Campus → Metro Gate 3",
    originName: "Main University Library",
    destinationName: "Vishwavidyalaya Metro Gate 3",
    originCoords: { lat: 28.6908, lng: 77.2085 },
    destCoords: { lat: 28.6975, lng: 77.2142 },
    safeRoute: {
      id: "safe",
      name: "SHEPHERD Safe Route",
      badge: "Safest Choice",
      badgeVariant: "default",
      distanceKm: 1.2,
      durationMins: 15,
      safetyScore: 98,
      lightingScore: 98,
      lightingDescription: "University Avenue: illuminated student corridor with 24/7 campus security patrols",
      incidentCount: 0,
      incidentDetails: "High safety corridor. Campus emergency SOS kiosks every 150m",
      safeHavenCount: 5,
      safeHavens: ["Campus Security Booth", "Student Union 24/7 Cafe", "Metro Gate 1 Police Booth", "Day-Night Chemist"],
      hazards: [],
      path: [
        { lat: 28.6908, lng: 77.2085 },
        { lat: 28.6925, lng: 77.2102 },
        { lat: 28.6948, lng: 77.2120 },
        { lat: 28.6962, lng: 77.2132 },
        { lat: 28.6975, lng: 77.2142 },
      ],
    },
    shortestRoute: {
      id: "shortest",
      name: "Direct Shortest Route",
      badge: "Elevated Risk",
      badgeVariant: "destructive",
      distanceKm: 0.85,
      durationMins: 11,
      safetyScore: 61,
      lightingScore: 48,
      lightingDescription: "Unpaved boundary road adjacent to vacant ridge land with sporadic halogen lighting",
      incidentCount: 1,
      incidentDetails: "1 eve-teasing/stalking incident flagged in student safety forum",
      safeHavenCount: 1,
      safeHavens: ["Tea Stall (closes at 9 PM)"],
      hazards: [
        {
          lat: 28.6940,
          lng: 77.2098,
          title: "Reported Ridge Incident",
          description: "Isolated lane, no CCTV coverage",
          type: "incident",
        },
      ],
      path: [
        { lat: 28.6908, lng: 77.2085 },
        { lat: 28.6940, lng: 77.2098 },
        { lat: 28.6975, lng: 77.2142 },
      ],
    },
  },
];

export function SafeRouteNavigator() {
  const [selectedPresetId, setSelectedPresetId] = React.useState<string>("metro-cyberhub");
  const [selectedRouteType, setSelectedRouteType] = React.useState<"safe" | "shortest">("safe");
  const [showLightingLayer, setShowLightingLayer] = React.useState(true);
  const [showIncidentLayer, setShowIncidentLayer] = React.useState(true);
  const [showHavenLayer, setShowHavenLayer] = React.useState(true);

  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<any>(null);
  const layersGroupRef = React.useRef<any>(null);

  const currentCorridor = PRESET_CORRIDORS.find((c) => c.id === selectedPresetId) ?? PRESET_CORRIDORS[0];
  const activeRoute = selectedRouteType === "safe" ? currentCorridor.safeRoute : currentCorridor.shortestRoute;

  // Initialize or update Leaflet map whenever route, corridor, or layer toggles change
  React.useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;

    async function initLeaflet() {
      try {
        const L = (await import("leaflet")).default;
        if (!isMounted || !mapContainerRef.current) return;

        // Initialize Map if not already created
        if (!mapInstanceRef.current) {
          const center: [number, number] = [
            (currentCorridor.originCoords.lat + currentCorridor.destCoords.lat) / 2,
            (currentCorridor.originCoords.lng + currentCorridor.destCoords.lng) / 2,
          ];

          const map = L.map(mapContainerRef.current, {
            center,
            zoom: 15,
            zoomControl: true,
            attributionControl: true,
          });

          // Modern high-DPI CartoDB Voyager tiles (crisp, beautiful pastel roads and buildings)
          L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
            {
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
              maxZoom: 19,
              subdomains: "abcd",
            }
          ).addTo(map);

          mapInstanceRef.current = map;
          layersGroupRef.current = L.layerGroup().addTo(map);
        }

        const map = mapInstanceRef.current;
        const layerGroup = layersGroupRef.current;
        if (!map || !layerGroup) return;

        // Reset previous layers
        layerGroup.clearLayers();

        // 1. Safe Route Polyline (Deep Emerald #0f5a4e)
        const safePoly = L.polyline(
          currentCorridor.safeRoute.path.map((p) => [p.lat, p.lng]),
          {
            color: "#0f5a4e",
            weight: selectedRouteType === "safe" ? 6 : 3.5,
            opacity: selectedRouteType === "safe" ? 1.0 : 0.45,
            lineCap: "round",
            lineJoin: "round",
          }
        );
        layerGroup.addLayer(safePoly);

        // 2. Shortest Route Polyline (Warning Amber/Red #b45309)
        const shortestPoly = L.polyline(
          currentCorridor.shortestRoute.path.map((p) => [p.lat, p.lng]),
          {
            color: "#b45309",
            weight: selectedRouteType === "shortest" ? 5 : 2.5,
            opacity: selectedRouteType === "shortest" ? 1.0 : 0.4,
            dashArray: selectedRouteType === "shortest" ? undefined : "6, 8",
            lineCap: "round",
            lineJoin: "round",
          }
        );
        layerGroup.addLayer(shortestPoly);

        // 3. Protective Lighting Corridor Circles along Safe Route
        if (showLightingLayer) {
          currentCorridor.safeRoute.path.forEach((pt) => {
            const circle = L.circle([pt.lat, pt.lng], {
              radius: 120,
              color: "#0f5a4e",
              weight: 1,
              opacity: 0.3,
              fillColor: "#0f5a4e",
              fillOpacity: 0.14,
            });
            layerGroup.addLayer(circle);
          });
        }

        // 4. Incident Hazards along Shortest Route
        if (showIncidentLayer) {
          currentCorridor.shortestRoute.hazards.forEach((h) => {
            const hazardIcon = L.divIcon({
              className: "leaflet-hazard-icon",
              html: `<div style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:#e11d48;color:#fff;font-weight:bold;font-size:12px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35);cursor:pointer;" title="${h.title}">!</div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            });
            const hazardMarker = L.marker([h.lat, h.lng], { icon: hazardIcon })
              .bindPopup(
                `<div style="font-family:sans-serif;font-size:12px;line-height:1.4;">
                  <strong style="color:#e11d48;">⚠️ ${h.title}</strong><br/>
                  <span style="color:#4b5563;">${h.description}</span>
                </div>`
              );
            layerGroup.addLayer(hazardMarker);
          });
        }

        // 5. Safe Havens along Safe Route
        if (showHavenLayer && currentCorridor.safeRoute.safeHavens.length > 0) {
          currentCorridor.safeRoute.safeHavens.forEach((haven, idx) => {
            const pt = currentCorridor.safeRoute.path[Math.min(idx + 1, currentCorridor.safeRoute.path.length - 2)];
            if (pt) {
              const havenIcon = L.divIcon({
                className: "leaflet-haven-icon",
                html: `<div style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:#0d9488;color:#fff;font-size:11px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35);cursor:pointer;" title="${haven}">🛡️</div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
              });
              const havenMarker = L.marker([pt.lat, pt.lng], { icon: havenIcon })
                .bindPopup(
                  `<div style="font-family:sans-serif;font-size:12px;line-height:1.4;">
                    <strong style="color:#0f5a4e;">🛡️ Safe Haven</strong><br/>
                    <span style="color:#374151;">${haven}</span>
                  </div>`
                );
              layerGroup.addLayer(havenMarker);
            }
          });
        }

        // 6. Origin Marker (Blue Badge A)
        const originIcon = L.divIcon({
          className: "leaflet-origin-icon",
          html: `<div style="display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:#2563eb;color:#fff;font-weight:bold;font-size:12px;border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35);cursor:pointer;">A</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });
        const originMarker = L.marker([currentCorridor.originCoords.lat, currentCorridor.originCoords.lng], { icon: originIcon })
          .bindPopup(
            `<div style="font-family:sans-serif;font-size:12px;">
              <strong style="color:#2563eb;">Origin</strong><br/>
              <span>${currentCorridor.originName}</span>
            </div>`
          );
        layerGroup.addLayer(originMarker);

        // 7. Destination Marker (Emerald Badge B)
        const destIcon = L.divIcon({
          className: "leaflet-dest-icon",
          html: `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:#065f46;color:#fff;font-weight:bold;font-size:12px;border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35);cursor:pointer;">B</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        const destMarker = L.marker([currentCorridor.destCoords.lat, currentCorridor.destCoords.lng], { icon: destIcon })
          .bindPopup(
            `<div style="font-family:sans-serif;font-size:12px;">
              <strong style="color:#065f46;">Destination</strong><br/>
              <span>${currentCorridor.destinationName}</span>
            </div>`
          );
        layerGroup.addLayer(destMarker);

        // Fit map bounds to encompass all points with padding
        const allPoints: [number, number][] = [
          [currentCorridor.originCoords.lat, currentCorridor.originCoords.lng],
          [currentCorridor.destCoords.lat, currentCorridor.destCoords.lng],
          ...currentCorridor.safeRoute.path.map((p) => [p.lat, p.lng] as [number, number]),
          ...currentCorridor.shortestRoute.path.map((p) => [p.lat, p.lng] as [number, number]),
        ];
        map.fitBounds(L.latLngBounds(allPoints), { padding: [40, 40] });
      } catch (err) {
        console.warn("Leaflet map initialization error:", err);
      }
    }

    initLeaflet();
  }, [
    selectedPresetId,
    selectedRouteType,
    showLightingLayer,
    showIncidentLayer,
    showHavenLayer,
    currentCorridor,
  ]);

  // Clean up Leaflet on unmount
  React.useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <Card className="border-border/80 bg-card/90 shadow-sm backdrop-blur-xs transition-shadow hover:shadow-md">
      <CardHeader className="pb-3.5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Compass className="size-4" />
              </div>
              <CardTitle className="text-base font-semibold tracking-tight text-foreground">
                SafeRoute Intelligence
              </CardTitle>
              <Badge className="bg-primary/15 text-primary hover:bg-primary/20 text-[11px] font-medium border-0">
                <Sparkles className="mr-1 size-3 text-primary" />
                Safety-First Routing
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Compares the shortest distance against vetted safe corridors based on street illumination, past incident heatmaps, and verified 24/7 havens.
            </CardDescription>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <Button
              asChild
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs text-xs font-semibold"
            >
              <Link href={`/sentinel?dest=${encodeURIComponent(currentCorridor.destinationName)}&lat=${currentCorridor.destCoords.lat}&lng=${currentCorridor.destCoords.lng}`}>
                <Navigation className="mr-1.5 size-3.5" />
                Start Sentinel Journey
              </Link>
            </Button>
          </div>
        </div>

        {/* Corridor Presets Bar */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          <span className="text-[11px] font-medium text-muted-foreground mr-1">
            Corridors:
          </span>
          {PRESET_CORRIDORS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setSelectedPresetId(c.id);
                setSelectedRouteType("safe");
              }}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                selectedPresetId === c.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "border border-border bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Route Comparison Selector */}
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Option A: Safe Route */}
          <div
            onClick={() => setSelectedRouteType("safe")}
            className={`group relative cursor-pointer rounded-xl border p-3.5 transition-all ${
              selectedRouteType === "safe"
                ? "border-primary/80 bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                : "border-border/70 bg-card hover:border-primary/40 hover:bg-muted/30"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  ✓
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground group-hover:text-primary">
                    {currentCorridor.safeRoute.name}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    {currentCorridor.safeRoute.distanceKm} km · {currentCorridor.safeRoute.durationMins} min walk
                  </p>
                </div>
              </div>
              <Badge className="bg-emerald-600/15 text-emerald-800 dark:text-emerald-300 border-0 text-[10px] font-semibold">
                Safety Score: {currentCorridor.safeRoute.safetyScore}/100
              </Badge>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border/50 pt-2.5 text-center text-[10px]">
              <div>
                <span className="flex items-center justify-center gap-1 text-muted-foreground font-medium">
                  <Sun className="size-3 text-amber-500" />
                  Lighting
                </span>
                <span className="font-bold text-foreground">
                  {currentCorridor.safeRoute.lightingScore}% lit
                </span>
              </div>
              <div>
                <span className="flex items-center justify-center gap-1 text-muted-foreground font-medium">
                  <ShieldCheck className="size-3 text-emerald-600" />
                  Incidents
                </span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  0 Reported
                </span>
              </div>
              <div>
                <span className="flex items-center justify-center gap-1 text-muted-foreground font-medium">
                  <Store className="size-3 text-primary" />
                  Havens
                </span>
                <span className="font-bold text-foreground">
                  {currentCorridor.safeRoute.safeHavenCount} Active
                </span>
              </div>
            </div>

            <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
              💡 {currentCorridor.safeRoute.lightingDescription}
            </p>
          </div>

          {/* Option B: Direct / Shortest Route */}
          <div
            onClick={() => setSelectedRouteType("shortest")}
            className={`group relative cursor-pointer rounded-xl border p-3.5 transition-all ${
              selectedRouteType === "shortest"
                ? "border-amber-500/80 bg-amber-500/5 ring-2 ring-amber-500/20 shadow-xs"
                : "border-border/70 bg-card hover:border-amber-400/40 hover:bg-muted/30"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold">
                  !
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground group-hover:text-amber-700 dark:group-hover:text-amber-400">
                    {currentCorridor.shortestRoute.name}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    {currentCorridor.shortestRoute.distanceKm} km · {currentCorridor.shortestRoute.durationMins} min walk{" "}
                    <span className="text-amber-700 dark:text-amber-400 font-medium">
                      (Save 4-5 mins)
                    </span>
                  </p>
                </div>
              </div>
              <Badge className="bg-amber-600/15 text-amber-800 dark:text-amber-300 border-0 text-[10px] font-semibold">
                Safety Score: {currentCorridor.shortestRoute.safetyScore}/100
              </Badge>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border/50 pt-2.5 text-center text-[10px]">
              <div>
                <span className="flex items-center justify-center gap-1 text-muted-foreground font-medium">
                  <Moon className="size-3 text-zinc-500" />
                  Lighting
                </span>
                <span className="font-bold text-amber-700 dark:text-amber-400">
                  {currentCorridor.shortestRoute.lightingScore}% (Deficient)
                </span>
              </div>
              <div>
                <span className="flex items-center justify-center gap-1 text-muted-foreground font-medium">
                  <AlertTriangle className="size-3 text-rose-500" />
                  Incidents
                </span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  {currentCorridor.shortestRoute.incidentCount} Historical
                </span>
              </div>
              <div>
                <span className="flex items-center justify-center gap-1 text-muted-foreground font-medium">
                  <Store className="size-3 text-zinc-400" />
                  Havens
                </span>
                <span className="font-bold text-muted-foreground">
                  None Available
                </span>
              </div>
            </div>

            <p className="mt-2 text-[11px] text-rose-700 dark:text-rose-300 leading-relaxed">
              ⚠️ {currentCorridor.shortestRoute.lightingDescription}
            </p>
          </div>
        </div>

        {/* Map Display & Layer Controls */}
        <div className="space-y-2">
          {/* Layer toggles bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Route className="size-3.5 text-primary" />
              <span>Route Visualization</span>
              <span className="text-muted-foreground">· Showing {activeRoute.name}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowLightingLayer(!showLightingLayer)}
                className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] transition-colors ${
                  showLightingLayer
                    ? "bg-primary/10 text-primary font-semibold"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Sun className="size-3" />
                Lighting Corridors
              </button>
              <button
                type="button"
                onClick={() => setShowIncidentLayer(!showIncidentLayer)}
                className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] transition-colors ${
                  showIncidentLayer
                    ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 font-semibold"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <AlertTriangle className="size-3" />
                Incident Hazards
              </button>
            </div>
          </div>

          {/* Real Leaflet Map Canvas */}
          <div className="relative h-72 sm:h-80 w-full overflow-hidden rounded-xl border border-border bg-card shadow-inner z-0">
            <div ref={mapContainerRef} className="h-full w-full z-0" />

            {/* Floating Top Route Legend */}
            <div className="absolute top-2.5 left-2.5 z-[1000] flex flex-wrap items-center gap-2 rounded-lg border border-border/80 bg-background/95 px-2.5 py-1.5 text-[11px] shadow-sm backdrop-blur-xs">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#0f5a4e]" />
                <span className="font-semibold text-foreground">Safe Route</span>
              </div>
              <span className="text-muted-foreground">|</span>
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#b45309]" />
                <span className="font-medium text-muted-foreground">Shortest Path</span>
              </div>
            </div>

            {/* Floating Bottom Live Tile Indicator */}
            <div className="absolute bottom-2.5 right-2.5 z-[1000] flex items-center gap-1.5 rounded-full border border-border/80 bg-background/95 px-2.5 py-1 text-[11px] font-medium shadow-xs backdrop-blur-xs text-foreground">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Leaflet · OpenStreetMap</span>
            </div>
          </div>
        </div>

        {/* Safe Havens & Emergency Resilience Checklist */}
        {/* Safe Havens & Emergency Resilience Checklist */}
        <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Shield className="size-3.5 text-primary" />
              Verified Safe Havens on {activeRoute.name}
            </h5>
            <span className="text-[11px] text-muted-foreground">
              {activeRoute.safeHavenCount} active safe spots
            </span>
          </div>

          {activeRoute.safeHavens.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {activeRoute.safeHavens.map((h) => (
                <span
                  key={h}
                  className="flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                >
                  <Building2 className="size-3 text-emerald-600" />
                  {h}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">
              ⚠️ No verified 24/7 commercial stores, pharmacies, or police kiosks are present along the direct shortest route.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
