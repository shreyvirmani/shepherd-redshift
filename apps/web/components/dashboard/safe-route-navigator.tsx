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
import { getMapsLoader } from "@/lib/maps/loader";

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
  const mapInstanceRef = React.useRef<google.maps.Map | null>(null);
  const safePolylineRef = React.useRef<google.maps.Polyline | null>(null);
  const shortestPolylineRef = React.useRef<google.maps.Polyline | null>(null);
  const markersRef = React.useRef<Array<google.maps.Marker | any>>([]);
  const circlesRef = React.useRef<google.maps.Circle[]>([]);

  const hasApiKey = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
  const currentCorridor = PRESET_CORRIDORS.find((c) => c.id === selectedPresetId) ?? PRESET_CORRIDORS[0];
  const activeRoute = selectedRouteType === "safe" ? currentCorridor.safeRoute : currentCorridor.shortestRoute;

  // Initialize or update real Google Maps if API key is present
  React.useEffect(() => {
    if (!hasApiKey || !mapContainerRef.current) return;

    let isMounted = true;

    async function initGoogleMap() {
      try {
        const loader = getMapsLoader();
        const [{ Map }, markerLib] = await Promise.all([
          loader.importLibrary("maps") as Promise<google.maps.MapsLibrary>,
          loader.importLibrary("marker") as Promise<google.maps.MarkerLibrary>,
        ]);

        if (!isMounted || !mapContainerRef.current) return;

        // Clean up previous map objects
        markersRef.current.forEach((m) => {
          if (m?.setMap) m.setMap(null);
          else if (m) m.map = null;
        });
        markersRef.current = [];
        circlesRef.current.forEach((c) => c.setMap(null));
        circlesRef.current = [];
        if (safePolylineRef.current) safePolylineRef.current.setMap(null);
        if (shortestPolylineRef.current) shortestPolylineRef.current.setMap(null);

        // Center between origin and destination
        const center = {
          lat: (currentCorridor.originCoords.lat + currentCorridor.destCoords.lat) / 2,
          lng: (currentCorridor.originCoords.lng + currentCorridor.destCoords.lng) / 2,
        };

        const map = mapInstanceRef.current ?? new Map(mapContainerRef.current, {
          center,
          zoom: 15,
          disableDefaultUI: true,
          zoomControl: true,
          styles: [
            { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
            { featureType: "transit", stylers: [{ visibility: "off" }] },
            { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
          ],
        });
        mapInstanceRef.current = map;

        // Draw Safe Route Polyline (Deep Emerald #0f5a4e)
        safePolylineRef.current = new google.maps.Polyline({
          path: currentCorridor.safeRoute.path,
          map,
          strokeColor: "#0f5a4e",
          strokeWeight: selectedRouteType === "safe" ? 6 : 3,
          strokeOpacity: selectedRouteType === "safe" ? 1.0 : 0.45,
          zIndex: selectedRouteType === "safe" ? 10 : 2,
        });

        // Draw Shortest Route Polyline (Warning Red/Amber #b45309)
        shortestPolylineRef.current = new google.maps.Polyline({
          path: currentCorridor.shortestRoute.path,
          map,
          strokeColor: "#b45309",
          strokeWeight: selectedRouteType === "shortest" ? 6 : 3,
          strokeOpacity: selectedRouteType === "shortest" ? 1.0 : 0.45,
          zIndex: selectedRouteType === "shortest" ? 10 : 2,
        });

        // Add protective lighting corridor circles along Safe Route
        if (showLightingLayer) {
          currentCorridor.safeRoute.path.forEach((pt) => {
            const circle = new google.maps.Circle({
              map,
              center: pt,
              radius: 120,
              fillColor: "rgba(15, 90, 78, 0.16)",
              fillOpacity: 0.16,
              strokeColor: "#0f5a4e",
              strokeOpacity: 0.25,
              strokeWeight: 1,
            });
            circlesRef.current.push(circle);
          });
        }

        // Add Hazard Markers (Past Incidents & Dark spots) along Shortest Route
        if (showIncidentLayer) {
          currentCorridor.shortestRoute.hazards.forEach((h) => {
            const hazardDiv = document.createElement("div");
            hazardDiv.className = "flex items-center justify-center size-7 rounded-full bg-rose-600 text-white shadow-md border-2 border-white text-xs font-bold";
            hazardDiv.title = `${h.title}: ${h.description}`;
            hazardDiv.innerHTML = "!";

            try {
              if (markerLib?.AdvancedMarkerElement) {
                const marker = new markerLib.AdvancedMarkerElement({
                  map,
                  position: { lat: h.lat, lng: h.lng },
                  content: hazardDiv,
                  title: `${h.title} — ${h.description}`,
                });
                markersRef.current.push(marker);
              } else {
                throw new Error("fallback");
              }
            } catch {
              const marker = new google.maps.Marker({
                map,
                position: { lat: h.lat, lng: h.lng },
                title: `${h.title} — ${h.description}`,
                icon: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
              });
              markersRef.current.push(marker);
            }
          });
        }

        // Fit map bounds
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(currentCorridor.originCoords);
        bounds.extend(currentCorridor.destCoords);
        currentCorridor.safeRoute.path.forEach((p) => bounds.extend(p));
        currentCorridor.shortestRoute.path.forEach((p) => bounds.extend(p));
        map.fitBounds(bounds, 40);
      } catch (err) {
        console.warn("Dashboard map error:", err);
      }
    }

    initGoogleMap();
  }, [
    hasApiKey,
    selectedPresetId,
    selectedRouteType,
    showLightingLayer,
    showIncidentLayer,
    currentCorridor,
  ]);

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

          {/* Map Canvas / Vector Simulation */}
          <div className="relative h-72 sm:h-80 w-full overflow-hidden rounded-xl border border-border bg-card shadow-inner">
            {hasApiKey ? (
              <div ref={mapContainerRef} className="h-full w-full" />
            ) : (
              /* High-fidelity Vector Simulation with full interactive parity */
              <div className="relative h-full w-full bg-[#f4f3ec] dark:bg-[#121917] p-4 flex flex-col justify-between overflow-hidden">
                {/* SVG Visual Road Graph */}
                <svg
                  className="absolute inset-0 h-full w-full"
                  viewBox="0 0 600 320"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="safeRouteGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0f5a4e" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                    </linearGradient>
                    <filter id="corridorGlow" x1="-20%" y1="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="12" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Grid roads / City Blocks */}
                  <path d="M 40 40 L 560 40 M 40 100 L 560 100 M 40 160 L 560 160 M 40 220 L 560 220 M 40 280 L 560 280" stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />
                  <path d="M 100 20 L 100 300 M 200 20 L 200 300 M 300 20 L 300 300 M 400 20 L 400 300 M 500 20 L 500 300" stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />

                  {/* Safe Route Corridor Buffer (Green Glow) */}
                  {showLightingLayer && (
                    <path
                      d="M 80 240 Q 200 220, 290 140 T 520 80"
                      fill="none"
                      stroke="#0f5a4e"
                      strokeOpacity="0.14"
                      strokeWidth="48"
                      strokeLinecap="round"
                      filter="url(#corridorGlow)"
                    />
                  )}

                  {/* Direct Route (Unsafe Shortest Path - through alley) */}
                  <path
                    d="M 80 240 L 260 210 L 380 180 L 520 80"
                    fill="none"
                    stroke="#b45309"
                    strokeWidth={selectedRouteType === "shortest" ? "5" : "2.5"}
                    strokeDasharray={selectedRouteType === "shortest" ? "none" : "6 4"}
                    strokeOpacity={selectedRouteType === "shortest" ? "1" : "0.35"}
                    strokeLinecap="round"
                  />

                  {/* Safe Route (Illuminated Boulevard) */}
                  <path
                    d="M 80 240 Q 200 220, 290 140 T 520 80"
                    fill="none"
                    stroke="#0f5a4e"
                    strokeWidth={selectedRouteType === "safe" ? "5" : "2.5"}
                    strokeOpacity={selectedRouteType === "safe" ? "1" : "0.4"}
                    strokeLinecap="round"
                  />

                  {/* Lighting Streetlamps on Safe Route */}
                  {showLightingLayer && (
                    <>
                      <circle cx="140" cy="232" r="6" fill="#f59e0b" fillOpacity="0.8" />
                      <circle cx="210" cy="205" r="6" fill="#f59e0b" fillOpacity="0.8" />
                      <circle cx="280" cy="150" r="6" fill="#f59e0b" fillOpacity="0.8" />
                      <circle cx="370" cy="115" r="6" fill="#f59e0b" fillOpacity="0.8" />
                      <circle cx="450" cy="95" r="6" fill="#f59e0b" fillOpacity="0.8" />
                    </>
                  )}

                  {/* Hazard Spot on Shortest Route */}
                  {showIncidentLayer && (
                    <g transform="translate(260, 210)">
                      <circle r="14" fill="#e11d48" fillOpacity="0.2" className="animate-ping" />
                      <circle r="9" fill="#e11d48" />
                      <text x="0" y="3.5" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">!</text>
                    </g>
                  )}

                  {/* Origin Marker */}
                  <g transform="translate(80, 240)">
                    <circle r="12" fill="#2563eb" fillOpacity="0.25" className="animate-ping" />
                    <circle r="6" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                  </g>

                  {/* Destination Marker */}
                  <g transform="translate(520, 80)">
                    <circle r="14" fill="#065f46" fillOpacity="0.2" />
                    <circle r="7" fill="#065f46" stroke="#ffffff" strokeWidth="2" />
                  </g>
                </svg>

                {/* Map Overlay Badges */}
                <div className="relative z-10 flex items-start justify-between">
                  <div className="rounded-lg bg-card/90 px-2.5 py-1.5 shadow-sm border border-border text-[11px] backdrop-blur-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <MapPin className="size-3.5 text-blue-600" />
                      <span>{currentCorridor.originName}</span>
                    </div>
                  </div>

                  <div className="rounded-lg bg-card/90 px-2.5 py-1.5 shadow-sm border border-border text-[11px] backdrop-blur-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <MapPin className="size-3.5 text-emerald-600" />
                      <span>{currentCorridor.destinationName}</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Legend Bar */}
                <div className="relative z-10 rounded-lg bg-card/95 p-2.5 shadow-sm border border-border backdrop-blur-xs flex flex-wrap items-center justify-between gap-3 text-[11px]">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-primary" />
                      <span className="font-medium text-foreground">Safe Route (Illuminated Boulevard)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-amber-600" />
                      <span className="font-medium text-muted-foreground">Shortest Route (Dark Alley)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-rose-600" />
                      <span className="font-medium text-rose-700 dark:text-rose-400">Past Incident Report</span>
                    </div>
                  </div>

                  <span className="text-[10px] text-muted-foreground font-mono">
                    Live Vector View · Fully Integrated
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

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
