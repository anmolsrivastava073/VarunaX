"use client";

import React, { useState } from "react";
import { CaseRecord } from "@/types/maritime";
import {
  Satellite,
  Compass,
  Anchor,
  ShieldCheck,
  Download,
  Send,
  RotateCcw,
  CheckCircle2,
  FileText,
  AlertCircle,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

interface CaseSummaryDashboardProps {
  caseRecord: CaseRecord;
  onRestart?: () => void;
  onInspectStage?: (stageIndex: number) => void;
}

export default function CaseSummaryDashboard({
  caseRecord,
  onRestart,
  onInspectStage,
}: CaseSummaryDashboardProps) {
  const [downloading, setDownloading] = useState(false);
  const [alertDispatched, setAlertDispatched] = useState(false);

  const suspect = caseRecord.system3.primarySuspect;
  const sys1 = caseRecord.system1;
  const sys2 = caseRecord.system2;
  const sys3 = caseRecord.system3;

  const handleDownloadDossier = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      // Generate downloadable summary text file
      const reportText = `VARUNAX MARITIME POLLUTION FORENSIC DOSSIER
==================================================
Case Number: ${caseRecord.caseNumber}
Title: ${caseRecord.title}
Region: ${caseRecord.region}
Incident Coordinates: ${caseRecord.coordinates.lat.toFixed(4)}°N, ${caseRecord.coordinates.lng.toFixed(4)}°E
Status: ${caseRecord.statusLabel}

EXECUTIVE ATTRIBUTION VERDICT
--------------------------------------------------
Primary Suspect Vessel: ${suspect?.name || "Unidentified"}
Vessel Type: ${suspect?.vesselType || "Tanker"}
MMSI / IMO: ${suspect?.mmsi} / ${suspect?.imo}
Flag: ${suspect?.flagCode || suspect?.flag || "Unspecified"}
Overall Forensic Attribution Confidence: ${suspect?.overallAttributionConfidence}%
Estimated Spill Volume: ~${caseRecord.estimatedSpillVolumeBarrels} Barrels
Marine Ecosystem Risk Level: ${caseRecord.marineEcosystemRisk}

SYSTEM 1: SAR SEGMENTATION SUMMARY
--------------------------------------------------
Satellite: ${sys1.satellite}
Sensor Mode: ${sys1.sensor} (${sys1.polarization})
Scene ID: ${sys1.sceneId}
Detected Slick Footprint: ${sys1.areaKm2} km²
Perimeter: ${sys1.perimeterKm} km
Elongation: ${sys1.elongation}:1
Oil Lookalike Confidence: ${sys1.oilLookalikeConfidence}%
Estimated Spill Age Window: ${sys1.estimatedSpillAgeHours.min}–${sys1.estimatedSpillAgeHours.max} hrs

SYSTEM 2: LAGRANGIAN HYDRODYNAMIC HINDCAST
--------------------------------------------------
Ocean Model: CMEMS GLORYS12 (1/12° Reanalysis)
Wind Model: ECMWF ERA5 via Copernicus Climate Data Store (CDS)
Reconstructed Spill Origin: ${sys2.originCoordinates.lat.toFixed(4)}°N, ${sys2.originCoordinates.lng.toFixed(4)}°E
Spatial Uncertainty: ±${sys2.spatialUncertaintyKm} km
Temporal Uncertainty: ±${sys2.temporalUncertaintyHours} hrs
Ocean Surface Current: ${sys2.oceanCurrent.speedKnots} kt @ ${sys2.oceanCurrent.headingDegrees}°
Atmospheric Wind: ${sys2.wind.speedKnots} kt @ ${sys2.wind.directionDegrees}°

SYSTEM 3: AIS DARK TARGET FORENSIC CORRELATION
--------------------------------------------------
Candidate Vessels Screened: ${sys3.candidateVesselsEvaluated} vessels in ${sys3.spatialSearchRadiusKm} km radius
Vessel Speed during Spill Window: ${suspect?.aisTrack?.[0]?.sogKnots ?? 12.5} knots
Distance to Reconstructed Origin: ${suspect?.aisTrack?.[0]?.distanceToOriginKm ?? 3.4} km
AIS Transponder Status: ${suspect?.hasDarkPeriod ? `${suspect.darkPeriodDurationHours}h blackout outage across candidate window` : "Continuous"}
Summary Rationale: ${suspect?.summaryRationale}

Chain of Custody Verified: MARPOL Annex I Illegal Discharge Violation
==================================================`;

      const blob = new Blob([reportText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `VarunaX_Dossier_${caseRecord.caseNumber}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 600);
  };

  const handleDispatchAlert = () => {
    setAlertDispatched(true);
    setTimeout(() => setAlertDispatched(false), 3000);
  };

  return (
    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
      {/* ── HEADER VERDICT CARD ── */}
      <div className="bg-[#0D2B45] text-white p-5 rounded-3xl border border-[#1E5A6E] shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-[#1E5A6E] pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#7ee0cf]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#7ee0cf]">
              Multi-System Forensic Compilation Verdict
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#1E5A6E] text-[10px] font-mono text-[#7ee0cf]">
            IMO / Coast Guard Certified
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] text-slate-300 font-mono mb-0.5">
              PRIMARY SUSPECT VESSEL
            </div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <span>{suspect?.name || "Vessel Target"}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-slate-200 font-normal">
                {suspect?.vesselType}
              </span>
            </h2>
            <div className="text-xs text-slate-300 mt-1 flex flex-wrap gap-x-3 gap-y-0.5 font-mono">
              <span>Flag: {suspect?.flagCode || suspect?.flag || "Unspecified"}</span>
              <span>MMSI: {suspect?.mmsi}</span>
              <span>IMO: {suspect?.imo}</span>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-3 rounded-2xl bg-[#1E5A6E]/60 border border-[#7ee0cf]/30 min-w-[140px]">
            <div className="text-[10px] uppercase font-bold text-slate-300">
              Attribution Score
            </div>
            <div className="text-2xl font-black text-[#7ee0cf]">
              {suspect?.overallAttributionConfidence}%
            </div>
            <div className="text-[9px] text-emerald-300 font-semibold">
              High Confidence
            </div>
          </div>
        </div>

        {/* 4 Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-[#1E5A6E] text-xs">
          <div className="bg-[#103859] p-2 rounded-xl border border-[#1E5A6E]">
            <span className="text-[10px] text-slate-400 block">Spill Volume</span>
            <span className="font-bold text-white">~{caseRecord.estimatedSpillVolumeBarrels} bbls</span>
          </div>
          <div className="bg-[#103859] p-2 rounded-xl border border-[#1E5A6E]">
            <span className="text-[10px] text-slate-400 block">Slick Footprint</span>
            <span className="font-bold text-white">{sys1.areaKm2} km²</span>
          </div>
          <div className="bg-[#103859] p-2 rounded-xl border border-[#1E5A6E]">
            <span className="text-[10px] text-slate-400 block">Dark Gap Outage</span>
            <span className="font-bold text-[#00bcd4]">
              {suspect?.hasDarkPeriod ? `${suspect.darkPeriodDurationHours}h blackout` : "Continuous"}
            </span>
          </div>
          <div className="bg-[#103859] p-2 rounded-xl border border-[#1E5A6E]">
            <span className="text-[10px] text-slate-400 block">Ecosystem Risk</span>
            <span className="font-bold text-rose-300 uppercase">{caseRecord.marineEcosystemRisk}</span>
          </div>
        </div>
      </div>

      {/* ── 3-SYSTEM SYNTHESIS SUMMARY ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1 text-xs font-bold uppercase tracking-wider text-slate-700">
          <span>Synthesized Pipeline Evidence</span>
          <span className="text-[10px] text-slate-500 font-normal">Click any system to inspect</span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {/* System 1 Card */}
          <div
            onClick={() => onInspectStage && onInspectStage(0)}
            className="p-3.5 bg-white rounded-2xl border border-[#007ceb]/40 hover:border-[#007ceb] shadow-sm cursor-pointer transition-all hover:shadow hover:bg-[#f5fbfa] group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#005bb5]">
                <Satellite className="w-3.5 h-3.5 text-[#007ceb]" />
                System 1: SAR Slick Detection & Texture Classification
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#007ceb] group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600">
              <div>
                <span className="text-[10px] text-slate-400 block">Satellite</span>
                <span className="font-semibold text-slate-800">{sys1.satellite}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Surface Area</span>
                <span className="font-semibold text-slate-800">{sys1.areaKm2} km²</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Confidence</span>
                <span className="font-semibold text-emerald-600">{sys1.oilLookalikeConfidence}%</span>
              </div>
            </div>
          </div>

          {/* System 2 Card */}
          <div
            onClick={() => onInspectStage && onInspectStage(1)}
            className="p-3.5 bg-white rounded-2xl border border-[#00bcd4]/40 hover:border-[#00bcd4] shadow-sm cursor-pointer transition-all hover:shadow hover:bg-[#f5fbfa] group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#00838f]">
                <Compass className="w-3.5 h-3.5 text-[#00bcd4]" />
                System 2: Lagrangian Drift Hindcasting & Reconstructed Origin
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#00bcd4] group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600">
              <div>
                <span className="text-[10px] text-slate-400 block">Origin Coords</span>
                <span className="font-semibold text-slate-800">
                  {sys2.originCoordinates.lat.toFixed(2)}°N, {sys2.originCoordinates.lng.toFixed(2)}°E
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Uncertainty</span>
                <span className="font-semibold text-slate-800">±{sys2.spatialUncertaintyKm} km</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Drift Drivers</span>
                <span className="font-semibold text-slate-800">CMEMS + ERA5</span>
              </div>
            </div>
          </div>

          {/* System 3 Card */}
          <div
            onClick={() => onInspectStage && onInspectStage(2)}
            className="p-3.5 bg-white rounded-2xl border border-[#81ac19]/40 hover:border-[#81ac19] shadow-sm cursor-pointer transition-all hover:shadow hover:bg-[#f5fbfa] group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#558b2f]">
                <Anchor className="w-3.5 h-3.5 text-[#81ac19]" />
                System 3: AIS Vessel Forensic Correlation & Dark Analysis
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#81ac19] group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600">
              <div>
                <span className="text-[10px] text-slate-400 block">Screened Traffic</span>
                <span className="font-semibold text-slate-800">{sys3.candidateVesselsEvaluated} Vessels</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Dark Outage</span>
                <span className="font-semibold text-rose-600">
                  {suspect?.hasDarkPeriod ? `${suspect.darkPeriodDurationHours}h Gap` : "None"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Attribution</span>
                <span className="font-semibold text-emerald-600">{suspect?.overallAttributionConfidence}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── LEGAL RATIONALE SUMMARY ── */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1">
        <div className="font-bold text-slate-900 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-[#007ceb]" />
          <span>Forensic Evidence Summary</span>
        </div>
        <p className="text-[11px] text-slate-600">{suspect?.summaryRationale}</p>
      </div>

      {/* ── ACTION BUTTONS ── */}
      <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
        <button
          onClick={handleDownloadDossier}
          disabled={downloading}
          className="w-full sm:flex-1 py-3 rounded-2xl bg-[#007ceb] hover:bg-[#005bb5] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? "Compiling Dossier..." : "Download Legal Dossier (.txt)"}</span>
        </button>

        <button
          onClick={handleDispatchAlert}
          className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-[#00bcd4] hover:bg-[#0097a7] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <Send className="w-4 h-4" />
          <span>{alertDispatched ? "Alert Dispatched!" : "Notify Coast Guard"}</span>
        </button>

        {onRestart && (
          <button
            onClick={onRestart}
            className="w-full sm:w-auto p-3 rounded-2xl bg-white border border-[#7ee0cf] hover:bg-[#e4f7f3] text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            title="Restart Simulation"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="sm:hidden">Restart Simulation</span>
          </button>
        )}
      </div>
    </div>
  );
}
