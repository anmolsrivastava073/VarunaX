"use client";

import React, { useEffect, useState } from "react";
import {
  Satellite,
  Compass,
  Anchor,
  ShieldCheck,
  Loader2,
  Cpu,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { PipelineStage } from "@/types/maritime";

interface SystemProcessingLoaderProps {
  stage: PipelineStage | "completed";
  durationMs?: number;
  onComplete?: () => void;
}

const STAGE_METADATA: Record<
  string,
  {
    name: string;
    stageNum: string;
    subtitle: string;
    accentColor: string;
    icon: typeof Satellite;
    steps: string[];
    tag: string;
  }
> = {
  system1_detection: {
    name: "System 1: SAR Slick Detection",
    stageNum: "Stage 1 of 4",
    subtitle: "Sentinel-1 C-SAR Dual-Pol Ingestion & Neural Segmentation",
    accentColor: "#007ceb",
    icon: Satellite,
    tag: "ESA Sentinel-1 C-SAR",
    steps: [
      "Ingesting Level-1 GRDH IW dual-polarization (VV+VH) radar scene...",
      "Calibrating backscatter cross-section & reflectance damping ratio...",
      "Executing neural texture entropy classifier for biogenic look-alike rejection...",
      "Extracting polygon boundary contour & oil thickness gradient...",
    ],
  },
  system2_drift: {
    name: "System 2: Backward Drift Hindcast",
    stageNum: "Stage 2 of 4",
    subtitle: "Lagrangian Particle Backtracking with CMEMS GLORYS12 & ERA5",
    accentColor: "#00bcd4",
    icon: Compass,
    tag: "CMEMS GLORYS12 + ERA5 CDS",
    steps: [
      "Fetching 1/12° oceanic current velocity vectors from CMEMS GLORYS12...",
      "Ingesting hourly 10m atmospheric wind fields from ECMWF ERA5 / CDS...",
      "Executing backward 4D Lagrangian hydrodynamic advection simulation...",
      "Calculating origin probability ellipse & spatiotemporal uncertainty window...",
    ],
  },
  system3_attribution: {
    name: "System 3: AIS Dark Target Attribution",
    stageNum: "Stage 3 of 4",
    subtitle: "Historical Transponder Interrogation & Vessel Forensic Scoring",
    accentColor: "#81ac19",
    icon: Anchor,
    tag: "Terrestrial + Satellite AIS",
    steps: [
      "Filtering candidate maritime traffic within origin radius...",
      "Screening vessels for transponder dark gap outages & AIS manipulation...",
      "Computing Bayesian trajectory co-location intersection probabilities...",
      "Ranking suspect vessels by multi-factor forensic attribution score...",
    ],
  },
  completed: {
    name: "Compilation: Executive Summary Dashboard",
    stageNum: "Final Compilation",
    subtitle: "Synthesizing Multi-System Evidence Chain of Custody",
    accentColor: "#0D2B45",
    icon: ShieldCheck,
    tag: "IMO / Coast Guard Ready",
    steps: [
      "Correlating Sentinel-1 SAR detection with CMEMS hydrodynamic origin...",
      "Binding primary suspect AIS track to reconstructed spill window...",
      "Generating MARPOL Annex I illegal discharge violation dossier...",
      "Compiling Executive Case Summary Dashboard...",
    ],
  },
};

export default function SystemProcessingLoader({
  stage,
  durationMs = 1500,
  onComplete,
}: SystemProcessingLoaderProps) {
  const [progress, setProgress] = useState(10);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const meta = STAGE_METADATA[stage] || STAGE_METADATA.system1_detection;
  const Icon = meta.icon;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(pct);

      const stepIdx = Math.min(
        meta.steps.length - 1,
        Math.floor((pct / 100) * meta.steps.length)
      );
      setActiveStepIndex(stepIdx);

      if (elapsed >= durationMs) {
        clearInterval(interval);
        if (onComplete) {
          setTimeout(onComplete, 150);
        }
      }
    }, 40);

    return () => clearInterval(interval);
  }, [stage, durationMs, onComplete, meta.steps.length]);

  return (
    <div className="bg-white rounded-3xl border border-[#7ee0cf]/60 p-6 shadow-sm space-y-6 animate-in fade-in zoom-in-95 duration-200">
      {/* Top Banner */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full animate-ping inline-block"
            style={{ backgroundColor: meta.accentColor }}
          />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {meta.stageNum}
          </span>
          <span className="text-slate-300">•</span>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full border"
            style={{
              borderColor: `${meta.accentColor}40`,
              backgroundColor: `${meta.accentColor}12`,
              color: meta.accentColor,
            }}
          >
            Processing Live Telemetry
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
          {meta.tag}
        </span>
      </div>

      {/* Radar Scanner Visual & Status */}
      <div className="flex flex-col items-center justify-center py-6 space-y-4">
        <div className="relative w-24 h-24 flex items-center justify-center">
          {/* Outer Pulsing Rings */}
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-25"
            style={{ backgroundColor: meta.accentColor }}
          />
          <div
            className="absolute inset-2 rounded-full border border-dashed animate-spin opacity-40"
            style={{
              borderColor: meta.accentColor,
              animationDuration: "6s",
            }}
          />
          {/* Inner Circle with Icon */}
          <div
            className="relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg text-white"
            style={{ backgroundColor: meta.accentColor }}
          >
            <Icon className="w-7 h-7 animate-pulse" />
          </div>
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-base font-extrabold text-slate-900">{meta.name}</h3>
          <p className="text-xs text-slate-500 max-w-sm">{meta.subtitle}</p>
        </div>
      </div>

      {/* Progress Bar & Percentage */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-slate-700 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-slate-500" />
            System Computing Workload
          </span>
          <span className="font-mono text-sm" style={{ color: meta.accentColor }}>
            {progress}%
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div
            className="h-full rounded-full transition-all duration-75"
            style={{
              width: `${progress}%`,
              backgroundColor: meta.accentColor,
            }}
          />
        </div>
      </div>

      {/* Sub-steps checklist */}
      <div className="space-y-2 bg-[#f5f9fb] p-3.5 rounded-2xl border border-[#B7D4E6]/50">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
          <Activity className="w-3.5 h-3.5 text-[#007ceb]" />
          <span>Pipeline Telemetry Operations</span>
        </div>
        <div className="space-y-1.5 text-xs">
          {meta.steps.map((st, i) => {
            const isDone = i < activeStepIndex;
            const isCurrent = i === activeStepIndex;
            return (
              <div
                key={i}
                className={`flex items-start gap-2 transition-opacity ${
                  isCurrent
                    ? "font-semibold text-slate-900 opacity-100"
                    : isDone
                    ? "text-slate-500 opacity-80"
                    : "text-slate-400 opacity-40"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600 mt-0.5 shrink-0" />
                ) : isCurrent ? (
                  <Loader2
                    className="w-3.5 h-3.5 animate-spin mt-0.5 shrink-0"
                    style={{ color: meta.accentColor }}
                  />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-300 mt-0.5 shrink-0" />
                )}
                <span className="text-[11px] leading-tight">{st}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
