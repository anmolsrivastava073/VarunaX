"use client";

import React, { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { CaseRecord, PipelineStage } from "@/types/maritime";
import { Satellite, ZoomIn, ZoomOut } from "lucide-react";
import SystemProcessingLoader from "@/components/live/SystemProcessingLoader";

/* ─────────────────────────────────────────────
   BASEMAP CONFIGS (100% Free, No Watermark, No API Key, Clean Labels, No Emojis)
───────────────────────────────────────────── */
const BASEMAPS = {
  satellite: {
    label: "Satellite",
    tiles: [
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    ],
    attribution: "Esri World Imagery",
  },
  light: {
    label: "Navigation Light",
    tiles: [
      "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
    ],
    attribution: "OpenStreetMap contributors, CARTO",
  },
  dark: {
    label: "Maritime Dark",
    tiles: [
      "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    ],
    attribution: "Esri, HERE, Garmin",
  },
  ocean: {
    label: "Ocean Bathymetry",
    tiles: [
      "https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}",
    ],
    attribution: "Esri, GEBCO, NOAA",
  },
} as const;

type BasemapKey = keyof typeof BASEMAPS;

/* ─────────────────────────────────────────────
   PALSAR OFFSETS & ORGANIC SLICK GENERATOR
───────────────────────────────────────────── */
const PALSAR_OFFSETS: [number, number][] = [
  [0.1037, 0.5],
  [0.2012, 0.5],
  [0.2378, 0.4512],
  [0.1402, 0.3902],
  [0.0549, 0.3049],
  [0.1159, 0.2561],
  [0.1037, 0.1585],
  [0.0793, 0.061],
  [0.0793, -0.0488],
  [0.0183, -0.1098],
  [-0.0671, -0.1951],
  [-0.0183, -0.2561],
  [0.0061, -0.3171],
  [-0.0549, -0.4146],
  [-0.1524, -0.5],
  [-0.2378, -0.5],
  [-0.2378, -0.4024],
  [-0.2012, -0.3171],
  [-0.2134, -0.2317],
  [-0.1768, -0.1341],
  [-0.0915, -0.0244],
  [-0.128, 0.0244],
  [-0.0793, 0.122],
  [-0.0671, 0.2073],
  [-0.1646, 0.2073],
  [-0.0793, 0.3049],
  [-0.0061, 0.3902],
  [0.1037, 0.4878],
  [0.1037, 0.5],
];

export function generateOrganicSlickRing(
  lat: number,
  lng: number,
  areaKm2: number,
  angleDeg = 45
): [number, number][] {
  const scale = 0.0105 * Math.sqrt(Math.max(areaKm2, 5));
  const kmToLng = 1 / Math.cos((lat * Math.PI) / 180);
  const rad = (angleDeg * Math.PI) / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);

  return PALSAR_OFFSETS.map(([dx, dy]) => {
    const rx = dx * cosA - dy * sinA;
    const ry = dx * sinA + dy * cosA;
    return [
      Number((lng + rx * scale * kmToLng * 1.3).toFixed(4)),
      Number((lat + ry * scale).toFixed(4)),
    ];
  });
}

/* ─────────────────────────────────────────────
   CREATE RED CROSSHATCH NETTING PATTERN IMAGE
   Generated using Uint8Array to avoid browser canvas RangeError
───────────────────────────────────────────── */
function createRedNettingPattern(): { width: number; height: number; data: Uint8Array } {
  const size = 16;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const isNetLine =
        x === y ||
        x + y === size - 1 ||
        x === 0 ||
        y === 0 ||
        x === size - 1 ||
        y === size - 1;

      if (isNetLine) {
        data[idx] = 239;     // R (Bright Red)
        data[idx + 1] = 68;  // G
        data[idx + 2] = 68;  // B
        data[idx + 3] = 245; // High Alpha
      } else {
        data[idx] = 185;     // Semi-transparent interior red
        data[idx + 1] = 28;
        data[idx + 2] = 28;
        data[idx + 3] = 45;
      }
    }
  }
  return { width: size, height: size, data };
}

/* ─────────────────────────────────────────────
   GEO HELPERS
───────────────────────────────────────────── */
function getBounds(coords: [number, number][]) {
  if (!coords || coords.length === 0) {
    return { minLng: 71, maxLng: 73, minLat: 18, maxLat: 20 };
  }
  const lngs = coords.map((c) => c[0]);
  const lats = coords.map((c) => c[1]);
  return {
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
  };
}

/* ─────────────────────────────────────────────
   COMPONENT PROPS
───────────────────────────────────────────── */
interface MapLibreMapProps {
  caseData?: CaseRecord;
  cases?: CaseRecord[];
  stage?: PipelineStage | "idle";
  interactiveMode?: "overview" | "singleCase" | "liveSimulation";
  onSelectCase?: (caseId: string) => void;
  height?: string;
  showLayerControls?: boolean;
  loadingStage?: PipelineStage | "completed" | null;
  loadingDurationMs?: number;
  onProcessingComplete?: () => void;
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function MapLibreMap({
  caseData,
  cases = [],
  stage = "idle",
  interactiveMode = "singleCase",
  onSelectCase,
  height = "520px",
  loadingStage = null,
  loadingDurationMs = 1200,
  onProcessingComplete,
}: MapLibreMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  // Default basemap is Satellite
  const [basemap, setBasemap] = useState<BasemapKey>("satellite");
  const [cursorLL, setCursorLL] = useState<{ lng: number; lat: number } | null>(null);
  const [showBasemapPanel, setShowBasemapPanel] = useState(false);

  const defaultCenter: [number, number] = caseData
    ? [caseData.coordinates.lng, caseData.coordinates.lat]
    : cases.length > 0
    ? [cases[0].coordinates.lng, cases[0].coordinates.lat]
    : [71.95, 18.945];

  // Initially zoomed out to show full regional perspective
  const defaultZoom = 4.8;

  /* ── Init MapLibre Map ── */
  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const sourcesObj: Record<string, maplibregl.SourceSpecification> = {};
    const layersArr: maplibregl.LayerSpecification[] = [];

    (Object.keys(BASEMAPS) as BasemapKey[]).forEach((key) => {
      sourcesObj[`bm-${key}`] = {
        type: "raster",
        tiles: BASEMAPS[key].tiles as unknown as string[],
        tileSize: 256,
        attribution: BASEMAPS[key].attribution,
      };
      layersArr.push({
        id: `bm-${key}-layer`,
        type: "raster",
        source: `bm-${key}`,
        layout: { visibility: key === "satellite" ? "visible" : "none" },
      });
    });

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: sourcesObj,
        layers: layersArr,
      },
      center: defaultCenter,
      zoom: defaultZoom,
      pitch: 15,
      bearing: 0,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: "metric" }), "bottom-right");

    map.on("mousemove", (e) => {
      setCursorLL({ lng: e.lngLat.lng, lat: e.lngLat.lat });
    });

    map.on("load", () => {
      if (!map.hasImage("red-netted-overlay")) {
        map.addImage("red-netted-overlay", createRedNettingPattern(), { pixelRatio: 1 });
      }
      mapRef.current = map;
      setMapLoaded(true);
      map.resize();
    });

    const ro = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });
    ro.observe(containerRef.current);

    const t1 = setTimeout(() => map.resize(), 100);
    const t2 = setTimeout(() => map.resize(), 500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Switch basemap ── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    (Object.keys(BASEMAPS) as BasemapKey[]).forEach((k) => {
      if (map.getLayer(`bm-${k}-layer`)) {
        map.setLayoutProperty(
          `bm-${k}-layer`,
          "visibility",
          k === basemap ? "visible" : "none"
        );
      }
    });
  }, [basemap, mapLoaded]);

  /* ── Stage camera animation: initially zoomed out, zooms when moving to systems ── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !caseData) return;

    // Initially zoomed out
    if (stage === "idle") {
      map.flyTo({
        center: [caseData.coordinates.lng, caseData.coordinates.lat],
        zoom: 4.8,
        pitch: 15,
        bearing: 0,
        speed: 1.0,
      });
      return;
    }

    const ring =
      caseData.system1.slickPolygon?.geometry?.coordinates?.[0] &&
      caseData.system1.slickPolygon.geometry.coordinates[0].length >= 5
        ? (caseData.system1.slickPolygon.geometry.coordinates[0] as [number, number][])
        : generateOrganicSlickRing(
            caseData.coordinates.lat,
            caseData.coordinates.lng,
            caseData.system1.areaKm2
          );

    if (stage === "system1_detection") {
      const b = getBounds(ring);
      map.fitBounds(
        [
          [b.minLng - 0.04, b.minLat - 0.04],
          [b.maxLng + 0.04, b.maxLat + 0.04],
        ],
        { padding: 80, speed: 1.2, pitch: 25 }
      );
    } else if (stage === "system2_drift") {
      const all = [...ring, ...caseData.system2.driftPath];
      const b = getBounds(all as [number, number][]);
      map.fitBounds(
        [
          [b.minLng - 0.06, b.minLat - 0.06],
          [b.maxLng + 0.06, b.maxLat + 0.06],
        ],
        { padding: 80, speed: 1.0, pitch: 30 }
      );
    } else if (stage === "system3_attribution" || stage === "completed") {
      const aisCoords = (caseData.system3.primarySuspect?.aisTrack ?? []).map(
        (w) => [w.lng, w.lat] as [number, number]
      );
      const all = [...ring, ...caseData.system2.driftPath, ...aisCoords];
      const b = getBounds(all as [number, number][]);
      map.fitBounds(
        [
          [b.minLng - 0.1, b.minLat - 0.1],
          [b.maxLng + 0.1, b.maxLat + 0.1],
        ],
        { padding: 100, speed: 0.9, pitch: 35 }
      );
    }
  }, [stage, mapLoaded, caseData]);

  /* ── Center on case when selected in idle state ── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !caseData) return;
    if (stage === "idle") {
      map.flyTo({
        center: [caseData.coordinates.lng, caseData.coordinates.lat],
        zoom: 4.8,
        pitch: 15,
        speed: 1.1,
      });
    }
  }, [caseData?.id, mapLoaded, stage]);

  /* ── Render GIS layers ── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    /* ─── OVERVIEW MODE: SHOW ALL CASES FLOATING ON THE MAP ─── */
    if (interactiveMode === "overview" && cases.length > 0) {
      const allSlicksFeatures = cases.map((c) => {
        const ring =
          c.system1.slickPolygon?.geometry?.coordinates?.[0] &&
          c.system1.slickPolygon.geometry.coordinates[0].length >= 5
            ? (c.system1.slickPolygon.geometry.coordinates[0] as [number, number][])
            : generateOrganicSlickRing(
                c.coordinates.lat,
                c.coordinates.lng,
                c.system1.areaKm2
              );

        return {
          type: "Feature" as const,
          geometry: {
            type: "Polygon" as const,
            coordinates: [ring],
          },
          properties: {
            id: c.id,
            title: c.title,
            region: c.region,
            severity: c.severity,
            area: c.system1.areaKm2,
            confidence: c.system1.oilLookalikeConfidence,
          },
        };
      });

      const allCentroidsFeatures = cases.map((c) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [c.coordinates.lng, c.coordinates.lat] as [number, number],
        },
        properties: {
          id: c.id,
          title: c.title,
          region: c.region,
          severity: c.severity,
          area: c.system1.areaKm2,
        },
      }));

      if (map.getSource("all-cases-slicks-source")) {
        (map.getSource("all-cases-slicks-source") as maplibregl.GeoJSONSource).setData({
          type: "FeatureCollection",
          features: allSlicksFeatures,
        });
      } else {
        map.addSource("all-cases-slicks-source", {
          type: "geojson",
          data: { type: "FeatureCollection", features: allSlicksFeatures },
        });

        map.addLayer({
          id: "all-cases-slick-fill",
          type: "fill",
          source: "all-cases-slicks-source",
          paint: {
            "fill-color": [
              "match",
              ["get", "severity"],
              "critical",
              "#dc2626",
              "high",
              "#00bcd4",
              "moderate",
              "#81ac19",
              "#007ceb",
            ],
            "fill-opacity": 0.75,
          },
        });

        map.addLayer({
          id: "all-cases-slick-line",
          type: "line",
          source: "all-cases-slicks-source",
          paint: {
            "line-color": "#ffffff",
            "line-width": 2,
            "line-opacity": 0.9,
          },
        });

        map.on("click", "all-cases-slick-fill", (e) => {
          const props = e.features?.[0]?.properties as {
            id: string;
            title: string;
            region: string;
            area: number;
            confidence: number;
          };
          if (!props) return;
          new maplibregl.Popup({ maxWidth: "280px" })
            .setLngLat(e.lngLat)
            .setHTML(
              `<div class="space-y-1.5 text-xs p-1 font-sans">
                <div class="font-bold text-slate-800 text-sm mb-1">${props.title}</div>
                <div class="text-slate-600"><b>Region:</b> ${props.region}</div>
                <div class="text-slate-600"><b>Slick Area:</b> ${props.area} km²</div>
                <div class="text-slate-600"><b>SAR Confidence:</b> ${props.confidence}%</div>
                <div class="pt-1.5">
                  <span class="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold">
                    Click incident to inspect dossier
                  </span>
                </div>
              </div>`
            )
            .addTo(map);

          if (onSelectCase && props.id) {
            onSelectCase(props.id);
          }
        });

        map.on("mouseenter", "all-cases-slick-fill", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "all-cases-slick-fill", () => {
          map.getCanvas().style.cursor = "";
        });
      }

      if (map.getSource("cases-source")) {
        (map.getSource("cases-source") as maplibregl.GeoJSONSource).setData({
          type: "FeatureCollection",
          features: allCentroidsFeatures,
        });
      } else {
        map.addSource("cases-source", {
          type: "geojson",
          data: { type: "FeatureCollection", features: allCentroidsFeatures },
        });

        map.addLayer({
          id: "cases-halo",
          type: "circle",
          source: "cases-source",
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 16, 10, 26],
            "circle-color": [
              "match",
              ["get", "severity"],
              "critical",
              "#dc2626",
              "high",
              "#00bcd4",
              "moderate",
              "#81ac19",
              "#007ceb",
            ],
            "circle-opacity": 0.25,
          },
        });

        map.addLayer({
          id: "cases-circles",
          type: "circle",
          source: "cases-source",
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 6, 10, 10],
            "circle-color": "#ffffff",
            "circle-stroke-width": 3,
            "circle-stroke-color": [
              "match",
              ["get", "severity"],
              "critical",
              "#dc2626",
              "high",
              "#00bcd4",
              "moderate",
              "#81ac19",
              "#007ceb",
            ],
          },
        });

        map.on("click", "cases-circles", (e) => {
          const props = e.features?.[0]?.properties as { id: string };
          if (onSelectCase && props?.id) onSelectCase(props.id);
        });
      }
      return;
    }

    /* ─── SINGLE CASE MODE / PIPELINE DEMO: STAGE-COLORED FLOATING SLICK ─── */
    if (!caseData) return;

    const isIdle = stage === "idle";
    const showS1 = isIdle || ["system1_detection", "system2_drift", "system3_attribution", "completed"].includes(stage);
    const showS2 = ["system2_drift", "system3_attribution", "completed"].includes(stage);
    const showS3 = ["system3_attribution", "completed"].includes(stage);

    const ring =
      caseData.system1.slickPolygon?.geometry?.coordinates?.[0] &&
      caseData.system1.slickPolygon.geometry.coordinates[0].length >= 5
        ? (caseData.system1.slickPolygon.geometry.coordinates[0] as [number, number][])
        : generateOrganicSlickRing(
            caseData.coordinates.lat,
            caseData.coordinates.lng,
            caseData.system1.areaKm2
          );

    const activePolygonFeature = {
      type: "Feature" as const,
      geometry: {
        type: "Polygon" as const,
        coordinates: [ring],
      },
      properties: caseData.system1.slickPolygon?.properties || {},
    };

    /* ─── STAGE-BASED COLORING ───
       Idle / Detection:       BLACK fill (#0a0a0a)
       System 2 (Drift):       GRAY fill (#52525b)
       System 3 (Attribution): RED fill (#b91c1c) with RED NETTED OVERLAY
    ───────────────────────────── */
    let slickFillColor = "#0a0a0a";
    let slickFillOpacity = 0.85;
    let slickLineColor = "#262626";
    let isNettedOverlayVisible = false;

    if (stage === "system1_detection" || stage === "idle") {
      slickFillColor = "#0a0a0a"; // Black
      slickFillOpacity = 0.85;
      slickLineColor = "#262626";
      isNettedOverlayVisible = false;
    } else if (stage === "system2_drift") {
      slickFillColor = "#52525b"; // Gray
      slickFillOpacity = 0.72;
      slickLineColor = "#94a3b8";
      isNettedOverlayVisible = false;
    } else if (stage === "system3_attribution" || stage === "completed") {
      slickFillColor = "#b91c1c"; // Red
      slickFillOpacity = 0.70;
      slickLineColor = "#ef4444";
      isNettedOverlayVisible = true; // Red netted overlay active
    }

    const slickGeoJSON = {
      type: "FeatureCollection" as const,
      features: [activePolygonFeature],
    };

    if (map.getSource("slick-source")) {
      (map.getSource("slick-source") as maplibregl.GeoJSONSource).setData(slickGeoJSON);

      if (map.getLayer("slick-fill")) {
        map.setPaintProperty("slick-fill", "fill-color", slickFillColor);
        map.setPaintProperty("slick-fill", "fill-opacity", slickFillOpacity);
      }
      if (map.getLayer("slick-line")) {
        map.setPaintProperty("slick-line", "line-color", slickLineColor);
      }
      if (map.getLayer("slick-net-overlay")) {
        map.setLayoutProperty(
          "slick-net-overlay",
          "visibility",
          isNettedOverlayVisible ? "visible" : "none"
        );
      }
    } else {
      map.addSource("slick-source", { type: "geojson", data: slickGeoJSON });

      map.addLayer({
        id: "slick-fill",
        type: "fill",
        source: "slick-source",
        paint: {
          "fill-color": slickFillColor,
          "fill-opacity": slickFillOpacity,
        },
      });

      map.addLayer({
        id: "slick-net-overlay",
        type: "fill",
        source: "slick-source",
        layout: {
          visibility: isNettedOverlayVisible ? "visible" : "none",
        },
        paint: {
          "fill-pattern": "red-netted-overlay",
          "fill-opacity": 0.88,
        },
      });

      map.addLayer({
        id: "slick-line",
        type: "line",
        source: "slick-source",
        paint: {
          "line-color": slickLineColor,
          "line-width": 2.5,
          "line-opacity": 0.95,
        },
      });

      map.on("click", "slick-fill", (e) => {
        const { areaKm2, oilLookalikeConfidence, estimatedSpillAgeHours } = caseData.system1;
        const stageLabel =
          stage === "idle"
            ? "Regional Detection Zone"
            : stage === "system1_detection"
            ? "Stage 1: SAR Detection (Black Fill)"
            : stage === "system2_drift"
            ? "Stage 2: Backward Drift Hindcast (Gray Fill)"
            : "Stage 3: Attributed Vessel Target (Red Netted Overlay)";

        new maplibregl.Popup({ maxWidth: "290px" })
          .setLngLat(e.lngLat)
          .setHTML(
            `<div class="space-y-1.5 text-xs p-1 font-sans">
              <div class="font-bold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full ${
                  stage === "system1_detection" || stage === "idle"
                    ? "bg-black"
                    : stage === "system2_drift"
                    ? "bg-gray-500"
                    : "bg-red-600"
                } inline-block"></span>
                SAR Slick Polygon
              </div>
              <div class="text-[11px] font-semibold text-slate-700 pb-1 border-b border-slate-200">
                ${stageLabel}
              </div>
              <div><b>Area:</b> ${areaKm2} km²</div>
              <div><b>Oil Lookalike Confidence:</b> ${oilLookalikeConfidence}%</div>
              <div><b>Estimated Spill Age:</b> ${estimatedSpillAgeHours.min}–${estimatedSpillAgeHours.max} hrs</div>
              <div class="pt-1 text-[10px] text-slate-500 font-mono">
                Satellite: ${caseData.system1.satellite} · ${caseData.system1.polarization}
              </div>
            </div>`
          )
          .addTo(map);
      });
      map.on("mouseenter", "slick-fill", () => {
        map.getCanvas().style.cursor = "crosshair";
      });
      map.on("mouseleave", "slick-fill", () => {
        map.getCanvas().style.cursor = "";
      });
    }

    /* ─── Polygon Boundary Nodes & Centroid Pin ─── */
    const pinColor =
      stage === "system1_detection" || stage === "idle"
        ? "#333333"
        : stage === "system2_drift"
        ? "#64748b"
        : "#dc2626";

    const vertexPinsGJ = {
      type: "FeatureCollection" as const,
      features: ring.slice(0, -1).map((pt, idx) => ({
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: pt },
        properties: { index: idx + 1, lat: pt[1].toFixed(4), lng: pt[0].toFixed(4) },
      })),
    };

    const centroidGJ = {
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          geometry: {
            type: "Point" as const,
            coordinates: [caseData.coordinates.lng, caseData.coordinates.lat] as [number, number],
          },
          properties: {
            title: "SAR Slick Detection Centroid",
            lat: caseData.coordinates.lat.toFixed(4),
            lng: caseData.coordinates.lng.toFixed(4),
            area: `${caseData.system1.areaKm2} km²`,
          },
        },
      ],
    };

    if (map.getSource("slick-pins-source")) {
      (map.getSource("slick-pins-source") as maplibregl.GeoJSONSource).setData(vertexPinsGJ);
      if (map.getLayer("slick-vertex-pins")) {
        map.setPaintProperty("slick-vertex-pins", "circle-color", pinColor);
      }
    } else {
      map.addSource("slick-pins-source", { type: "geojson", data: vertexPinsGJ });
      map.addLayer({
        id: "slick-vertex-pins",
        type: "circle",
        source: "slick-pins-source",
        paint: {
          "circle-radius": 3.5,
          "circle-color": pinColor,
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#ffffff",
        },
      });

      map.on("click", "slick-vertex-pins", (e) => {
        const props = e.features?.[0]?.properties as { index: number; lat: string; lng: string };
        const coords = (e.features?.[0]?.geometry as unknown as { coordinates: [number, number] })?.coordinates;
        if (!coords) return;
        new maplibregl.Popup({ maxWidth: "200px" })
          .setLngLat(coords)
          .setHTML(
            `<div class="text-xs space-y-1 p-1 font-sans">
              <div class="font-bold text-slate-800">Polygon Node #${props.index}</div>
              <div class="font-mono text-[11px] text-slate-600">${props.lat}°N, ${props.lng}°E</div>
              <div class="text-[10px] text-slate-400">Boundary Vertex Coordinate</div>
            </div>`
          )
          .addTo(map);
      });
      map.on("mouseenter", "slick-vertex-pins", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "slick-vertex-pins", () => {
        map.getCanvas().style.cursor = "";
      });
    }

    if (map.getSource("slick-centroid-source")) {
      (map.getSource("slick-centroid-source") as maplibregl.GeoJSONSource).setData(centroidGJ);
      if (map.getLayer("slick-centroid-halo")) {
        map.setPaintProperty("slick-centroid-halo", "circle-color", pinColor);
      }
      if (map.getLayer("slick-centroid-pin")) {
        map.setPaintProperty("slick-centroid-pin", "circle-stroke-color", pinColor);
      }
    } else {
      map.addSource("slick-centroid-source", { type: "geojson", data: centroidGJ });

      map.addLayer({
        id: "slick-centroid-halo",
        type: "circle",
        source: "slick-centroid-source",
        paint: {
          "circle-radius": 18,
          "circle-color": pinColor,
          "circle-opacity": 0.25,
        },
      });

      map.addLayer({
        id: "slick-centroid-pin",
        type: "circle",
        source: "slick-centroid-source",
        paint: {
          "circle-radius": 7,
          "circle-color": "#ffffff",
          "circle-stroke-width": 3,
          "circle-stroke-color": pinColor,
        },
      });

      map.on("click", "slick-centroid-pin", (e) => {
        const props = e.features?.[0]?.properties as { title: string; lat: string; lng: string; area: string };
        const coords = (e.features?.[0]?.geometry as unknown as { coordinates: [number, number] })?.coordinates;
        if (!coords) return;
        new maplibregl.Popup({ maxWidth: "240px" })
          .setLngLat(coords)
          .setHTML(
            `<div class="text-xs space-y-1 p-1 font-sans">
              <div class="font-bold text-slate-800">${props.title}</div>
              <div><b>Coordinates:</b> ${props.lat}°N, ${props.lng}°E</div>
              <div><b>Area:</b> ${props.area}</div>
              <div class="text-[10px] text-slate-400">PALSAR Ground Truth Centroid</div>
            </div>`
          )
          .addTo(map);
      });
      map.on("mouseenter", "slick-centroid-pin", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "slick-centroid-pin", () => {
        map.getCanvas().style.cursor = "";
      });
    }

    /* ─── Drift Path (System 2) ─── */
    const driftGJ = {
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          geometry: { type: "LineString" as const, coordinates: caseData.system2.driftPath },
          properties: { name: "Drift Trajectory" },
        },
      ],
    };
    const originGJ = {
      type: "FeatureCollection" as const,
      features: [caseData.system2.originProbabilityEllipse],
    };

    if (map.getSource("drift-source")) {
      (map.getSource("drift-source") as maplibregl.GeoJSONSource).setData(driftGJ);
    } else {
      map.addSource("drift-source", { type: "geojson", data: driftGJ });
      map.addLayer({
        id: "drift-line",
        type: "line",
        source: "drift-source",
        paint: {
          "line-color": "#007ceb",
          "line-width": 3,
          "line-dasharray": [3, 2],
          "line-opacity": 0.9,
        },
      });
    }

    if (map.getSource("origin-source")) {
      (map.getSource("origin-source") as maplibregl.GeoJSONSource).setData(originGJ);
    } else {
      map.addSource("origin-source", { type: "geojson", data: originGJ });
      map.addLayer({
        id: "origin-fill",
        type: "fill",
        source: "origin-source",
        paint: { "fill-color": "#7ee0cf", "fill-opacity": 0.3 },
      });
      map.addLayer({
        id: "origin-line",
        type: "line",
        source: "origin-source",
        paint: { "line-color": "#0097a7", "line-width": 2, "line-dasharray": [4, 2] },
      });

      map.on("click", "origin-fill", (e) => {
        const { originCoordinates, spatialUncertaintyKm, temporalUncertaintyHours } = caseData.system2;
        new maplibregl.Popup({ maxWidth: "260px" })
          .setLngLat(e.lngLat)
          .setHTML(
            `<div class="space-y-1 text-xs p-1 font-sans">
              <div class="font-bold text-slate-800 mb-1">Origin Probability Ellipse</div>
              <div><b>Center:</b> ${originCoordinates.lat.toFixed(4)}°N, ${originCoordinates.lng.toFixed(4)}°E</div>
              <div><b>Spatial Uncertainty:</b> ±${spatialUncertaintyKm} km</div>
              <div><b>Temporal Uncertainty:</b> ±${temporalUncertaintyHours} hrs</div>
              <div class="text-[10px] text-slate-400 pt-1 font-mono">CMEMS GLORYS + ERA5 CDS</div>
            </div>`
          )
          .addTo(map);
      });
    }

    /* ─── AIS Track (System 3) ─── */
    const aisTrack = caseData.system3.primarySuspect?.aisTrack ?? [];
    const aisCoords = aisTrack.map((w) => [w.lng, w.lat]);
    const aisGJ = {
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          geometry: { type: "LineString" as const, coordinates: aisCoords },
          properties: {},
        },
      ],
    };
    const aisWpGJ = {
      type: "FeatureCollection" as const,
      features: aisTrack.map((w, i) => ({
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: [w.lng, w.lat] },
        properties: {
          index: i,
          timestamp: w.timestamp,
          speed: w.sogKnots,
          isAnomaly: !!w.isAnomaly,
          desc: w.anomalyDescription ?? "",
        },
      })),
    };

    if (map.getSource("ais-track-source")) {
      (map.getSource("ais-track-source") as maplibregl.GeoJSONSource).setData(aisGJ);
      (map.getSource("ais-points-source") as maplibregl.GeoJSONSource).setData(aisWpGJ);
    } else {
      map.addSource("ais-track-source", { type: "geojson", data: aisGJ });
      map.addSource("ais-points-source", { type: "geojson", data: aisWpGJ });

      map.addLayer({
        id: "ais-line",
        type: "line",
        source: "ais-track-source",
        paint: { "line-color": "#005bb5", "line-width": 3, "line-opacity": 0.9 },
      });

      map.addLayer({
        id: "ais-points",
        type: "circle",
        source: "ais-points-source",
        paint: {
          "circle-radius": ["case", ["get", "isAnomaly"], 8, 4.5],
          "circle-color": ["case", ["get", "isAnomaly"], "#ef4444", "#00bcd4"],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      map.on("click", "ais-points", (e) => {
        const p = e.features?.[0]?.properties as {
          speed: number;
          timestamp: string;
          isAnomaly: boolean;
          desc: string;
        };
        const coords = (e.features?.[0]?.geometry as unknown as { coordinates: [number, number] })?.coordinates;
        if (!coords) return;
        new maplibregl.Popup({ maxWidth: "280px" })
          .setLngLat(coords)
          .setHTML(
            `<div class="text-xs space-y-1 p-1 font-sans">
              <div class="font-semibold ${p.isAnomaly ? "text-red-600 font-bold" : "text-slate-800"}">
                ${p.isAnomaly ? "AIS Dark Gap / Anomaly" : "AIS Position Ping"}
              </div>
              <div><b>Vessel:</b> ${caseData.system3.primarySuspect.name}</div>
              <div><b>Time:</b> ${new Date(p.timestamp).toUTCString()}</div>
              <div><b>Speed:</b> ${p.speed} knots</div>
              ${
                p.desc
                  ? `<div class="mt-1 p-1.5 bg-red-50 border border-red-200 text-red-700 rounded">${p.desc}</div>`
                  : ""
              }
            </div>`
          )
          .addTo(map);
      });
      map.on("mouseenter", "ais-points", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "ais-points", () => {
        map.getCanvas().style.cursor = "";
      });
    }

    const set = (id: string, vis: boolean) => {
      if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", vis ? "visible" : "none");
    };
    set("slick-fill", showS1);
    set("slick-net-overlay", showS3 && isNettedOverlayVisible);
    set("slick-line", showS1);
    set("slick-vertex-pins", showS1);
    set("slick-centroid-halo", showS1);
    set("slick-centroid-pin", showS1);
    set("drift-line", showS2);
    set("origin-fill", showS2);
    set("origin-line", showS2);
    set("ais-line", showS3);
    set("ais-points", showS3);
  }, [mapLoaded, caseData, cases, stage, interactiveMode, onSelectCase]);

  /* ── Quick Zoom Handlers ── */
  const handleZoomIn = () => {
    const map = mapRef.current;
    if (!map || !caseData) return;
    const ring =
      caseData.system1.slickPolygon?.geometry?.coordinates?.[0] &&
      caseData.system1.slickPolygon.geometry.coordinates[0].length >= 5
        ? (caseData.system1.slickPolygon.geometry.coordinates[0] as [number, number][])
        : generateOrganicSlickRing(
            caseData.coordinates.lat,
            caseData.coordinates.lng,
            caseData.system1.areaKm2
          );
    const b = getBounds(ring);
    map.fitBounds(
      [
        [b.minLng - 0.04, b.minLat - 0.04],
        [b.maxLng + 0.04, b.maxLat + 0.04],
      ],
      { padding: 80, speed: 1.2, pitch: 25 }
    );
  };

  const handleZoomOut = () => {
    const map = mapRef.current;
    if (!map || !caseData) return;
    map.flyTo({
      center: [caseData.coordinates.lng, caseData.coordinates.lat],
      zoom: 4.8,
      pitch: 15,
      bearing: 0,
      speed: 1.0,
    });
  };

  /* ── Acquisition date label from case ── */
  const acquisitionTs = caseData?.system1.acquisitionTimestamp;
  const acqLabel = acquisitionTs
    ? new Date(acquisitionTs).toISOString().replace("T", " ").substring(0, 19) + " UTC"
    : "—";

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border border-[#7ee0cf]/60 shadow-sm bg-slate-900"
      style={{ height, minHeight: height }}
    >
      {/* Map canvas container */}
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%", minHeight: height, position: "relative" }}
      />

      {/* ── Top-left Controls: Basemap Switcher & Quick Zoom Buttons ── */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setShowBasemapPanel((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 border border-[#7ee0cf] shadow-sm text-xs font-semibold text-slate-800 hover:bg-[#e4f7f3] transition-colors"
          >
            <Satellite className="w-3.5 h-3.5 text-[#007ceb]" />
            <span>{BASEMAPS[basemap].label}</span>
          </button>
          {showBasemapPanel && (
            <div className="absolute top-full mt-1 bg-white/98 border border-[#7ee0cf] rounded-xl shadow-lg overflow-hidden min-w-[160px] z-20">
              {(Object.keys(BASEMAPS) as BasemapKey[]).map((k) => (
                <button
                  key={k}
                  onClick={() => {
                    setBasemap(k);
                    setShowBasemapPanel(false);
                  }}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-xs font-medium transition-colors text-left ${
                    k === basemap
                      ? "bg-[#e4f7f3] text-[#005bb5] font-semibold"
                      : "text-slate-600 hover:bg-[#f5fdfa]"
                  }`}
                >
                  <span>{BASEMAPS[k].label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Zoom buttons */}
        <button
          onClick={handleZoomIn}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/95 border border-[#7ee0cf] shadow-sm text-xs font-semibold text-slate-800 hover:bg-[#e4f7f3] transition-colors"
          title="Zoom In to Detection Area"
        >
          <ZoomIn className="w-3.5 h-3.5 text-[#007ceb]" />
          <span>Zoom In</span>
        </button>

        <button
          onClick={handleZoomOut}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/95 border border-[#7ee0cf] shadow-sm text-xs font-semibold text-slate-800 hover:bg-[#e4f7f3] transition-colors"
          title="Zoom Out to Regional View"
        >
          <ZoomOut className="w-3.5 h-3.5 text-[#007ceb]" />
          <span>Zoom Out</span>
        </button>
      </div>

      {/* ── Cursor coordinates ── */}
      {cursorLL && (
        <div className="absolute top-3 right-14 z-10 bg-black/75 backdrop-blur-sm border border-slate-700 rounded-lg px-2.5 py-1 text-[10px] font-mono text-cyan-300 shadow-sm">
          {cursorLL.lat.toFixed(5)}°N &nbsp;{cursorLL.lng.toFixed(5)}°E
        </div>
      )}

      {/* ── SAR acquisition + attribution bar (bottom, clean text, no emojis) ── */}
      <div className="absolute bottom-9 left-3 right-28 z-10 bg-[#0D2B45]/95 text-[10px] text-[#7ee0cf] rounded-lg px-3 py-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 border border-[#1E5A6E]/60 shadow-lg backdrop-blur-sm">
        {caseData && (
          <>
            <span className="font-bold text-white uppercase">{caseData.system1.satellite}</span>
            <span>
              <strong className="text-slate-300">UTC:</strong> {acqLabel}
            </span>
            <span>
              <strong className="text-slate-300">Coords:</strong> {caseData.coordinates.lat.toFixed(3)}°N, {caseData.coordinates.lng.toFixed(3)}°E
            </span>
            <span>
              <strong className="text-slate-300">Sensor:</strong> {caseData.system1.sensor} · {caseData.system1.polarization}
            </span>
            <span className="text-[#00bcd4]">EPSG:4326 · WGS 84</span>
            <span className="ml-auto text-slate-400">
              Copernicus Marine (CMEMS) · ERA5/CDS · Sentinel-1
            </span>
          </>
        )}
        {!caseData && (
          <span className="text-slate-300 font-medium">
            Copernicus Marine Service (CMEMS) · ERA5/CDS · ESA Sentinel-1 · AccessAIS
          </span>
        )}
      </div>

      {/* ── CENTERED SYSTEM PROCESSING LOADER (Over Map with Polygons/Satellite visible) ── */}
      {loadingStage && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/20 backdrop-blur-[1.5px] pointer-events-none transition-all">
          <div className="pointer-events-auto max-w-sm sm:max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <SystemProcessingLoader
              stage={loadingStage}
              durationMs={loadingDurationMs}
              onComplete={onProcessingComplete}
            />
          </div>
        </div>
      )}
    </div>
  );
}
