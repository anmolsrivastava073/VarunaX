import React from "react";
import { EvidenceFeatures } from "@/types/maritime";
import { ShieldCheck } from "lucide-react";

interface AttributionRadarProps {
  evidence: EvidenceFeatures;
  overallScore: number;
}

export default function AttributionRadar({ evidence, overallScore }: AttributionRadarProps) {
  const metrics = [
    { label: "Origin Proximity", value: evidence.originProximity, weight: "25%", color: "text-[#81ac19]", barColor: "bg-[#81ac19]" },
    { label: "Temporal Match", value: evidence.temporalCompatibility, weight: "25%", color: "text-[#81ac19]", barColor: "bg-[#81ac19]" },
    { label: "Trajectory Intersect", value: evidence.trajectoryMatch, weight: "20%", color: "text-[#00bcd4]", barColor: "bg-[#00bcd4]" },
    { label: "AIS Dark Gap / Anomaly", value: evidence.aisContinuity, weight: "15%", color: "text-[#007ceb]", barColor: "bg-[#007ceb]" },
    { label: "Vessel Type Relevance", value: evidence.vesselTypeRelevance, weight: "15%", color: "text-[#005bb5]", barColor: "bg-[#007ceb]" },
  ];

  return (
    <div className="bg-white p-6 rounded-3xl border border-[#7ee0cf]/60 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Explainable AI Scoring</div>
          <h3 className="font-bold text-slate-900 text-base">Multi-Factor Attribution Weights</h3>
        </div>

        <div className="flex items-baseline gap-1 bg-[#e4f7f3] px-3 py-1.5 rounded-2xl border border-[#7ee0cf]">
          <span className="text-xl font-extrabold text-[#005bb5]">{overallScore}%</span>
          <span className="text-[10px] font-bold text-[#007ceb] uppercase">Composite Score</span>
        </div>
      </div>

      {/* Progress Bars Breakdown */}
      <div className="space-y-4">
        {metrics.map((m) => (
          <div key={m.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">{m.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400">Weight: {m.weight}</span>
                <span className={`font-bold ${m.color}`}>{m.value}%</span>
              </div>
            </div>

            <div className="w-full h-2 bg-[#edf5f3] rounded-full overflow-hidden">
              <div className={`h-full ${m.barColor} rounded-full transition-all duration-700`} style={{ width: `${m.value}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="p-3.5 bg-[#edf5f3] rounded-2xl border border-[#7ee0cf]/60 text-xs text-slate-600 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-[#007ceb] shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          Calibrated Bayesian scoring model verified against historical SIH benchmark oil releases and AccessAIS transit
          ground-truth data.
        </p>
      </div>
    </div>
  );
}
