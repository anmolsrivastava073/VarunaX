"use client";

import React, { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { CaseRecord, PipelineStage } from "@/types/maritime";
import { Layers } from "lucide-react";

interface MapLibreMapProps {
  caseData?: CaseRecord;
  cases?: CaseRecord[];
  stage?: PipelineStage;
  interactiveMode?: "overview" | "singleCase" | "liveSimulation";
  onSelectCase?: (caseId: string) => void;
  height?: string;
  showLayerControls?: boolean;
}

export default function MapLibreMap({
  caseData,
  cases = [],
  stage = "completed",
  interactiveMode = "singleCase",
  onSelectCase,
  height = "520px",
  showLayerControls = true,
}: MapLibreMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Layer Visibility Toggles
  const [layersVisibility, setLayersVisibility] = useState({
    slickPolygon: true,
    driftPath: true,
    originArea: true,
    vesselTracks: true,
  });

  // Calculate default center and zoom
  const defaultCenter: [number, number] = caseData
    ? [caseData.coordinates.lng, caseData.coordinates.lat]
    : cases.length > 0
    ? [cases[0].coordinates.lng, cases[0].coordinates.lat]
    : [72.5, 19.0];

  const defaultZoom = caseData ? 10.5 : cases.length > 0 ? 4.5 : 5;

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Use Carto Positron raster style for high-clarity light theme
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          "carto-positron": {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
              "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
              "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
            ],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors, © CARTO",
          },
        },
        layers: [
          {
            id: "carto-positron-layer",
            type: "raster",
            source: "carto-positron",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: defaultCenter,
      zoom: defaultZoom,
      pitch: 30,
      bearing: -10,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");

    map.on("load", () => {
      mapRef.current = map;
      setMapLoaded(true);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update map center when caseData changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    if (caseData) {
      mapRef.current.flyTo({
        center: [caseData.coordinates.lng, caseData.coordinates.lat],
        zoom: 10.8,
        pitch: 35,
        speed: 1.2,
      });
    }
  }, [caseData, mapLoaded]);

  // Render Data Layers on map
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // 1. Handle Overview Mode (multiple cases)
    if (interactiveMode === "overview" && cases.length > 0) {
      if (map.getSource("cases-source")) {
        (map.getSource("cases-source") as maplibregl.GeoJSONSource).setData({
          type: "FeatureCollection",
          features: cases.map((c) => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [c.coordinates.lng, c.coordinates.lat],
            },
            properties: {
              id: c.id,
              title: c.title,
              region: c.region,
              status: c.status,
              severity: c.severity,
              area: c.system1.areaKm2,
            },
          })),
        });
      } else {
        map.addSource("cases-source", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: cases.map((c) => ({
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [c.coordinates.lng, c.coordinates.lat],
              },
              properties: {
                id: c.id,
                title: c.title,
                region: c.region,
                status: c.status,
                severity: c.severity,
                area: c.system1.areaKm2,
              },
            })),
          },
        });

        // Pulsing outer halo with palette colors
        map.addLayer({
          id: "cases-halo",
          type: "circle",
          source: "cases-source",
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 14, 10, 24],
            "circle-color": [
              "match",
              ["get", "severity"],
              "critical",
              "#007ceb",
              "high",
              "#00bcd4",
              "moderate",
              "#a3d328",
              "#007ceb",
            ],
            "circle-opacity": 0.28,
          },
        });

        // Main Pin Circle
        map.addLayer({
          id: "cases-circles",
          type: "circle",
          source: "cases-source",
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 6, 10, 10],
            "circle-color": [
              "match",
              ["get", "severity"],
              "critical",
              "#005bb5",
              "high",
              "#0097a7",
              "moderate",
              "#81ac19",
              "#007ceb",
            ],
            "circle-stroke-width": 2.5,
            "circle-stroke-color": "#ffffff",
          },
        });

        // Click event on case points
        map.on("click", "cases-circles", (e) => {
          if (!e.features || !e.features[0]) return;
          const props = e.features[0].properties as { id: string; title: string; region: string };
          if (onSelectCase && props.id) {
            onSelectCase(props.id);
          }
        });

        map.on("mouseenter", "cases-circles", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "cases-circles", () => {
          map.getCanvas().style.cursor = "";
        });
      }
      return;
    }

    // 2. Handle Single Case / Live Simulation Mode
    if (!caseData) return;

    const showSystem1 = stage === "system1_detection" || stage === "system2_drift" || stage === "system3_attribution" || stage === "completed";
    const showSystem2 = stage === "system2_drift" || stage === "system3_attribution" || stage === "completed";
    const showSystem3 = stage === "system3_attribution" || stage === "completed";

    // --- SYSTEM 1: SLICK POLYGON ---
    const slickGeoJSON = {
      type: "FeatureCollection",
      features: [caseData.system1.slickPolygon],
    };

    if (map.getSource("slick-source")) {
      (map.getSource("slick-source") as maplibregl.GeoJSONSource).setData(slickGeoJSON as any);
    } else {
      map.addSource("slick-source", {
        type: "geojson",
        data: slickGeoJSON as any,
      });

      map.addLayer({
        id: "slick-fill",
        type: "fill",
        source: "slick-source",
        paint: {
          "fill-color": "#0c2333", // Dark petroleum sheen
          "fill-opacity": 0.7,
        },
      });

      map.addLayer({
        id: "slick-line",
        type: "line",
        source: "slick-source",
        paint: {
          "line-color": "#00bcd4", // Vivid cyan outline
          "line-width": 3,
          "line-opacity": 0.95,
        },
      });
    }

    // --- SYSTEM 2: DRIFT PATH & ORIGIN ELLIPSE ---
    const driftGeoJSON = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: caseData.system2.driftPath,
          },
          properties: {
            name: "Reconstructed Drift Trajectory",
          },
        },
      ],
    };

    const originGeoJSON = {
      type: "FeatureCollection",
      features: [caseData.system2.originProbabilityEllipse],
    };

    if (map.getSource("drift-source")) {
      (map.getSource("drift-source") as maplibregl.GeoJSONSource).setData(driftGeoJSON as any);
    } else {
      map.addSource("drift-source", {
        type: "geojson",
        data: driftGeoJSON as any,
      });

      map.addLayer({
        id: "drift-line",
        type: "line",
        source: "drift-source",
        paint: {
          "line-color": "#007ceb", // Azure Blue drift line
          "line-width": 3.5,
          "line-dasharray": [2, 2],
          "line-opacity": 0.95,
        },
      });
    }

    if (map.getSource("origin-source")) {
      (map.getSource("origin-source") as maplibregl.GeoJSONSource).setData(originGeoJSON as any);
    } else {
      map.addSource("origin-source", {
        type: "geojson",
        data: originGeoJSON as any,
      });

      map.addLayer({
        id: "origin-fill",
        type: "fill",
        source: "origin-source",
        paint: {
          "fill-color": "#7ee0cf", // Seafoam mint origin ellipse fill
          "fill-opacity": 0.35,
        },
      });

      map.addLayer({
        id: "origin-line",
        type: "line",
        source: "origin-source",
        paint: {
          "line-color": "#0097a7",
          "line-width": 2.5,
          "line-dasharray": [3, 2],
        },
      });
    }

    // --- SYSTEM 3: AIS VESSEL TRACK ---
    const primarySuspect = caseData.system3.primarySuspect;
    const aisTrackCoords = primarySuspect?.aisTrack?.map((p) => [p.lng, p.lat]) || [];

    const aisGeoJSON = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: aisTrackCoords,
          },
          properties: {
            vesselName: primarySuspect?.name,
            mmsi: primarySuspect?.mmsi,
          },
        },
      ],
    };

    const aisWaypointsGeoJSON = {
      type: "FeatureCollection",
      features:
        primarySuspect?.aisTrack?.map((w, idx) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [w.lng, w.lat],
          },
          properties: {
            index: idx,
            timestamp: w.timestamp,
            speed: w.sogKnots,
            isAnomaly: !!w.isAnomaly,
            anomalyDescription: w.anomalyDescription || "",
          },
        })) || [],
    };

    if (map.getSource("ais-track-source")) {
      (map.getSource("ais-track-source") as maplibregl.GeoJSONSource).setData(aisGeoJSON as any);
      (map.getSource("ais-points-source") as maplibregl.GeoJSONSource).setData(aisWaypointsGeoJSON as any);
    } else {
      map.addSource("ais-track-source", {
        type: "geojson",
        data: aisGeoJSON as any,
      });

      map.addSource("ais-points-source", {
        type: "geojson",
        data: aisWaypointsGeoJSON as any,
      });

      map.addLayer({
        id: "ais-line",
        type: "line",
        source: "ais-track-source",
        paint: {
          "line-color": "#005bb5", // Dark Azure line for suspect
          "line-width": 3.5,
          "line-opacity": 0.9,
        },
      });

      map.addLayer({
        id: "ais-points",
        type: "circle",
        source: "ais-points-source",
        paint: {
          "circle-radius": [
            "case",
            ["get", "isAnomaly"],
            8,
            5,
          ],
          "circle-color": [
            "case",
            ["get", "isAnomaly"],
            "#007ceb",
            "#00bcd4",
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      // Anomaly tooltip
      map.on("click", "ais-points", (e) => {
        if (!e.features || !e.features[0]) return;
        const p = e.features[0].properties as { speed: number; timestamp: string; isAnomaly: boolean; anomalyDescription: string };
        const coords = (e.features[0].geometry as any).coordinates.slice();

        new maplibregl.Popup()
          .setLngLat(coords)
          .setHTML(
            `<div class="text-xs space-y-1">
              <div class="font-semibold ${p.isAnomaly ? "text-[#005bb5] font-bold" : "text-slate-800"}">
                ${p.isAnomaly ? "⚠️ AIS Anomaly Detected" : "AIS Position Ping"}
              </div>
              <div><strong>Time:</strong> ${new Date(p.timestamp).toUTCString()}</div>
              <div><strong>Speed:</strong> ${p.speed} knots</div>
              ${p.anomalyDescription ? `<div class="mt-1 p-1.5 bg-[#e4f7f3] border border-[#7ee0cf] text-[#005bb5] rounded">${p.anomalyDescription}</div>` : ""}
            </div>`
          )
          .addTo(map);
      });
    }

    // Toggle layer visibilities
    if (map.getLayer("slick-fill")) {
      map.setLayoutProperty("slick-fill", "visibility", showSystem1 && layersVisibility.slickPolygon ? "visible" : "none");
      map.setLayoutProperty("slick-line", "visibility", showSystem1 && layersVisibility.slickPolygon ? "visible" : "none");
    }

    if (map.getLayer("drift-line")) {
      map.setLayoutProperty("drift-line", "visibility", showSystem2 && layersVisibility.driftPath ? "visible" : "none");
      map.setLayoutProperty("origin-fill", "visibility", showSystem2 && layersVisibility.originArea ? "visible" : "none");
      map.setLayoutProperty("origin-line", "visibility", showSystem2 && layersVisibility.originArea ? "visible" : "none");
    }

    if (map.getLayer("ais-line")) {
      map.setLayoutProperty("ais-line", "visibility", showSystem3 && layersVisibility.vesselTracks ? "visible" : "none");
      map.setLayoutProperty("ais-points", "visibility", showSystem3 && layersVisibility.vesselTracks ? "visible" : "none");
    }
  }, [mapLoaded, caseData, cases, stage, layersVisibility, interactiveMode, onSelectCase]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[#7ee0cf]/60 shadow-sm bg-[#edf5f3]" style={{ height }}>
      {/* MapLibre DOM Target */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Map Legend & Layer Controls */}
      {showLayerControls && (
        <div className="absolute top-3 left-3 z-10 glass-panel rounded-xl p-3 shadow-md border border-[#7ee0cf] max-w-xs text-xs">
          <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-[#7ee0cf]/40">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#007ceb]" />
              Active GIS Overlays
            </span>
            <span className="text-[10px] text-[#005bb5] bg-[#e4f7f3] px-1.5 py-0.5 rounded font-medium border border-[#7ee0cf]">
              MapLibre GL
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center justify-between cursor-pointer hover:bg-[#e4f7f3]/50 px-1 py-0.5 rounded">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-3 h-3 rounded bg-slate-900 border border-[#00bcd4] inline-block" />
                SAR Slick Polygon (Sys 1)
              </span>
              <input
                type="checkbox"
                checked={layersVisibility.slickPolygon}
                onChange={(e) => setLayersVisibility((prev) => ({ ...prev, slickPolygon: e.target.checked }))}
                className="rounded text-[#007ceb] focus:ring-[#007ceb] h-3.5 w-3.5"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:bg-[#e4f7f3]/50 px-1 py-0.5 rounded">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-3 h-3 rounded bg-[#007ceb] border border-[#005bb5] inline-block" />
                Drift Hindcast & Origin (Sys 2)
              </span>
              <input
                type="checkbox"
                checked={layersVisibility.driftPath}
                onChange={(e) =>
                  setLayersVisibility((prev) => ({
                    ...prev,
                    driftPath: e.target.checked,
                    originArea: e.target.checked,
                  }))
                }
                className="rounded text-[#007ceb] focus:ring-[#007ceb] h-3.5 w-3.5"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:bg-[#e4f7f3]/50 px-1 py-0.5 rounded">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-3 h-3 rounded bg-[#81ac19] border border-[#a3d328] inline-block" />
                Suspect AIS Track (Sys 3)
              </span>
              <input
                type="checkbox"
                checked={layersVisibility.vesselTracks}
                onChange={(e) => setLayersVisibility((prev) => ({ ...prev, vesselTracks: e.target.checked }))}
                className="rounded text-[#007ceb] focus:ring-[#007ceb] h-3.5 w-3.5"
              />
            </label>
          </div>
        </div>
      )}

      {/* Floating Coordinate / Watermark Tag */}
      <div className="absolute bottom-3 left-3 z-10 glass-panel px-2.5 py-1 rounded-lg text-[11px] text-slate-600 flex items-center gap-2 border border-[#7ee0cf]">
        <span className="w-2 h-2 rounded-full bg-[#00bcd4] animate-pulse" />
        <span>EPSG:4326 • WGS 84 • Sentinel-1 + AccessAIS</span>
      </div>
    </div>
  );
}
