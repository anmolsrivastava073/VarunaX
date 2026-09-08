"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CaseRecord, PipelineStage } from "@/types/maritime";
import { Satellite, ZoomIn, ZoomOut } from "lucide-react";
import SystemProcessingLoader from "@/components/live/SystemProcessingLoader";

/* ─────────────────────────────────────────────
   BASEMAPS (free, no API key, no watermark)
───────────────────────────────────────────── */
const BASEMAP_DEFS = {
  satellite: {
    label: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics",
  },
  streets: {
    label: "Streets",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
  },
} as const;
type BasemapKey = keyof typeof BASEMAP_DEFS;

/* ─────────────────────────────────────────────
   Deterministic seeded RNG (mulberry32).
   Every case gets its own irregular polygon shape
   (seeded by case id), but the shape is stable
   across re-renders instead of re-randomizing.
───────────────────────────────────────────── */
function hashStringToSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h ^ (h >>> 16)) >>> 0;
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generates an irregular slick polygon around a hard-coded lat/lng,
 * seeded by the case id so every test case gets a genuinely DIFFERENT
 * silhouette — not just the same blob rotated/rescaled — while still
 * being the SAME shape for that case on every re-render.
 *
 * Variety comes from three independent, per-case-random ingredients:
 *  - a random set of angular harmonics (lobes/points), so some cases
 *    come out smooth-ish, others clearly star-shaped or multi-lobed
 *  - a random elongation factor + stretch direction, so some cases
 *    read as long wind-drawn streaks and others as compact blobs
 *  - fine per-vertex noise, so edges look hand-drawn / SAR-organic
 *    rather than a perfect mathematical curve
 *
 * Returns a closed ring of [lng, lat] pairs (GeoJSON order).
 */
export function generateRandomSlickPolygon(
  seedKey: string,
  lat: number,
  lng: number,
  areaKm2: number
): [number, number][] {
  const rand = mulberry32(hashStringToSeed(seedKey));

  const vertexCount = 40; // fine resolution; the harmonics below define the actual silhouette
  const baseRadiusKm = Math.sqrt(Math.max(areaKm2, 4) / Math.PI) * 1.15;
  const kmToLatDeg = 1 / 110.574;
  const kmToLngDeg = 1 / (111.32 * Math.cos((lat * Math.PI) / 180));

  // Elongation: real SAR slicks are streaks drawn out by wind/current,
  // not circles — vary how stretched, and in which direction, per case.
  const elongation = 1.3 + rand() * 2.0; // 1.3x - 3.3x
  const stretchAngle = rand() * Math.PI * 2;
  const cosS = Math.cos(stretchAngle);
  const sinS = Math.sin(stretchAngle);

  // 1-4 random harmonics give each case its own lobed/pointed/smooth character
  const candidateFreqs = [2, 3, 4, 5, 6];
  const harmonics = candidateFreqs
    .filter(() => rand() > 0.45)
    .map((freq) => ({ freq, amp: 0.08 + rand() * 0.24, phase: rand() * Math.PI * 2 }));
  if (harmonics.length === 0) {
    harmonics.push({ freq: 3, amp: 0.18, phase: rand() * Math.PI * 2 });
  }

  // A finer, higher-frequency octave on top of the harmonics above —
  // real SAR-detected sheen edges are jagged at two scales at once
  // (a broad lobed outline, plus small ragged nicks along it), not
  // just one smooth wobble.
  const fineFreq = 9 + Math.floor(rand() * 5); // 9-13
  const finePhase = rand() * Math.PI * 2;
  const fineAmp = 0.04 + rand() * 0.05;

  // Head-to-tail taper: real spills are thick near the source and thin
  // out into a drift streak, so the silhouette should NOT be symmetric
  // along its own elongation axis. tailBias picks which end is the
  // thin tail (0 = fully round, up to 0.6 = a pronounced comet shape).
  const tailBias = rand() * 0.6;

  const rotationOffset = rand() * Math.PI * 2;

  const pts: [number, number][] = [];
  for (let i = 0; i < vertexCount; i++) {
    const angle = (i / vertexCount) * Math.PI * 2;

    let radiusFactor = 1;
    for (const h of harmonics) radiusFactor += h.amp * Math.cos(h.freq * angle + h.phase);
    radiusFactor += fineAmp * Math.cos(fineFreq * angle + finePhase); // fine ragged edge
    radiusFactor += (rand() - 0.5) * 0.06; // rough, hand-drawn edge noise

    // Project this vertex onto the stretch axis (before stretching) to
    // know whether it's on the "head" or "tail" side, then taper it.
    const along = Math.cos(angle + rotationOffset - stretchAngle); // -1 (tail) .. +1 (head)
    radiusFactor *= 1 - tailBias * Math.max(0, -along) * 0.5;

    const r = baseRadiusKm * radiusFactor;
    const x = r * Math.cos(angle + rotationOffset);
    const y = r * Math.sin(angle + rotationOffset);

    // Stretch along the case's own random axis
    const xs = x * cosS + y * sinS;
    const ys = -x * sinS + y * cosS;
    const xsStretched = xs * elongation;
    const xr = xsStretched * cosS - ys * sinS;
    const yr = xsStretched * sinS + ys * cosS;

    const dLng = xr * kmToLngDeg;
    const dLat = yr * kmToLatDeg;
    pts.push([Number((lng + dLng).toFixed(5)), Number((lat + dLat).toFixed(5))]);
  }
  pts.push(pts[0]); // close the ring
  return pts;
}

/* ─────────────────────────────────────────────
   Netted / crosshatch fills — one per system stage.
   Leaflet's SVG renderer writes whatever string you give
   `fillColor` straight into the path's fill="" attribute, so
   fillColor: "url(#some-pattern-id)" works as long as that
   pattern actually exists in the map's <svg><defs>. We inject
   all three once, right after the first polygon forces Leaflet
   to create its SVG root — cheap, and avoids re-injecting per
   case/per re-render.

   system1 (detection)   → white net, on a dark backing
   system2 (drift model)  → blue net
   system3 (attribution) / completed → red net (unchanged from before)
───────────────────────────────────────────── */
const NET_PATTERNS = {
  system1: { id: "netted-slick-system1", backing: "#0f172a", backingOpacity: "0.3", line: "#f8fafc" },
  system2: { id: "netted-slick-system2", backing: "#0f172a", backingOpacity: "0.3", line: "#3b82f6" },
  system3: { id: "netted-slick-system3", backing: "#7f1d1d", backingOpacity: "0.35", line: "#ef4444" },
} as const;
type NetKey = keyof typeof NET_PATTERNS;

/** Which netted pattern a given pipeline stage should render as. */
function patternForStage(stage: PipelineStage | "idle" | undefined): NetKey {
  switch (stage) {
    case "system1_detection":
      return "system1";
    case "system2_drift":
      return "system2";
    case "system3_attribution":
    case "completed":
    case "idle":
    default:
      return "system3";
  }
}

function ensureNettedPatterns(svg: SVGSVGElement | null | undefined) {
  if (!svg) return;

  const NS = "http://www.w3.org/2000/svg";
  let defs = svg.querySelector("defs");
  if (!defs) {
    defs = document.createElementNS(NS, "defs");
    svg.insertBefore(defs, svg.firstChild);
  }

  (Object.keys(NET_PATTERNS) as NetKey[]).forEach((key) => {
    const def = NET_PATTERNS[key];
    if (svg.querySelector(`#${def.id}`)) return;

    const pattern = document.createElementNS(NS, "pattern");
    pattern.setAttribute("id", def.id);
    pattern.setAttribute("width", "10");
    pattern.setAttribute("height", "10");
    pattern.setAttribute("patternUnits", "userSpaceOnUse");

    const rect = document.createElementNS(NS, "rect");
    rect.setAttribute("width", "10");
    rect.setAttribute("height", "10");
    rect.setAttribute("fill", def.backing);
    rect.setAttribute("fill-opacity", def.backingOpacity);

    // Two diagonals crossing = a "net" rather than one-directional hatching
    const netLines = document.createElementNS(NS, "path");
    netLines.setAttribute("d", "M0,0 L10,10 M10,0 L0,10");
    netLines.setAttribute("stroke", def.line);
    netLines.setAttribute("stroke-width", "1.4");
    netLines.setAttribute("stroke-opacity", "0.95");

    pattern.appendChild(rect);
    pattern.appendChild(netLines);
    defs!.appendChild(pattern);
  });
}

/* ─────────────────────────────────────────────
   Geo helpers
───────────────────────────────────────────── */
function ringToLatLngs(ring: [number, number][]): L.LatLngExpression[] {
  return ring.map(([lng, lat]) => [lat, lng]);
}

/* ─────────────────────────────────────────────
   Component props — kept identical to the old
   MapLibreMap so this is a drop-in replacement.
───────────────────────────────────────────── */
interface LeafletMapProps {
  caseData?: CaseRecord;
  cases?: CaseRecord[];
  stage?: PipelineStage | "idle";
  interactiveMode?: "overview" | "singleCase" | "liveSimulation";
  onSelectCase?: (caseId: string) => void;
  height?: string;
  loadingStage?: PipelineStage | "completed" | null;
  loadingDurationMs?: number;
  onProcessingComplete?: () => void;
}

// Hard-coded fallback center (Mumbai Offshore Basin test case)
const FALLBACK_CENTER: [number, number] = [18.945, 71.95];

export default function LeafletMap({
  caseData,
  cases = [],
  stage = "idle",
  interactiveMode = "singleCase",
  onSelectCase,
  height = "520px",
  loadingStage = null,
  loadingDurationMs = 1200,
  onProcessingComplete,
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const slickGroupRef = useRef<L.LayerGroup | null>(null);
  const lastCameraKeyRef = useRef<string>("");
  const lastStageRef = useRef<PipelineStage | "idle" | undefined>(undefined);
  const pulseTimeoutRef = useRef<number | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [basemap, setBasemap] = useState<BasemapKey>("satellite");
  const [showBasemapPanel, setShowBasemapPanel] = useState(false);
  const [cursorLL, setCursorLL] = useState<{ lat: number; lng: number } | null>(null);

  /* ── Init map once ── */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initialCenter: [number, number] = caseData
      ? [caseData.coordinates.lat, caseData.coordinates.lng]
      : cases.length > 0
      ? [cases[0].coordinates.lat, cases[0].coordinates.lng]
      : FALLBACK_CENTER;

    const map = L.map(containerRef.current, {
      center: initialCenter,
      zoom: 4.8,
      zoomControl: false,
      attributionControl: true,
    });

    const tiles = L.tileLayer(BASEMAP_DEFS.satellite.url, {
      attribution: BASEMAP_DEFS.satellite.attribution,
      maxZoom: 19,
    }).addTo(map);
    tileLayerRef.current = tiles;

    slickGroupRef.current = L.layerGroup().addTo(map);

    map.on("mousemove", (e) => setCursorLL({ lat: e.latlng.lat, lng: e.latlng.lng }));

    mapRef.current = map;
    setMapReady(true);

    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      slickGroupRef.current = null;
      tileLayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Swap basemap ── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    if (tileLayerRef.current) map.removeLayer(tileLayerRef.current);
    const def = BASEMAP_DEFS[basemap];
    const tiles = L.tileLayer(def.url, { attribution: def.attribution, maxZoom: 19 }).addTo(map);
    tiles.bringToBack();
    tileLayerRef.current = tiles;
  }, [basemap, mapReady]);

  /* ── Render every case's slick polygon in the pattern matching its
        current system stage, and move the camera only on a genuine
        case-set or stage change (see below) — not on every re-render ── */
  useEffect(() => {
    const map = mapRef.current;
    const group = slickGroupRef.current;
    if (!map || !group || !mapReady) return;

    group.clearLayers();

    const casesToRender: CaseRecord[] =
      interactiveMode === "overview" && cases.length > 0 ? cases : caseData ? [caseData] : [];

    if (casesToRender.length === 0) return;

    const allBounds: L.LatLngExpression[] = [];

    // In overview mode we're showing many already-processed cases at once,
    // so they all render in their finalized (system3/red) pattern. In
    // singleCase/liveSimulation mode there's one case walking through the
    // pipeline, so the pattern follows the current `stage` prop.
    const patternKey: NetKey = interactiveMode === "overview" ? "system3" : patternForStage(stage);
    const patternDef = NET_PATTERNS[patternKey];

    casesToRender.forEach((c) => {
      const existingRing =
        c.system1.slickPolygon?.geometry?.coordinates?.[0] &&
        c.system1.slickPolygon.geometry.coordinates[0].length >= 4
          ? (c.system1.slickPolygon.geometry.coordinates[0] as [number, number][])
          : generateRandomSlickPolygon(c.id, c.coordinates.lat, c.coordinates.lng, c.system1.areaKm2);

      const latlngs = ringToLatLngs(existingRing);
      allBounds.push(...latlngs);

      const polygon = L.polygon(latlngs, {
        color: patternDef.line,
        weight: 2.5,
        opacity: 0.95,
        fillColor: `url(#${patternDef.id})`,
        fillOpacity: 1,
      }).addTo(group);

      // Force-create Leaflet's SVG root (if this is the first vector
      // layer) then inject all three crosshatch <pattern>s into its
      // <defs> (idempotent — skips any that already exist).
      ensureNettedPatterns(
        (polygon as unknown as { _renderer?: { _container?: SVGSVGElement } })._renderer?._container
      );

      polygon.bindPopup(
        `<div style="font:12px/1.4 sans-serif;min-width:190px">
           <div style="font-weight:700;margin-bottom:2px">${c.title}</div>
           <div>${c.region}</div>
           <div><b>Area:</b> ${c.system1.areaKm2} km²</div>
           <div><b>Oil Lookalike Confidence:</b> ${c.system1.oilLookalikeConfidence}%</div>
           <div style="color:#94a3b8;font-size:10px;margin-top:2px">${c.system1.satellite} · ${c.system1.polarization}</div>
         </div>`
      );
      polygon.on("click", () => onSelectCase?.(c.id));

      L.circleMarker([c.coordinates.lat, c.coordinates.lng], {
        radius: 5,
        color: patternDef.line,
        weight: 2,
        fillColor: "#ffffff",
        fillOpacity: 1,
      })
        .addTo(group)
        .bindPopup(
          `<div style="font:12px/1.4 sans-serif">
             <div style="font-weight:700">SAR Slick Centroid</div>
             <div>${c.coordinates.lat.toFixed(4)}°N, ${c.coordinates.lng.toFixed(4)}°E</div>
           </div>`
        )
        .on("click", () => onSelectCase?.(c.id));
    });

    if (allBounds.length > 0) {
      const bounds = L.latLngBounds(allBounds);
      const caseKey = casesToRender
        .map((c) => c.id)
        .sort()
        .join(",");
      const cameraKey = `${interactiveMode}|${caseKey}`;
      const isNewCaseSet = cameraKey !== lastCameraKeyRef.current;
      const isStageChangeOnly = !isNewCaseSet && interactiveMode !== "overview" && stage !== lastStageRef.current;

      lastCameraKeyRef.current = cameraKey;
      lastStageRef.current = stage;

      if (pulseTimeoutRef.current !== null) {
        window.clearTimeout(pulseTimeoutRef.current);
        pulseTimeoutRef.current = null;
      }

      if (isStageChangeOnly) {
        // Moving from one system's stage to the next: give it a visible
        // "camera reacting" beat — pull back briefly, then settle back
        // onto the same polygon — rather than silently re-fitting.
        const pulledBackZoom = Math.max(map.getZoom() - 2, map.getMinZoom(), 2);
        map.flyTo(map.getCenter(), pulledBackZoom, { duration: 0.35 });
        pulseTimeoutRef.current = window.setTimeout(() => {
          map.flyToBounds(bounds, { padding: [70, 70], maxZoom: 13, duration: 0.75 });
          pulseTimeoutRef.current = null;
        }, 380);
      } else if (isNewCaseSet) {
        // A genuinely new case (or case list) to look at — fit to it once.
        // No pulse needed here; this is the normal "load a new thing" fit.
        map.fitBounds(bounds, {
          padding: [70, 70],
          maxZoom: interactiveMode === "overview" ? 8 : 13,
        });
      }
      // Otherwise: same case(s), same stage — this effect re-ran only
      // because of an unrelated prop/reference change, so leave the
      // camera exactly where the user left it (don't fight manual zoom).
    }

    return () => {
      if (pulseTimeoutRef.current !== null) {
        window.clearTimeout(pulseTimeoutRef.current);
        pulseTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, interactiveMode, cases, caseData, stage]);

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();

  const acqLabel = caseData
    ? new Date(caseData.system1.acquisitionTimestamp).toUTCString().replace("GMT", "UTC")
    : "";

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border border-[#7ee0cf]/60 shadow-sm bg-slate-900"
      style={{ height, minHeight: height }}
    >
      <div ref={containerRef} style={{ width: "100%", height: "100%", minHeight: height }} />

      {/* ── Basemap switcher + zoom controls ── */}
      <div className="absolute top-3 left-3 z-[500] flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setShowBasemapPanel((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 border border-[#7ee0cf] shadow-sm text-xs font-semibold text-slate-800 hover:bg-[#e4f7f3] transition-colors"
          >
            <Satellite className="w-3.5 h-3.5 text-[#007ceb]" />
            <span>{BASEMAP_DEFS[basemap].label}</span>
          </button>
          {showBasemapPanel && (
            <div className="absolute top-full mt-1 bg-white/98 border border-[#7ee0cf] rounded-xl shadow-lg overflow-hidden min-w-[140px] z-[600]">
              {(Object.keys(BASEMAP_DEFS) as BasemapKey[]).map((k) => (
                <button
                  key={k}
                  onClick={() => {
                    setBasemap(k);
                    setShowBasemapPanel(false);
                  }}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-xs font-medium transition-colors text-left ${
                    k === basemap ? "bg-[#e4f7f3] text-[#005bb5] font-semibold" : "text-slate-600 hover:bg-[#f5fdfa]"
                  }`}
                >
                  {BASEMAP_DEFS[k].label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleZoomIn}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/95 border border-[#7ee0cf] shadow-sm text-xs font-semibold text-slate-800 hover:bg-[#e4f7f3] transition-colors"
        >
          <ZoomIn className="w-3.5 h-3.5 text-[#007ceb]" />
        </button>
        <button
          onClick={handleZoomOut}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/95 border border-[#7ee0cf] shadow-sm text-xs font-semibold text-slate-800 hover:bg-[#e4f7f3] transition-colors"
        >
          <ZoomOut className="w-3.5 h-3.5 text-[#007ceb]" />
        </button>
      </div>

      {/* ── Cursor coordinates ── */}
      {cursorLL && (
        <div className="absolute top-3 right-3 z-[500] bg-black/75 backdrop-blur-sm border border-slate-700 rounded-lg px-2.5 py-1 text-[10px] font-mono text-cyan-300 shadow-sm">
          {cursorLL.lat.toFixed(5)}°N &nbsp;{cursorLL.lng.toFixed(5)}°E
        </div>
      )}

      {/* ── Acquisition / attribution bar ── */}
      {caseData && (
        <div className="absolute bottom-3 left-3 right-3 z-[500] bg-[#0D2B45]/95 text-[10px] text-[#7ee0cf] rounded-lg px-3 py-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 border border-[#1E5A6E]/60 shadow-lg backdrop-blur-sm">
          <span className="font-bold text-white uppercase">{caseData.system1.satellite}</span>
          <span>
            <strong className="text-slate-300">UTC:</strong> {acqLabel}
          </span>
          <span>
            <strong className="text-slate-300">Coords:</strong> {caseData.coordinates.lat.toFixed(3)}°N,{" "}
            {caseData.coordinates.lng.toFixed(3)}°E
          </span>
          <span className="text-[#00bcd4]">EPSG:4326 · WGS 84</span>
        </div>
      )}

      {/* ── Processing loader overlay ── */}
      {loadingStage && (
        <div className="absolute inset-0 z-[700] flex items-center justify-center p-4 bg-slate-950/20 backdrop-blur-[1.5px] pointer-events-none transition-all">
          <div className="pointer-events-auto max-w-sm sm:max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <SystemProcessingLoader stage={loadingStage} durationMs={loadingDurationMs} onComplete={onProcessingComplete} />
          </div>
        </div>
      )}
    </div>
  );
}