import React from "react";
import Link from "next/link";
import { System3Data } from "@/types/maritime";
import { Anchor, AlertTriangle, ArrowRight } from "lucide-react";

interface VesselRankingCardProps {
  data: System3Data;
  caseId?: string;
  mode?: "live" | "report";
  isCurrentStage?: boolean;
}

export default function VesselRankingCard({
  data,
  caseId,
  isCurrentStage = false,
}: VesselRankingCardProps) {
  const primarySuspect = data.primarySuspect;

  return (
    <div
      className={`p-5 rounded-3xl transition-all duration-500 bg-white border ${
        isCurrentStage
          ? "border-[#81ac19] ring-2 ring-[#81ac19]/20 shadow-lg shadow-[#81ac19]/5"
          : "border-[#7ee0cf]/60 shadow-sm"
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#e4f7f3] text-[#81ac19] flex items-center justify-center font-bold text-xs border border-[#7ee0cf]/60">
            <Anchor className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#81ac19]">
              System 3 (AIS Attribution)
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Culprit Suspect Ranked</h4>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
          <AlertTriangle className="w-3 h-3 text-rose-600" />
          <span>Attribution Score: {primarySuspect?.overallAttributionConfidence || 87}%</span>
        </div>
      </div>

      {/* Primary Suspect Hero Card */}
      {primarySuspect && (
        <div className="p-4 bg-[#edf5f3] rounded-2xl border border-[#7ee0cf]/60 space-y-3 mb-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400">Rank #1 Primary Culprit</div>
              <div className="font-extrabold text-slate-900 text-base">{primarySuspect.name}</div>
              <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span>MMSI: {primarySuspect.mmsi}</span>
                <span>•</span>
                <span>IMO: {primarySuspect.imo}</span>
                <span>•</span>
                <span>Flag: {primarySuspect.flag}</span>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-xl bg-[#e4f7f3] text-[#007ceb] border border-[#7ee0cf] text-[11px] font-bold">
              {primarySuspect.vesselType}
            </span>
          </div>

          {/* Score breakdown metrics */}
          <div className="space-y-2 text-xs pt-2 border-t border-[#7ee0cf]/40">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-600">Origin Proximity ({primarySuspect.evidence.originProximity}%)</span>
                <span className="font-bold text-slate-900">1.2 km passage</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#81ac19] rounded-full"
                  style={{ width: `${primarySuspect.evidence.originProximity}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-600">
                  AIS Transponder Gap Penalty ({primarySuspect.evidence.aisContinuity}%)
                </span>
                <span className="font-bold text-[#007ceb]">
                  {primarySuspect.hasDarkPeriod ? `${primarySuspect.darkPeriodDurationHours}h Gap` : "Continuous"}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#007ceb] rounded-full"
                  style={{ width: `${primarySuspect.evidence.aisContinuity}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-white rounded-xl border border-[#7ee0cf] text-[11px] text-slate-800 leading-relaxed">
            <strong className="text-[#005bb5]">Rationale:</strong> {primarySuspect.summaryRationale}
          </div>
        </div>
      )}

      {/* Action to open static report if available */}
      {caseId && (
        <Link
          href={`/cases/${caseId}`}
          className="w-full py-2.5 rounded-xl bg-[#007ceb] hover:bg-[#005bb5] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <span>View Detailed Court Evidence Dossier</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
