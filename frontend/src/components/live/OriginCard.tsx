import React from "react";
import { System2Data } from "@/types/maritime";
import { Compass, Wind, Waves, MapPin, CheckCircle2 } from "lucide-react";

interface OriginCardProps {
  data: System2Data;
  mode?: "live" | "report";
  isCurrentStage?: boolean;
}

export default function OriginCard({ data, isCurrentStage = false }: OriginCardProps) {
  return (
    <div
      className={`p-5 rounded-3xl transition-all duration-500 bg-white border ${
        isCurrentStage
          ? "border-[#00bcd4] ring-2 ring-[#00bcd4]/20 shadow-lg shadow-[#00bcd4]/5"
          : "border-[#7ee0cf]/60 shadow-sm"
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#e4f7f3] text-[#00bcd4] flex items-center justify-center font-bold text-xs border border-[#7ee0cf]/60">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#0097a7]">System 2 (Drift Hindcast)</div>
            <h4 className="font-bold text-slate-900 text-sm">Origin Probability Reconstruction</h4>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-semibold text-[#0097a7] bg-[#e4f7f3] px-2 py-0.5 rounded-full border border-[#7ee0cf]">
          <CheckCircle2 className="w-3 h-3 text-[#00bcd4]" />
          <span>Hindcast Solved</span>
        </div>
      </div>

      {/* Origin Target Box */}
      <div className="p-3.5 bg-gradient-to-r from-[#e4f7f3] to-white rounded-2xl border border-[#7ee0cf] mb-4 space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#00bcd4]" />
            Estimated Origin Coordinates:
          </span>
          <span className="font-bold text-slate-900 text-sm">
            {data.originCoordinates.lat.toFixed(3)}°N, {data.originCoordinates.lng.toFixed(3)}°E
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-600 text-[11px]">
          <span>Spatial Uncertainty: ±{data.spatialUncertaintyKm} km</span>
          <span>Temporal: ±{data.temporalUncertaintyHours}h</span>
        </div>
      </div>

      {/* Hydrodynamic & Wind Vector Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs mb-3">
        <div className="bg-[#edf5f3] p-2.5 rounded-xl border border-[#7ee0cf]/40">
          <div className="text-[10px] text-slate-500 font-semibold uppercase flex items-center gap-1">
            <Waves className="w-3 h-3 text-[#00bcd4]" />
            Ocean Current
          </div>
          <div className="font-bold text-slate-900 text-sm mt-0.5">
            {data.oceanCurrent.speedKnots} kt @ {data.oceanCurrent.headingDegrees.toFixed(0)}°
          </div>
          <div className="text-[10px] text-slate-500">
            u: {data.oceanCurrent.uVelocity} m/s, v: {data.oceanCurrent.vVelocity} m/s
          </div>
        </div>

        <div className="bg-[#edf5f3] p-2.5 rounded-xl border border-[#7ee0cf]/40">
          <div className="text-[10px] text-slate-500 font-semibold uppercase flex items-center gap-1">
            <Wind className="w-3 h-3 text-[#00bcd4]" />
            Surface Windage (3%)
          </div>
          <div className="font-bold text-slate-900 text-sm mt-0.5">
            {data.wind.speedKnots} kt @ {data.wind.directionDegrees}°
          </div>
          <div className="text-[10px] text-slate-500">
            u: {data.wind.uComponent} kt, v: {data.wind.vComponent} kt
          </div>
        </div>
      </div>

      <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
        <span>Particle Dispersion: {data.particleCount} Lagrangian points</span>
        <span>Model: OpenDrift Euler Backtracking</span>
      </div>
    </div>
  );
}
