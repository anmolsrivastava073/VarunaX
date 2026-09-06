"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MOCK_CASES } from "@/data/mockCases";
import MapLibreMap from "@/components/map/MapLibreMap";
import {
  Satellite,
  Compass,
  Anchor,
  Clock,
  Wind,
  Waves,
  Layers,
  ChevronRight,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

export default function PipelineDemoSection() {
  const [activeStage, setActiveStage] = useState<"system1_detection" | "system2_drift" | "system3_attribution">(
    "system1_detection"
  );
  const sampleCase = MOCK_CASES[0]; // Mumbai High Incursion

  return (
    <section id="interactive-demo" className="py-24 bg-white border-t border-[#B7D4E6]/40 relative overflow-hidden">
      
      {/* --- DECORATIVE SIDE GRAPHICS --- */}
      {/* Left Graphic */}
      <img
        src="/1.gif"
        alt="Decorative element left"
        className="absolute left-15 top-10 w-32 md:w-56 lg:w-72 object-contain pointer-events-none hidden md:block opacity-90 z-0"
      />
      {/* Right Graphic */}
      <img
        src="/3.gif"
        alt="Decorative element right"
        className="absolute right-15 top-17 w-32 md:w-56 lg:w-72 object-contain pointer-events-none hidden md:block opacity-90 z-0"
      />
      {/* -------------------------------- */}

      {/* Main Container (z-10 ensures it stays above the side graphics) */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-5xl sm:text-5xl font-extrabold text-[#0D2B45] tracking-leading">
            How the 3-System AI Engine Reconstructs &amp; Attributes Slicks
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Rather than relying on a black-box model, OceanSentinel orchestrates a chain of verifiable, scientifically
            defensible evidence layers from satellite observation to vessel court dossier.
          </p>
        </div>

        {/* Step Selector Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button
            onClick={() => setActiveStage("system1_detection")}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
              activeStage === "system1_detection"
                ? "bg-[#6BA7A0] text-white shadow-md shadow-[#6BA7A0]/20 ring-2 ring-[#6BA7A0]"
                : "bg-[#f5f9fb] text-slate-700 hover:bg-[#e9f2f7]"
            }`}
          >
            <Satellite className="w-4 h-4" />
            <span>1. SAR Segmentation &amp; Age Prior</span>
          </button>

          <button
            onClick={() => setActiveStage("system2_drift")}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
              activeStage === "system2_drift"
                ? "bg-[#6BA7A0] text-white shadow-md shadow-[#6BA7A0]/20 ring-2 ring-[#6BA7A0]"
                : "bg-[#f5f9fb] text-slate-700 hover:bg-[#e9f2f7]"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>2. Backward Lagrangian Drift Hindcast</span>
          </button>

          <button
            onClick={() => setActiveStage("system3_attribution")}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
              activeStage === "system3_attribution"
                ? "bg-[#6BA7A0] text-white shadow-md shadow-[#6BA7A0]/20 ring-2 ring-[#6BA7A0]"
                : "bg-[#f5f9fb] text-slate-700 hover:bg-[#e9f2f7]"
            }`}
          >
            <Anchor className="w-4 h-4" />
            <span>3. AIS Correlation &amp; Suspect Dossier</span>
          </button>
        </div>

        {/* Main Interactive Demo Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Interactive MapLibre Map */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="bg-[#f5f9fb] p-2 rounded-3xl border border-[#B7D4E6]/60 shadow-sm h-full">
              <MapLibreMap caseData={sampleCase} stage={activeStage} height="480px" />
              <div className="mt-3 px-3 py-2 flex items-center justify-between text-xs text-slate-600 bg-white rounded-xl border border-[#B7D4E6]/50">
                <span className="flex items-center gap-1.5 font-medium text-slate-800">
                  <span className="w-2 h-2 rounded-full bg-[#6BA7A0]" />
                  Showing Region: {sampleCase.region}
                </span>
                <span className="text-[11px] font-medium text-[#1E5A6E]">Lat: {sampleCase.coordinates.lat}°N, Lng: {sampleCase.coordinates.lng}°E</span>
              </div>
            </div>
          </div>

          {/* Right Column: Explanatory Telemetry & Evidence Breakdown */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            {activeStage === "system1_detection" && (
              <div className="p-6 rounded-3xl bg-[#f5f9fb] border border-[#6BA7A0] space-y-5 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6BA7A0]">System 1 Output</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#0D2B45] mb-2">Sentinel-1 C-SAR Slick Segmentation</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Processes dual-polarization (VV+VH) SAR scenes to extract geometric features and eliminate look-alikes
                    like biogenic algal blooms or low-wind calm zones.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-[#B7D4E6]/60">
                    <span className="text-slate-500 block mb-1">Detected Area</span>
                    <span className="text-base font-bold text-slate-900">
                      {sampleCase.system1.areaKm2} km²
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#B7D4E6]/60">
                    <span className="text-slate-500 block mb-1">Perimeter Length</span>
                    <span className="text-base font-bold text-slate-900">
                      {sampleCase.system1.perimeterKm} km
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#B7D4E6]/60">
                    <span className="text-slate-500 block mb-1">Elongation Ratio</span>
                    <span className="text-base font-bold text-slate-900">
                      {sampleCase.system1.elongation} : 1
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#B7D4E6]/60">
                    <span className="text-slate-500 block mb-1">Estimated Age Prior</span>
                    <span className="text-base font-bold text-[#1E5A6E]">
                      {sampleCase.system1.estimatedSpillAgeHours.min}–{sampleCase.system1.estimatedSpillAgeHours.max} hrs
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-[#B7D4E6] text-xs text-slate-800">
                  <div className="font-semibold mb-1 flex items-center gap-1.5 text-[#1E5A6E]">
                    <Clock className="w-3.5 h-3.5 text-[#1E5A6E]" />
                    Candidate Spill-Time Search Window:
                  </div>
                  <div className="text-[11px] text-slate-600">
                    {sampleCase.system1.candidateSpillTimeWindow.start} → {sampleCase.system1.candidateSpillTimeWindow.end}
                  </div>
                </div>

                <button
                  onClick={() => setActiveStage("system2_drift")}
                  className="w-full py-2.5 rounded-xl bg-[#1E5A6E] text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-[#0D2B45] transition-colors shadow-sm"
                >
                  <span>Advance to Drift Hindcasting</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {activeStage === "system2_drift" && (
              <div className="p-6 rounded-3xl bg-[#f5f9fb] border border-[#6BA7A0]/60 space-y-5 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6BA7A0]">System 2 Output</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#0D2B45] mb-2">Lagrangian Backward Drift Simulation</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Backtracks the slick through historical ocean currents and windage fields to calculate the
                    probabilistic origin ellipse rather than a naive single point.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-[#B7D4E6]/60">
                    <span className="text-slate-500 block mb-1">Ocean Current Speed</span>
                    <span className="text-base font-bold text-slate-900 flex items-center gap-1">
                      <Waves className="w-3.5 h-3.5 text-[#6BA7A0]" />
                      {sampleCase.system2.oceanCurrent.speedKnots} kt
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#B7D4E6]/60">
                    <span className="text-slate-500 block mb-1">Wind Vector Velocity</span>
                    <span className="text-base font-bold text-slate-900 flex items-center gap-1">
                      <Wind className="w-3.5 h-3.5 text-[#6BA7A0]" />
                      {sampleCase.system2.wind.speedKnots} kt @ {sampleCase.system2.wind.directionDegrees}°
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#B7D4E6]/60">
                    <span className="text-slate-500 block mb-1">Spatial Uncertainty</span>
                    <span className="text-base font-bold text-slate-900">
                      ± {sampleCase.system2.spatialUncertaintyKm} km radius
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#B7D4E6]/60">
                    <span className="text-slate-500 block mb-1">Temporal Uncertainty</span>
                    <span className="text-base font-bold text-[#6BA7A0]">
                      ± {sampleCase.system2.temporalUncertaintyHours} hrs
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-[#B7D4E6] text-xs text-slate-800">
                  <div className="font-semibold mb-1 flex items-center gap-1.5 text-[#6BA7A0]">
                    <Compass className="w-3.5 h-3.5 text-[#6BA7A0]" />
                    Estimated Origin Coordinate &amp; Time:
                  </div>
                  <div className="text-[11px] text-slate-600">
                    {sampleCase.system2.originCoordinates.lat}°N, {sampleCase.system2.originCoordinates.lng}°E •{" "}
                    {sampleCase.system2.mostProbableTimeWindow.start.substring(11, 16)}–
                    {sampleCase.system2.mostProbableTimeWindow.end.substring(11, 16)} UTC
                  </div>
                </div>

                <button
                  onClick={() => setActiveStage("system3_attribution")}
                  className="w-full py-2.5 rounded-xl bg-[#6BA7A0] text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-[#1E5A6E] transition-colors shadow-sm"
                >
                  <span>Advance to AIS Attribution</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {activeStage === "system3_attribution" && (
              <div className="p-6 rounded-3xl bg-[#f5f9fb] border border-[#6BA7A0] space-y-5 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6BA7A0]">System 3 Output</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#0D2B45] mb-2">
                    {sampleCase.system3.primarySuspect.name}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Correlates candidate AIS traffic with origin space-time constraints, pinpointing suspicious speed
                    drops and AIS transponder dark periods.
                  </p>
                </div>

                {/* Score Progress Bars */}
                <div className="space-y-2.5 text-xs bg-white p-3.5 rounded-2xl border border-[#B7D4E6]/60">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-600">Origin Proximity Compatibility</span>
                      <span className="font-bold text-slate-900">
                        {sampleCase.system3.primarySuspect.evidence.originProximity}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1E5A6E] rounded-full"
                        style={{ width: `${sampleCase.system3.primarySuspect.evidence.originProximity}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-600">Temporal Compatibility</span>
                      <span className="font-bold text-slate-900">
                        {sampleCase.system3.primarySuspect.evidence.temporalCompatibility}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#6BA7A0] rounded-full"
                        style={{ width: `${sampleCase.system3.primarySuspect.evidence.temporalCompatibility}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-600">AIS Continuity &amp; Dark Gap Penalty</span>
                      <span className="font-bold text-[#1E5A6E]">
                        {sampleCase.system3.primarySuspect.evidence.aisContinuity}% (2.3h Outage)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0D2B45] rounded-full"
                        style={{ width: `${sampleCase.system3.primarySuspect.evidence.aisContinuity}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-[#B7D4E6] text-xs text-slate-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#1E5A6E] shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    <strong>Forensic Finding:</strong> {sampleCase.system3.primarySuspect.summaryRationale}
                  </p>
                </div>

                <Link
                  href={`/cases/${sampleCase.id}`}
                  className="w-full py-2.5 rounded-xl bg-[#0D2B45] text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-[#1E5A6E] transition-colors shadow-sm"
                >
                  <span>View Full Forensic Case Dossier</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}