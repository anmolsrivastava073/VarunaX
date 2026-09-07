"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MOCK_CASES } from "@/data/mockCases";
import { CaseRecord } from "@/types/maritime";
import MapLibreMap from "@/components/map/MapLibreMap";
import DemoSlickForm from "@/components/common/DemoSlickForm";
import SystemProcessingLoader from "@/components/live/SystemProcessingLoader";
import CaseSummaryDashboard from "@/components/live/CaseSummaryDashboard";
import {
  Satellite,
  Compass,
  Anchor,
  Globe,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  AlertTriangle,
  Sliders,
  Play,
} from "lucide-react";

export default function PipelineDemoSection() {
  const [activeStage, setActiveStage] = useState<
    "idle" | "system1_detection" | "system2_drift" | "system3_attribution" | "completed"
  >("idle");
  const [isDemoLoading, setIsDemoLoading] = useState<boolean>(false);
  const [selectedCase, setSelectedCase] = useState<CaseRecord>(MOCK_CASES[0]); // Mumbai High
  const [showCustomForm, setShowCustomForm] = useState(false);

  const handleStageChange = (
    newStage: "idle" | "system1_detection" | "system2_drift" | "system3_attribution" | "completed"
  ) => {
    if (newStage === "idle") {
      setIsDemoLoading(false);
      setActiveStage("idle");
    } else {
      setIsDemoLoading(true);
      setActiveStage(newStage);
    }
  };

  return (
    <section
      id="interactive-demo"
      className="py-24 bg-white border-t border-[#B7D4E6]/40 relative overflow-hidden"
    >
      {/* Decorative GIF Graphics */}
      <img
        src="/1.gif"
        alt="Decorative radar"
        className="absolute left-8 top-10 w-28 md:w-48 lg:w-60 object-contain pointer-events-none hidden md:block opacity-80 z-0"
      />
      <img
        src="/3.gif"
        alt="Decorative vessel"
        className="absolute right-8 top-16 w-28 md:w-48 lg:w-60 object-contain pointer-events-none hidden md:block opacity-80 z-0"
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e4f7f3] border border-[#7ee0cf] text-[11px] font-bold text-[#005bb5] uppercase tracking-wider">
            <span>CMEMS GLORYS12 · ERA5/CDS · Sentinel-1</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0D2B45] tracking-tight">
            Interactive AI Slick Reconstructor
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Trace the chain of custody from radar backscatter segmentation through backward
            Lagrangian drift hindcast to AIS vessel dark target attribution and legal case compilation.
          </p>
        </div>

        {/* Action Pills & Demo Form Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f5f9fb] p-3 rounded-2xl border border-[#B7D4E6]/60">
          {/* Stage Selector Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleStageChange("idle")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeStage === "idle"
                  ? "bg-[#0D2B45] text-white shadow-sm ring-2 ring-[#0D2B45]/30"
                  : "bg-white text-slate-700 hover:bg-[#e4f7f3]"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Regional Overview</span>
            </button>

            <button
              onClick={() => handleStageChange("system1_detection")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeStage === "system1_detection"
                  ? "bg-[#007ceb] text-white shadow-sm ring-2 ring-[#007ceb]/30"
                  : "bg-white text-slate-700 hover:bg-[#e4f7f3]"
              }`}
            >
              <Satellite className="w-3.5 h-3.5" />
              <span>1. SAR Segmentation</span>
            </button>

            <button
              onClick={() => handleStageChange("system2_drift")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeStage === "system2_drift"
                  ? "bg-[#00bcd4] text-white shadow-sm ring-2 ring-[#00bcd4]/30"
                  : "bg-white text-slate-700 hover:bg-[#e4f7f3]"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>2. Backward Drift Hindcast</span>
            </button>

            <button
              onClick={() => handleStageChange("system3_attribution")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeStage === "system3_attribution"
                  ? "bg-[#81ac19] text-white shadow-sm ring-2 ring-[#81ac19]/30"
                  : "bg-white text-slate-700 hover:bg-[#e4f7f3]"
              }`}
            >
              <Anchor className="w-3.5 h-3.5" />
              <span>3. AIS Vessel Dossier</span>
            </button>

            <button
              onClick={() => handleStageChange("completed")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeStage === "completed"
                  ? "bg-[#0D2B45] text-white shadow-sm ring-2 ring-[#0D2B45]/30"
                  : "bg-white text-slate-700 hover:bg-[#e4f7f3]"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#7ee0cf]" />
              <span>4. Case Compilation</span>
            </button>
          </div>

          {/* Preset Selector & Custom Form Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCustomForm((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#7ee0cf] text-xs font-semibold text-slate-700 hover:bg-[#e4f7f3] transition-colors shadow-sm"
            >
              <Sliders className="w-3.5 h-3.5 text-[#007ceb]" />
              <span>{showCustomForm ? "Hide Reconstructor" : "Demo Slick Form"}</span>
            </button>

            <Link
              href={`/live?caseId=${selectedCase.id}`}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#007ceb] hover:bg-[#005bb5] text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Launch Live</span>
            </Link>
          </div>
        </div>

        {/* Demo Slick Form (shown on toggle) */}
        {showCustomForm && (
          <div className="transition-all">
            <DemoSlickForm
              onCaseSelect={(c) => {
                setSelectedCase(c);
                setShowCustomForm(false);
                handleStageChange("idle");
              }}
              onRunLive={(caseId) => {
                window.location.href = `/live?caseId=${caseId}`;
              }}
            />
          </div>
        )}

        {/* Main 2-Column Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: MapLibre Map */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
            <div className="bg-[#f5f9fb] p-2 rounded-3xl border border-[#B7D4E6]/60 shadow-sm flex-1">
              <MapLibreMap
                caseData={selectedCase}
                stage={activeStage}
                height="500px"
                loadingStage={isDemoLoading && activeStage !== "idle" ? activeStage : null}
                loadingDurationMs={850}
                onProcessingComplete={() => setIsDemoLoading(false)}
              />
              {/* Region Bar */}
              <div className="mt-3 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 bg-white rounded-xl border border-[#B7D4E6]/50">
                <span className="flex items-center gap-1.5 font-medium text-slate-800">
                  <span className="w-2 h-2 rounded-full bg-[#007ceb]" />
                  Region: {selectedCase.region}
                </span>
                <span className="text-[11px] font-mono text-[#005bb5]">
                  Lat: {selectedCase.coordinates.lat.toFixed(3)}°N, Lng:{" "}
                  {selectedCase.coordinates.lng.toFixed(3)}°E
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Stage Inspection Cards / Case Summary Dashboard */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            {/* ── REGIONAL OVERVIEW (ZOOMED OUT) ── */}
            {activeStage === "idle" && (
              <div className="p-6 rounded-3xl bg-[#f5f9fb] border border-[#0D2B45]/30 space-y-4 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#005bb5]">
                      Satellite Surveillance · Initial View
                    </span>
                    <span className="text-[10px] bg-white text-[#005bb5] px-2 py-0.5 rounded-full border border-[#7ee0cf] font-mono">
                      Zoomed Out
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#0D2B45] mb-1">
                    {selectedCase.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Regional satellite overview showing incident coordinates at{" "}
                    <b>{selectedCase.coordinates.lat.toFixed(3)}°N, {selectedCase.coordinates.lng.toFixed(3)}°E</b> in {selectedCase.region}. Select a system above or click below to zoom in and reconstruct the detection.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-[#B7D4E6]/60">
                    <span className="text-slate-500 block text-[10px] mb-0.5">Region Corridor</span>
                    <span className="text-xs font-bold text-slate-900 line-clamp-1">
                      {selectedCase.region}
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#B7D4E6]/60">
                    <span className="text-slate-500 block text-[10px] mb-0.5">Severity</span>
                    <span className="text-xs font-bold text-red-600 uppercase">
                      {selectedCase.severity}
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#B7D4E6]/60">
                    <span className="text-slate-500 block text-[10px] mb-0.5">Estimated Spill Volume</span>
                    <span className="text-xs font-bold text-slate-900">
                      ~{selectedCase.estimatedSpillVolumeBarrels} Barrels
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#B7D4E6]/60">
                    <span className="text-slate-500 block text-[10px] mb-0.5">Distance to Shore</span>
                    <span className="text-xs font-bold text-[#007ceb]">
                      {selectedCase.nearestShoreDistanceKm} km
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleStageChange("system1_detection")}
                  className="w-full py-3 rounded-2xl bg-[#007ceb] hover:bg-[#005bb5] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Satellite className="w-4 h-4" />
                  <span>Zoom to System 1: SAR Segmentation</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ── SYSTEM 1: SAR SEGMENTATION ── */}
            {activeStage === "system1_detection" && (
              <div className="p-6 rounded-3xl bg-[#f5f9fb] border border-[#007ceb]/50 space-y-4 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#005bb5]">
                      System 1 Output · SAR Analysis
                    </span>
                    <span className="text-[10px] bg-white text-[#005bb5] px-2 py-0.5 rounded-full border border-[#7ee0cf] font-mono">
                      ESA Sentinel-1
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#0D2B45] mb-1">
                    C-SAR Slick Segmentation
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Processes VV+VH dual-pol SAR scenes. Eliminates look-alikes like biogenic algal
                    sheens via texture entropy modeling.
                  </p>
                </div>

                {/* PALSAR Image Preview */}
                <div className="relative h-36 rounded-2xl overflow-hidden border border-[#7ee0cf]/50 bg-slate-900">
                  <Image
                    src="/sar/palsar-grayscale.jpg"
                    alt="PALSAR Raw Texture"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2.5">
                    <span className="text-[10px] text-[#7ee0cf] font-mono">
                      PALSAR / Sentinel-1 Raw Backscatter Speckle
                    </span>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-[#B7D4E6]/60">
                    <span className="text-slate-500 block text-[10px] mb-0.5">Detected Area</span>
                    <span className="text-sm font-bold text-slate-900">
                      {selectedCase.system1.areaKm2} km²
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#B7D4E6]/60">
                    <span className="text-slate-500 block text-[10px] mb-0.5">Perimeter</span>
                    <span className="text-sm font-bold text-slate-900">
                      {selectedCase.system1.perimeterKm} km
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#B7D4E6]/60">
                    <span className="text-slate-500 block text-[10px] mb-0.5">Confidence</span>
                    <span className="text-sm font-bold text-[#007ceb]">
                      {selectedCase.system1.oilLookalikeConfidence}%
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#B7D4E6]/60">
                    <span className="text-slate-500 block text-[10px] mb-0.5">Est. Age Window</span>
                    <span className="text-sm font-bold text-slate-900">
                      {selectedCase.system1.estimatedSpillAgeHours.min}–{selectedCase.system1.estimatedSpillAgeHours.max} hrs
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleStageChange("system2_drift")}
                  className="w-full py-2.5 rounded-xl bg-[#007ceb] hover:bg-[#005bb5] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <span>Advance to Stage 2: Drift Hindcast</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ── SYSTEM 2: BACKWARD DRIFT HINDCAST ── */}
            {activeStage === "system2_drift" && (
              <div className="p-6 rounded-3xl bg-[#f5f9fb] border border-[#00bcd4]/50 space-y-4 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#00838f]">
                      System 2 Output · Hydrodynamics
                    </span>
                    <span className="text-[10px] bg-white text-[#00838f] px-2 py-0.5 rounded-full border border-[#80deea] font-mono">
                      CMEMS + ERA5 CDS
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#0D2B45] mb-1">
                    Lagrangian Particle Tracking
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Backward trajectory integration driven by Copernicus Marine Service currents and
                    ERA5/CDS wind fields to estimate origin zone.
                  </p>
                </div>

                {/* PALSAR Red Overlay Preview */}
                <div className="relative h-36 rounded-2xl overflow-hidden border border-[#7ee0cf]/50 bg-slate-900">
                  <Image
                    src="/sar/palsar-redoverlay.jpg"
                    alt="PALSAR Red Overlay"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2.5">
                    <span className="text-[10px] text-[#7ee0cf] font-mono">
                      PALSAR Red Segmented Slick Mask
                    </span>
                  </div>
                </div>

                {/* Hydrodynamic Drivers */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-[#B7D4E6]/60">
                    <span className="text-slate-500 block text-[10px] mb-0.5">Ocean Surface Current</span>
                    <span className="text-sm font-bold text-slate-900">
                      {selectedCase.system2.oceanCurrent.speedKnots} kt @{" "}
                      {selectedCase.system2.oceanCurrent.headingDegrees}°
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#B7D4E6]/60">
                    <span className="text-slate-500 block text-[10px] mb-0.5">Atmospheric Wind (ERA5)</span>
                    <span className="text-sm font-bold text-slate-900">
                      {selectedCase.system2.wind.speedKnots} kt @{" "}
                      {selectedCase.system2.wind.directionDegrees}°
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#B7D4E6]/60">
                    <span className="text-slate-500 block text-[10px] mb-0.5">Spatial Uncertainty</span>
                    <span className="text-sm font-bold text-slate-900">
                      ± {selectedCase.system2.spatialUncertaintyKm} km
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#B7D4E6]/60">
                    <span className="text-slate-500 block text-[10px] mb-0.5">Temporal Uncertainty</span>
                    <span className="text-sm font-bold text-[#0097a7]">
                      ± {selectedCase.system2.temporalUncertaintyHours} hrs
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleStageChange("system3_attribution")}
                  className="w-full py-2.5 rounded-xl bg-[#00bcd4] hover:bg-[#0097a7] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <span>Advance to Stage 3: AIS Attribution</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ── SYSTEM 3: AIS ATTRIBUTION ── */}
            {activeStage === "system3_attribution" && (
              <div className="p-6 rounded-3xl bg-[#f5f9fb] border border-[#81ac19]/50 space-y-4 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#558b2f]">
                      System 3 Output · Attribution
                    </span>
                    <span className="text-[10px] bg-white text-[#558b2f] px-2 py-0.5 rounded-full border border-[#c5e1a5] font-mono">
                      AccessAIS
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#0D2B45] mb-1">
                    {selectedCase.system3.primarySuspect.name}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Correlates candidate AIS traffic with origin space-time constraints, pinpointing
                    speed anomalies and transponder dark gaps.
                  </p>
                </div>

                {/* Score Progress Bars */}
                <div className="space-y-2 text-xs bg-white p-3.5 rounded-2xl border border-[#B7D4E6]/60">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-600">Origin Proximity Compatibility</span>
                      <span className="font-bold text-slate-900">
                        {selectedCase.system3.primarySuspect.evidence.originProximity}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#007ceb] rounded-full"
                        style={{ width: `${selectedCase.system3.primarySuspect.evidence.originProximity}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-600">Temporal Compatibility</span>
                      <span className="font-bold text-slate-900">
                        {selectedCase.system3.primarySuspect.evidence.temporalCompatibility}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#00bcd4] rounded-full"
                        style={{ width: `${selectedCase.system3.primarySuspect.evidence.temporalCompatibility}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-600">AIS Continuity (Dark Gap Penalty)</span>
                      <span className="font-bold text-[#005bb5]">
                        {selectedCase.system3.primarySuspect.evidence.aisContinuity}% (
                        {selectedCase.system3.primarySuspect.darkPeriodDurationHours}h blackout)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0D2B45] rounded-full"
                        style={{ width: `${selectedCase.system3.primarySuspect.evidence.aisContinuity}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Forensic Finding Box */}
                <div className="p-3 bg-white rounded-xl border border-[#B7D4E6] text-xs text-slate-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    <strong>Forensic Finding:</strong>{" "}
                    {selectedCase.system3.primarySuspect.summaryRationale}
                  </p>
                </div>

                <button
                  onClick={() => handleStageChange("completed")}
                  className="w-full py-2.5 rounded-xl bg-[#81ac19] hover:bg-[#688a14] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <span>Compile Final Case Summary Dashboard</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ── STAGE 4: FINAL COMPILATION / SUMMARY CASE DASHBOARD ── */}
            {activeStage === "completed" && (
              <CaseSummaryDashboard
                caseRecord={selectedCase}
                onRestart={() => handleStageChange("idle")}
                onInspectStage={(idx) =>
                  handleStageChange(
                    idx === 0
                      ? "system1_detection"
                      : idx === 1
                      ? "system2_drift"
                      : "system3_attribution"
                  )
                }
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}