"use client";

import React, { useState } from "react";
import { CaseRecord } from "@/types/maritime";
import { MOCK_CASES } from "@/data/mockCases";
import {
  MapPin,
  Sliders,
  Zap,
  Wind,
  Waves,
  Droplets,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

/* ─────────────────────────────────────────────
   HARDCODED PRESET LOCATIONS
───────────────────────────────────────────── */
const PRESET_LOCATIONS = [
  {
    id: "case-mumbai-high-2026",
    code: "IN",
    label: "Mumbai High",
    sublabel: "Arabian Sea Offshore",
    lat: 18.945,
    lng: 71.950,
    description: "75 NM West of Mumbai, Arabian Sea — Critical VLCC corridor",
  },
  {
    id: "case-malacca-2026",
    code: "MY",
    label: "Strait of Malacca",
    sublabel: "TSS Fairway Lane",
    lat: 2.850,
    lng: 101.450,
    description: "High-traffic VLCC corridor, 42 km from shore",
  },
  {
    id: "case-northsea-live-2026",
    code: "NO",
    label: "North Sea Brent",
    sublabel: "Brent Field Basin",
    lat: 61.120,
    lng: 1.850,
    description: "120 km East of Shetland — Live pipeline active",
  },
  {
    id: "case-hormuz-2026",
    code: "AE",
    label: "Strait of Hormuz",
    sublabel: "Persian Gulf Chokepoint",
    lat: 26.350,
    lng: 56.400,
    description: "15 NM North of Musandam Peninsula",
  },
  {
    id: "case-gulfmex-2026",
    code: "US",
    label: "Gulf of Mexico",
    sublabel: "Mississippi Canyon",
    lat: 28.450,
    lng: -89.850,
    description: "Deepwater Block 72 — 110 km from shore",
  },
  {
    id: "backend-sample",
    code: "GLB",
    label: "Arabian Sea",
    sublabel: "Offshore Basin",
    lat: 10.0,
    lng: 70.0,
    description: "Generic offshore Arabian Sea detection zone",
  },
] as const;

/* ─────────────────────────────────────────────
   SLICK GEOMETRY GENERATOR
   Generates a realistic irregular polygon around lat/lng
───────────────────────────────────────────── */
const PALSAR_EXACT_OFFSETS: [number, number][] = [
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

function generateSlickPolygon(
  lat: number,
  lng: number,
  areaKm2: number
): [number, number][][] {
  const scale = 0.0105 * Math.sqrt(areaKm2);
  const kmToLng = 1 / Math.cos((lat * Math.PI) / 180);
  const coords: [number, number][] = PALSAR_EXACT_OFFSETS.map(([dx, dy]) => [
    parseFloat((lng + dx * scale * kmToLng * 1.3).toFixed(4)),
    parseFloat((lat + dy * scale).toFixed(4)),
  ]);
  return [coords];
}

function generateEllipse(
  centerLng: number,
  centerLat: number,
  radiusKm: number
): [number, number][] {
  const pts = 32;
  const kmToLng = 1 / (111.32 * Math.cos((centerLat * Math.PI) / 180));
  const kmToLat = 1 / 110.574;
  const coords: [number, number][] = [];
  for (let i = 0; i <= pts; i++) {
    const a = (i * 2 * Math.PI) / pts;
    coords.push([
      centerLng + radiusKm * 1.3 * Math.cos(a) * kmToLng,
      centerLat + radiusKm * 0.8 * Math.sin(a) * kmToLat,
    ]);
  }
  return coords;
}

/* ─────────────────────────────────────────────
   GENERATE CASE RECORD FROM FORM
───────────────────────────────────────────── */
function generateCase(
  lat: number,
  lng: number,
  areaKm2: number,
  spillType: string,
  ageHoursMin: number,
  ageHoursMax: number,
  windKnots: number,
  windDir: number,
  currentKnots: number
): CaseRecord {
  const now = new Date().toISOString();
  const originLat = lat - 0.08;
  const originLng = lng - 0.15;
  const poly = generateSlickPolygon(lat, lng, areaKm2);
  const ellipse = generateEllipse(originLng, originLat, areaKm2 * 0.3);
  const id = `custom-${Date.now()}`;

  return {
    id,
    caseNumber: `DEMO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`,
    title: `Custom Slick — ${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E`,
    region: "Custom Detection Zone",
    locationName: `Offshore ${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E`,
    coordinates: { lat, lng },
    status: "analyzing",
    statusLabel: "Demo Simulation",
    timestamp: now,
    severity: areaKm2 > 30 ? "critical" : areaKm2 > 15 ? "high" : "moderate",
    estimatedSpillVolumeBarrels: Math.round(areaKm2 * 120),
    marineEcosystemRisk: areaKm2 > 30 ? "Extreme" : "High",
    nearestShoreDistanceKm: 80,
    nearestMarineProtectedArea: "—",
    sarPreviewUrl: "/sar/palsar-grayscale.jpg",
    system1: {
      sceneId: `DEMO_SCENE_${id}`,
      satellite: "Sentinel-1A (C-SAR)",
      sensor: "Interferometric Wide Swath (IW)",
      polarization: "VV+VH",
      resolutionMeters: 10,
      acquisitionTimestamp: now,
      slickPolygon: {
        type: "Feature",
        geometry: { type: "Polygon", coordinates: poly },
        properties: {
          slickType: spillType,
          reflectanceDampingRatioDb: -6.2,
        },
      },
      areaKm2,
      perimeterKm: parseFloat((Math.sqrt(areaKm2) * 4.5).toFixed(1)),
      elongation: 2.8,
      orientationDegrees: 65,
      sarTextureEntropy: 0.86,
      oilLookalikeConfidence: 91.5,
      estimatedSpillAgeHours: { min: ageHoursMin, max: ageHoursMax, bestEstimate: Math.round((ageHoursMin + ageHoursMax) / 2) },
      ageConfidence: 88.0,
      candidateSpillTimeWindow: {
        start: new Date(Date.now() - ageHoursMax * 3600000).toISOString(),
        end: new Date(Date.now() - ageHoursMin * 3600000).toISOString(),
      },
    },
    system2: {
      originCoordinates: { lat: originLat, lng: originLng },
      mostProbableTimeWindow: {
        start: new Date(Date.now() - (ageHoursMax + 2) * 3600000).toISOString(),
        end: new Date(Date.now() - ageHoursMin * 3600000).toISOString(),
      },
      spatialUncertaintyKm: 6.0,
      temporalUncertaintyHours: 2.0,
      oceanCurrent: { uVelocity: 0.3, vVelocity: 0.2, speedKnots: currentKnots, headingDegrees: 55 },
      wind: { speedKnots: windKnots, directionDegrees: windDir, uComponent: windKnots * 0.4, vComponent: windKnots * 0.3, windageCoefficient: 0.032 },
      particleCount: 100,
      particles: [],
      originProbabilityEllipse: {
        type: "Feature",
        geometry: { type: "Polygon", coordinates: [ellipse] },
        properties: { probabilityDensity: 0.90, radiusKm: areaKm2 * 0.3 },
      },
      driftPath: [[originLng, originLat], [originLng + 0.08, originLat + 0.05], [lng, lat]],
    },
    system3: {
      candidateVesselsEvaluated: 14,
      temporalSearchWindowHours: 6,
      spatialSearchRadiusKm: 20,
      primarySuspect: {
        rank: 1,
        name: "DEMO VESSEL ALPHA",
        mmsi: "999000001",
        imo: "0000000",
        callSign: "DEMO1",
        flag: "—",
        flagCode: "XX",
        vesselType: "Product Tanker",
        lengthMeters: 180,
        beamMeters: 30,
        deadweightTonnage: 40000,
        overallAttributionConfidence: 82.0,
        evidence: { originProximity: 88, temporalCompatibility: 84, trajectoryMatch: 80, aisContinuity: 72, vesselTypeRelevance: 90 },
        hasDarkPeriod: true,
        darkPeriodDurationHours: 1.8,
        darkPeriodLocation: { lat: originLat, lng: originLng },
        isCulpritSuspect: true,
        summaryRationale: "Synthetic vessel generated by Demo Slick Reconstructor. Dark period near origin coordinates.",
        aisTrack: [
          { timestamp: new Date(Date.now() - 6 * 3600000).toISOString(), lat: originLat - 0.15, lng: originLng - 0.2, sogKnots: 13.5, cogDegrees: 48, headingDegrees: 47, navStatus: "Underway using Engine", distanceToOriginKm: 22 },
          { timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), lat: originLat, lng: originLng, sogKnots: 5.2, cogDegrees: 50, headingDegrees: 49, navStatus: "Restricted Manoeuvrability", distanceToOriginKm: 0.8, isAnomaly: true, anomalyDescription: "Speed drop before AIS signal cut" },
          { timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), lat: lat, lng: lng, sogKnots: 13.0, cogDegrees: 46, headingDegrees: 45, navStatus: "Underway using Engine", distanceToOriginKm: 12 },
        ],
      },
      rankedVessels: [],
    },
  };
}

/* ─────────────────────────────────────────────
   PROPS
───────────────────────────────────────────── */
interface DemoSlickFormProps {
  onCaseSelect: (c: CaseRecord) => void;
  onRunLive?: (caseId: string) => void;
  compact?: boolean;
}

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
export default function DemoSlickForm({ onCaseSelect, onRunLive, compact = false }: DemoSlickFormProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(PRESET_LOCATIONS[0].id);
  const [mode, setMode] = useState<"preset" | "custom">("preset");

  // Custom form state
  const [customLat, setCustomLat] = useState("19.200");
  const [customLng, setCustomLng] = useState("72.800");
  const [areaKm2, setAreaKm2] = useState(22);
  const [spillType, setSpillType] = useState("Heavy Fuel / Crude Residue");
  const [ageMin, setAgeMin] = useState(16);
  const [ageMax, setAgeMax] = useState(32);
  const [windKnots, setWindKnots] = useState(12);
  const [windDir, setWindDir] = useState(240);
  const [currentKnots, setCurrentKnots] = useState(0.7);
  const [generated, setGenerated] = useState(false);

  function handlePresetClick(preset: (typeof PRESET_LOCATIONS)[number]) {
    setSelectedPreset(preset.id);
    // Try to find real case from mock data
    const realCase = MOCK_CASES.find((c) => c.id === preset.id);
    if (realCase) onCaseSelect(realCase);
  }

  function handleGenerate() {
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    if (isNaN(lat) || isNaN(lng)) return;
    const c = generateCase(lat, lng, areaKm2, spillType, ageMin, ageMax, windKnots, windDir, currentKnots);
    setGenerated(true);
    setSelectedPreset(null);
    onCaseSelect(c);
    setTimeout(() => setGenerated(false), 2500);
  }

  return (
    <div className={`bg-white rounded-3xl border border-[#7ee0cf]/60 shadow-sm ${compact ? "p-4" : "p-6"}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`font-extrabold text-slate-900 ${compact ? "text-sm" : "text-base"}`}>
            Demo Slick Reconstructor
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Select a hardcoded incident or generate a custom spill
          </p>
        </div>
        {/* Tab toggle */}
        <div className="flex gap-1 bg-[#edf5f3] p-1 rounded-xl text-[11px] font-semibold">
          <button
            onClick={() => setMode("preset")}
            className={`px-2.5 py-1 rounded-lg transition-colors ${mode === "preset" ? "bg-white text-[#007ceb] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Presets
          </button>
          <button
            onClick={() => setMode("custom")}
            className={`px-2.5 py-1 rounded-lg transition-colors ${mode === "custom" ? "bg-white text-[#007ceb] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Custom
          </button>
        </div>
      </div>

      {/* ── PRESET MODE ── */}
      {mode === "preset" && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {PRESET_LOCATIONS.map((p) => (
              <button
                key={p.id}
                onClick={() => handlePresetClick(p)}
                className={`flex items-start gap-2.5 p-3 rounded-2xl border text-left transition-all text-xs ${
                  selectedPreset === p.id
                    ? "border-[#007ceb] bg-[#e4f7f3] shadow-sm ring-1 ring-[#007ceb]/30"
                    : "border-[#7ee0cf]/40 bg-[#f5fdfa] hover:border-[#00bcd4] hover:bg-[#edfcf8]"
                }`}
              >
                <span className="px-1.5 py-0.5 rounded bg-[#007ceb]/15 text-[#005bb5] font-bold text-[10px] mt-0.5 shrink-0">
                  {p.code}
                </span>
                <div>
                  <div className="font-bold text-slate-800 leading-tight">{p.label}</div>
                  <div className="text-[10px] text-slate-500">{p.sublabel}</div>
                  <div className="text-[10px] text-[#007ceb] mt-0.5 font-mono">
                    {p.lat}°N, {p.lng}°E
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Data attribution note */}
          <div className="mt-3 p-2.5 bg-[#f0fdf8] border border-[#7ee0cf]/50 rounded-xl text-[10px] text-slate-600">
            <span className="font-semibold text-[#005bb5]">Data Sources: </span>
            Copernicus Marine Service (CMEMS GLORYS12) · ERA5/CDS Wind Fields · ESA Sentinel-1 C-SAR
          </div>

          {selectedPreset && onRunLive && (
            <button
              onClick={() => onRunLive(selectedPreset)}
              className="mt-2 w-full py-2.5 rounded-xl bg-[#007ceb] hover:bg-[#005bb5] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" />
              Run Live Pipeline Simulation
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* ── CUSTOM MODE ── */}
      {mode === "custom" && (
        <div className="space-y-3">
          {/* Coordinates */}
          <div className="p-3 bg-[#f5fdfa] rounded-2xl border border-[#7ee0cf]/50">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#005bb5] mb-2">
              <MapPin className="w-3.5 h-3.5" />
              Spill Origin Coordinates
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Latitude (°N)</label>
                <input
                  type="number"
                  value={customLat}
                  step="0.001"
                  onChange={(e) => setCustomLat(e.target.value)}
                  className="w-full px-2 py-1.5 border border-[#7ee0cf] rounded-lg text-xs font-mono bg-white focus:outline-none focus:ring-1 focus:ring-[#007ceb]"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Longitude (°E)</label>
                <input
                  type="number"
                  value={customLng}
                  step="0.001"
                  onChange={(e) => setCustomLng(e.target.value)}
                  className="w-full px-2 py-1.5 border border-[#7ee0cf] rounded-lg text-xs font-mono bg-white focus:outline-none focus:ring-1 focus:ring-[#007ceb]"
                />
              </div>
            </div>
          </div>

          {/* Slick params */}
          <div className="p-3 bg-[#f5fdfa] rounded-2xl border border-[#7ee0cf]/50">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#005bb5] mb-2">
              <Sliders className="w-3.5 h-3.5" />
              Slick Parameters
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-3">
                <label className="w-28 text-slate-600">Area (km²)</label>
                <input type="range" min={2} max={80} value={areaKm2} onChange={(e) => setAreaKm2(+e.target.value)} className="flex-1 accent-[#007ceb]" />
                <span className="font-bold text-slate-800 w-10 text-right">{areaKm2}</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="w-28 text-slate-600">Age Min (hrs)</label>
                <input type="range" min={4} max={60} value={ageMin} onChange={(e) => setAgeMin(+e.target.value)} className="flex-1 accent-[#00bcd4]" />
                <span className="font-bold text-slate-800 w-10 text-right">{ageMin}</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="w-28 text-slate-600">Age Max (hrs)</label>
                <input type="range" min={ageMin + 4} max={96} value={ageMax} onChange={(e) => setAgeMax(+e.target.value)} className="flex-1 accent-[#00bcd4]" />
                <span className="font-bold text-slate-800 w-10 text-right">{ageMax}</span>
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Spill Type</label>
                <select
                  value={spillType}
                  onChange={(e) => setSpillType(e.target.value)}
                  className="w-full px-2 py-1.5 border border-[#7ee0cf] rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#007ceb]"
                >
                  <option>Heavy Fuel / Crude Residue</option>
                  <option>Bunker Fuel (IFO380)</option>
                  <option>Refined Products / Diesel</option>
                  <option>Bilge Sludge</option>
                  <option>Chemical Tanker Slop</option>
                </select>
              </div>
            </div>
          </div>

          {/* Environmental params */}
          <div className="p-3 bg-[#f5fdfa] rounded-2xl border border-[#7ee0cf]/50">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#005bb5] mb-2">
              <Wind className="w-3.5 h-3.5" />
              CMEMS / CDS Environmental Fields
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <label className="block text-slate-500 mb-1">Wind (kt)</label>
                <input type="number" min={0} max={40} value={windKnots} onChange={(e) => setWindKnots(+e.target.value)}
                  className="w-full px-2 py-1.5 border border-[#7ee0cf] rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#007ceb]" />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Wind Dir (°)</label>
                <input type="number" min={0} max={360} value={windDir} onChange={(e) => setWindDir(+e.target.value)}
                  className="w-full px-2 py-1.5 border border-[#7ee0cf] rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#007ceb]" />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Current (kt)</label>
                <input type="number" min={0} max={4} step={0.1} value={currentKnots} onChange={(e) => setCurrentKnots(+e.target.value)}
                  className="w-full px-2 py-1.5 border border-[#7ee0cf] rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#007ceb]" />
              </div>
            </div>
            <div className="mt-1.5 text-[10px] text-slate-400">
              Source: Copernicus Marine Service GLORYS12 + ERA5/CDS
            </div>
          </div>

          <button
            onClick={handleGenerate}
            className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
              generated
                ? "bg-[#a3d328] text-white"
                : "bg-[#007ceb] hover:bg-[#005bb5] text-white"
            }`}
          >
            {generated ? (
              <>Slick Generated on Map</>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                Generate & Simulate Slick
              </>
            )}
          </button>

          {onRunLive && (
            <button
              onClick={() => {
                handleGenerate();
                setTimeout(() => onRunLive("custom"), 300);
              }}
              className="w-full py-2 rounded-xl bg-[#0D2B45] hover:bg-[#1E5A6E] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              Run Full Live Pipeline
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
