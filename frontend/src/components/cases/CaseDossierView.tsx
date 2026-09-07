"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CaseRecord } from "@/types/maritime";
import MapLibreMap from "@/components/map/MapLibreMap";
import AttributionRadar from "./AttributionRadar";
import AISTrackTable from "./AISTrackTable";
import { formatDateTime, getSeverityBadgeClass, getStatusBadgeClass } from "@/lib/utils";
import {
  FileText,
  Shield,
  Compass,
  Satellite,
  Anchor,
  Printer,
  CheckCircle2,
  MapPin,
  X,
} from "lucide-react";

interface CaseDossierViewProps {
  caseData: CaseRecord;
}

export default function CaseDossierView({ caseData }: CaseDossierViewProps) {
  const [showReportModal, setShowReportModal] = useState(false);
  const primarySuspect = caseData.system3.primarySuspect;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Incident Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#7ee0cf]/60 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 bg-[#edf5f3] px-2.5 py-1 rounded-lg border border-[#7ee0cf]/40">
              {caseData.caseNumber}
            </span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getSeverityBadgeClass(caseData.severity)}`}>
              {caseData.severity.toUpperCase()} SEVERITY
            </span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusBadgeClass(caseData.status)}`}>
              {caseData.statusLabel}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{caseData.title}</h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-[#00bcd4]" />
              {caseData.locationName}
            </span>
            <span>•</span>
            <span>Observation: {formatDateTime(caseData.timestamp)}</span>
            <span>•</span>
            <span>Volume: ~{caseData.estimatedSpillVolumeBarrels.toLocaleString()} bbls</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => setShowReportModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#007ceb] hover:bg-[#005bb5] text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02]"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Coast Guard Dossier</span>
          </button>

          <Link
            href={`/live?caseId=${caseData.id}`}
            className="px-4 py-2.5 rounded-xl bg-[#edf5f3] hover:bg-[#e4f7f3] text-slate-800 border border-[#7ee0cf] text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Compass className="w-4 h-4 text-[#00bcd4]" />
            <span>Replay Simulation</span>
          </Link>
        </div>
      </div>

      {/* Forensic GIS Map View */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <Shield className="w-4 h-4 text-[#007ceb]" />
            <span>Multi-Layer Maritime GIS Reconstruction</span>
          </div>
          <span className="text-xs text-slate-500">
            Includes SAR boundary, particle hindcast track & AIS suspect route
          </span>
        </div>

        <div className="bg-white p-2 rounded-3xl border border-[#7ee0cf]/60 shadow-sm">
          <MapLibreMap caseData={caseData} stage="completed" height="520px" />
        </div>
      </div>

      {/* 3 Pipeline System Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* System 1 Box */}
        <div className="bg-white p-5 rounded-3xl border border-[#7ee0cf]/60 space-y-3">
          <div className="flex items-center gap-2 text-[#005bb5] font-bold text-xs uppercase tracking-wider">
            <Satellite className="w-4 h-4 text-[#007ceb]" />
            <span>1. Satellite SAR Morphology</span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Surface Area</span>
              <span className="font-bold text-slate-900">{caseData.system1.areaKm2} km²</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Perimeter Length</span>
              <span className="font-bold text-slate-900">{caseData.system1.perimeterKm} km</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Mineral Oil Precision</span>
              <span className="font-bold text-[#81ac19]">{caseData.system1.oilLookalikeConfidence}%</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Estimated Age Prior</span>
              <span className="font-bold text-[#007ceb]">
                {caseData.system1.estimatedSpillAgeHours.min}–{caseData.system1.estimatedSpillAgeHours.max} hrs
              </span>
            </div>
          </div>
        </div>

        {/* System 2 Box */}
        <div className="bg-white p-5 rounded-3xl border border-[#7ee0cf]/60 space-y-3">
          <div className="flex items-center gap-2 text-[#0097a7] font-bold text-xs uppercase tracking-wider">
            <Compass className="w-4 h-4 text-[#00bcd4]" />
            <span>2. Hydrodynamic Drift</span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Origin Coordinates</span>
              <span className="font-bold text-slate-900">
                {caseData.system2.originCoordinates.lat.toFixed(3)}°N, {caseData.system2.originCoordinates.lng.toFixed(3)}°E
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Surface Current Speed</span>
              <span className="font-bold text-slate-900">{caseData.system2.oceanCurrent.speedKnots} kt</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Windage Speed</span>
              <span className="font-bold text-slate-900">{caseData.system2.wind.speedKnots} kt</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Origin Spatial Uncertainty</span>
              <span className="font-bold text-[#0097a7]">±{caseData.system2.spatialUncertaintyKm} km</span>
            </div>
          </div>
        </div>

        {/* System 3 Box */}
        <div className="bg-white p-5 rounded-3xl border border-[#7ee0cf]/60 space-y-3">
          <div className="flex items-center gap-2 text-[#81ac19] font-bold text-xs uppercase tracking-wider">
            <Anchor className="w-4 h-4 text-[#81ac19]" />
            <span>3. AIS Suspect Attribution</span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Ranked Culprit</span>
              <span className="font-bold text-slate-900 truncate max-w-[140px]">{primarySuspect?.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">MMSI / IMO</span>
              <span className="font-bold text-slate-900">
                {primarySuspect?.mmsi} / {primarySuspect?.imo}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Dark Gap Outage</span>
              <span className="font-bold text-[#007ceb]">
                {primarySuspect?.hasDarkPeriod ? `${primarySuspect.darkPeriodDurationHours}h Gap` : "None"}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Overall Attribution Conf.</span>
              <span className="font-bold text-[#81ac19]">
                {primarySuspect?.overallAttributionConfidence}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Attribution Radar & Candidate Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Radar & Explainability Score */}
        <div className="lg:col-span-5">
          {primarySuspect && (
            <AttributionRadar
              evidence={primarySuspect.evidence}
              overallScore={primarySuspect.overallAttributionConfidence}
            />
          )}
        </div>

        {/* Suspect Ranking List */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-[#7ee0cf]/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Suspect Evaluation</div>
              <h3 className="font-bold text-slate-900 text-base">Candidate Vessels Ranked by Spatio-Temporal Match</h3>
            </div>
            <span className="text-xs text-slate-500">
              {caseData.system3.rankedVessels.length || 1} Evaluated
            </span>
          </div>

          <div className="space-y-3">
            {caseData.system3.rankedVessels.map((v) => (
              <div
                key={v.mmsi}
                className={`p-4 rounded-2xl border transition-all ${
                  v.isCulpritSuspect
                    ? "bg-[#e4f7f3]/60 border-[#7ee0cf] ring-1 ring-[#007ceb]/20"
                    : "bg-[#edf5f3]/70 border-[#7ee0cf]/40"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        v.isCulpritSuspect ? "bg-[#007ceb] text-white" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      #{v.rank}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{v.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {v.vesselType} • Flag: {v.flag} • MMSI: {v.mmsi}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-slate-400">Score:</span>
                    <span
                      className={`text-base font-extrabold ${
                        v.isCulpritSuspect ? "text-[#007ceb]" : "text-slate-700"
                      }`}
                    >
                      {v.overallAttributionConfidence}%
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded-xl border border-[#7ee0cf]/50">
                  {v.summaryRationale}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AIS Historical Waypoints Table */}
      <AISTrackTable waypoints={primarySuspect?.aisTrack || []} />

      {/* Printable / Legal Dossier Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#7ee0cf] space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#007ceb] text-white flex items-center justify-center shadow-md">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                    Maritime Authority Legal Evidence Dossier
                  </h3>
                  <p className="text-xs text-slate-500">Document Ref: DOSSIER-{caseData.caseNumber}</p>
                </div>
              </div>

              <button
                onClick={() => setShowReportModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-[#edf5f3] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 bg-[#edf5f3] rounded-2xl border border-[#7ee0cf] space-y-2">
                <div className="font-bold text-slate-900 text-sm">EXECUTIVE FORENSIC SUMMARY</div>
                <p>
                  Satellite radar imagery from Sentinel-1 C-SAR at {formatDateTime(caseData.timestamp)} confirmed a mineral
                  hydrocarbon slick of <strong>{caseData.system1.areaKm2} km²</strong> in {caseData.region}.
                </p>
                <p>
                  Backward Lagrangian drift trajectory hindcasting computed an origin epicenter at{" "}
                  <strong>
                    {caseData.system2.originCoordinates.lat.toFixed(3)}°N,{" "}
                    {caseData.system2.originCoordinates.lng.toFixed(3)}°E
                  </strong>{" "}
                  (±{caseData.system2.spatialUncertaintyKm} km).
                </p>
                <p>
                  Historical AIS correlation identified <strong>{primarySuspect?.name}</strong> (IMO {primarySuspect?.imo}
                  , Flag {primarySuspect?.flag}) as the primary responsible vessel with an explainable composite confidence
                  score of <strong>{primarySuspect?.overallAttributionConfidence}%</strong>.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 bg-white rounded-xl border border-[#7ee0cf]/60">
                  <span className="text-slate-400 block mb-0.5">AIS Transponder Status</span>
                  <span className="font-bold text-[#007ceb]">
                    {primarySuspect?.hasDarkPeriod ? `${primarySuspect.darkPeriodDurationHours}h Gap at Origin` : "Continuous"}
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#7ee0cf]/60">
                  <span className="text-slate-400 block mb-0.5">Estimated Spill Volume</span>
                  <span className="font-bold text-slate-900">~{caseData.estimatedSpillVolumeBarrels} Barrels</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-xl bg-[#edf5f3] hover:bg-[#e4f7f3] text-slate-800 text-xs font-semibold flex items-center gap-1.5 border border-[#7ee0cf]/60 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Dossier</span>
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 rounded-xl bg-[#007ceb] hover:bg-[#005bb5] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Dispatch to Coast Guard Network</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
