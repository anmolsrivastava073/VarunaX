"use client";

import React from "react";
import Link from "next/link";
import { CaseRecord } from "@/types/maritime";
import { formatDateTime, getSeverityBadgeClass, getStatusBadgeClass } from "@/lib/utils";
import { ArrowRight, Activity, Eye, Navigation } from "lucide-react";

interface CaseRowProps {
  caseData: CaseRecord;
}

export default function CaseRow({ caseData }: CaseRowProps) {
  const isAnalyzing = caseData.status === "analyzing";
  const targetUrl = isAnalyzing ? `/live?caseId=${caseData.id}` : `/cases/${caseData.id}`;
  const primarySuspect = caseData.system3.primarySuspect;

  return (
    <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#B7D4E6]/60 hover:border-[#1E5A6E] hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      {/* Left: Case Info & Region */}
      <div className="space-y-1.5 min-w-[280px]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 bg-[#e9f2f7] px-2 py-0.5 rounded border border-[#B7D4E6]/40">
            {caseData.caseNumber}
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getSeverityBadgeClass(caseData.severity)}`}>
            {caseData.severity.toUpperCase()}
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(caseData.status)}`}>
            {caseData.statusLabel}
          </span>
        </div>

        <h3 className="font-bold text-slate-900 text-sm sm:text-base hover:text-[#1E5A6E] transition-colors">
          <Link href={targetUrl}>{caseData.title}</Link>
        </h3>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Navigation className="w-3.5 h-3.5 text-[#6BA7A0]" />
            {caseData.locationName}
          </span>
          <span>•</span>
          <span>{formatDateTime(caseData.timestamp)}</span>
        </div>
      </div>

      {/* Middle: Key Telemetry */}
      <div className="grid grid-cols-3 gap-3 bg-[#e9f2f7]/80 p-3 rounded-xl border border-[#B7D4E6]/50 text-xs shrink-0 min-w-[260px]">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Slick Area</span>
          <span className="font-bold text-slate-900 text-sm">{caseData.system1.areaKm2} km²</span>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Est. Age</span>
          <span className="font-bold text-[#1E5A6E] text-sm">{caseData.system1.estimatedSpillAgeHours.bestEstimate}h</span>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Confidence</span>
          <span className="font-bold text-[#6BA7A0] text-sm">
            {primarySuspect?.overallAttributionConfidence || 84}%
          </span>
        </div>
      </div>

      {/* Right: Primary Suspect & Action Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between lg:justify-end gap-3 shrink-0">
        <div className="text-xs">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Top Ranked Suspect</div>
          <div className="font-bold text-slate-900 truncate max-w-[180px]">
            {primarySuspect?.name || "Processing Ingestion..."}
          </div>
          {primarySuspect?.vesselType && (
            <div className="text-[11px] text-slate-500 truncate max-w-[180px]">{primarySuspect.vesselType}</div>
          )}
        </div>

        <Link
          href={targetUrl}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
            isAnalyzing
              ? "bg-[#1E5A6E] text-white hover:bg-[#0D2B45] shadow-sm shadow-[#1E5A6E]/20"
              : "bg-[#0D2B45] text-white hover:bg-[#1E5A6E]"
          }`}
        >
          {isAnalyzing ? (
            <>
              <Activity className="w-3.5 h-3.5 animate-pulse text-white" />
              <span>Watch Live Reveal</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-slate-300" />
              <span>Open Dossier</span>
            </>
          )}
          <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
        </Link>
      </div>
    </div>
  );
}
