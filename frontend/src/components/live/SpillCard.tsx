import React from "react";
import { System1Data } from "@/types/maritime";
import { Satellite, Clock, CheckCircle2 } from "lucide-react";

interface SpillCardProps {
  data: System1Data;
  mode?: "live" | "report";
  isCurrentStage?: boolean;
}

export default function SpillCard({ data, isCurrentStage = false }: SpillCardProps) {
  return (
    <div
      className={`p-5 rounded-3xl transition-all duration-500 bg-white border ${
        isCurrentStage
          ? "border-[#007ceb] ring-2 ring-[#007ceb]/20 shadow-lg shadow-[#007ceb]/5"
          : "border-[#7ee0cf]/60 shadow-sm"
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#e4f7f3] text-[#007ceb] flex items-center justify-center font-bold text-xs border border-[#7ee0cf]/60">
            <Satellite className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#005bb5]">System 1 (SAR Detection)</div>
            <h4 className="font-bold text-slate-900 text-sm">Slick Geometry & Age Prior</h4>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-semibold text-[#005bb5] bg-[#e4f7f3] px-2 py-0.5 rounded-full border border-[#7ee0cf]">
          <CheckCircle2 className="w-3 h-3 text-[#007ceb]" />
          <span>SAR Segmented</span>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
        <div className="bg-[#edf5f3] p-2.5 rounded-xl border border-[#7ee0cf]/40">
          <span className="text-[10px] text-slate-500 block font-semibold uppercase">Area</span>
          <span className="font-bold text-slate-900 text-sm">{data.areaKm2} km²</span>
        </div>

        <div className="bg-[#edf5f3] p-2.5 rounded-xl border border-[#7ee0cf]/40">
          <span className="text-[10px] text-slate-500 block font-semibold uppercase">Perimeter</span>
          <span className="font-bold text-slate-900 text-sm">{data.perimeterKm} km</span>
        </div>

        <div className="bg-[#edf5f3] p-2.5 rounded-xl border border-[#7ee0cf]/40">
          <span className="text-[10px] text-slate-500 block font-semibold uppercase">Elongation</span>
          <span className="font-bold text-slate-900 text-sm">{data.elongation} : 1</span>
        </div>

        <div className="bg-[#edf5f3] p-2.5 rounded-xl border border-[#7ee0cf]/40">
          <span className="text-[10px] text-slate-500 block font-semibold uppercase">SAR Texture</span>
          <span className="font-bold text-slate-900 text-sm">{data.sarTextureEntropy}</span>
        </div>
      </div>

      {/* Age Estimation Window */}
      <div className="p-3 bg-[#e4f7f3]/80 rounded-2xl border border-[#7ee0cf] space-y-1.5 text-xs text-slate-900">
        <div className="flex items-center justify-between">
          <span className="font-semibold flex items-center gap-1.5 text-[#005bb5]">
            <Clock className="w-3.5 h-3.5 text-[#007ceb]" />
            Estimated Age Window Prior:
          </span>
          <span className="font-bold text-[#007ceb]">
            {data.estimatedSpillAgeHours.min}–{data.estimatedSpillAgeHours.max} hrs
          </span>
        </div>

        <div className="text-[11px] text-slate-600">
          Spill Range: {data.candidateSpillTimeWindow.start.substring(11, 16)} → {data.candidateSpillTimeWindow.end.substring(11, 16)} UTC
        </div>
      </div>

      {/* Satellite Metadata Bar */}
      <div className="mt-3 pt-2 text-[10px] text-slate-400 flex items-center justify-between">
        <span>Scene: {data.sceneId.substring(0, 24)}...</span>
        <span>Pol: {data.polarization} • {data.resolutionMeters}m</span>
      </div>
    </div>
  );
}
