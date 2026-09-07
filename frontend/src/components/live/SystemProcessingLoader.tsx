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
    stageNum: "Stage 1",
    subtitle: "Sentinel-1 C-SAR Dual-Pol Ingestion & Neural Segmentation",
    accentColor: "#00bcd4",
    icon: Satellite,
    tag: "ESA Sentinel-1",
    steps: [
      "Calibrating dual-polarization (VV+VH) backscatter damping ratio...",
      "Running texture entropy CNN classifier for look-alike rejection...",
      "Tracing multi-node polygon boundary contour & centroid...",
    ],
  },
  system2_drift: {
    name: "System 2: Backward Drift Hindcast",
    stageNum: "Stage 2",
    subtitle: "Lagrangian Particle Backtracking (GLORYS12 + ERA5 CDS)",
    accentColor: "#7ee0cf",
    icon: Compass,
    tag: "CMEMS + ERA5 CDS",
    steps: [
      "Fetching 1/12° oceanic surface current vectors from CMEMS...",
      "Ingesting hourly 10m atmospheric wind fields from ERA5 CDS...",
      "Executing 4D backward Lagrangian trajectory advection...",
    ],
  },
  system3_attribution: {
    name: "System 3: AIS Target Attribution",
    stageNum: "Stage 3",
    subtitle: "Historical Transponder Interrogation & Dark Gap Screening",
    accentColor: "#a3d328",
    icon: Anchor,
    tag: "AccessAIS",
    steps: [
      "Filtering candidate maritime traffic within origin radius...",
      "Screening vessels for transponder dark gap blackout outages...",
      "Ranking suspect vessels by multi-factor forensic attribution...",
    ],
  },
  completed: {
    name: "Compilation: Case Summary Dashboard",
    stageNum: "Compilation",
    subtitle: "Synthesizing Multi-System Chain of Custody",
    accentColor: "#7ee0cf",
    icon: ShieldCheck,
    tag: "IMO / Coast Guard Ready",
    steps: [
      "Binding Sentinel-1 SAR footprint to hydrodynamic origin...",
      "Correlating suspect vessel track with reconstructed spill time...",
      "Compiling Executive Forensic Summary Case Dashboard...",
    ],
  },
};

export default function SystemProcessingLoader({
  stage,
  durationMs = 1200,
  onComplete,
}: SystemProcessingLoaderProps) {
  const [progress, setProgress] = useState(12);
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
          setTimeout(onComplete, 120);
        }
      }
    }, 35);

    return () => clearInterval(interval);
  }, [stage, durationMs, onComplete, meta.steps.length]);

  return (
    <div className="bg-[#0D2B45]/94 backdrop-blur-md text-white rounded-3xl border border-[#7ee0cf]/60 p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
      {/* Top Banner */}
      <div className="flex items-center justify-between border-b border-[#1E5A6E] pb-2.5">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full animate-ping inline-block"
            style={{ backgroundColor: meta.accentColor }}
          />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
            {meta.stageNum}
          </span>
          <span className="text-slate-500">•</span>
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full border"
            style={{
              borderColor: `${meta.accentColor}50`,
              backgroundColor: `${meta.accentColor}20`,
              color: meta.accentColor,
            }}
          >
            Processing Telemetry
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#7ee0cf] bg-[#103859] px-2 py-0.5 rounded border border-[#1E5A6E]">
          {meta.tag}
        </span>
      </div>

      {/* Radar Scanner Visual */}
      <div className="flex items-center gap-4 py-1">
        <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-25"
            style={{ backgroundColor: meta.accentColor }}
          />
          <div
            className="absolute inset-1 rounded-full border border-dashed animate-spin opacity-40"
            style={{
              borderColor: meta.accentColor,
              animationDuration: "5s",
            }}
          />
          <div
            className="relative w-10 h-10 rounded-xl flex items-center justify-center shadow-lg text-white"
            style={{ backgroundColor: meta.accentColor }}
          >
            <Icon className="w-5 h-5 animate-pulse text-[#0D2B45]" />
          </div>
        </div>

        <div className="space-y-0.5 flex-1 min-w-0">
          <h3 className="text-sm font-extrabold text-white truncate">{meta.name}</h3>
          <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
            {meta.subtitle}
          </p>
        </div>
      </div>

      {/* Progress Bar & Percentage */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-slate-300 flex items-center gap-1.5 text-[11px]">
            <Cpu className="w-3 h-3 text-[#7ee0cf]" />
            Live Computing Stream
          </span>
          <span className="font-mono text-xs font-bold" style={{ color: meta.accentColor }}>
            {progress}%
          </span>
        </div>
        <div className="w-full h-2 bg-[#103859] rounded-full overflow-hidden p-0.5 border border-[#1E5A6E]">
          <div
            className="h-full rounded-full transition-all duration-75"
            style={{
              width: `${progress}%`,
              backgroundColor: meta.accentColor,
            }}
          />
        </div>
      </div>

      {/* Checklist of operations */}
      <div className="space-y-1.5 bg-[#103859]/80 p-2.5 rounded-xl border border-[#1E5A6E]">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#7ee0cf] uppercase tracking-wider mb-1">
          <Activity className="w-3 h-3 text-[#00bcd4]" />
          <span>Active Pipeline Operations</span>
        </div>
        <div className="space-y-1 text-xs">
          {meta.steps.map((st, i) => {
            const isDone = i < activeStepIndex;
            const isCurrent = i === activeStepIndex;
            return (
              <div
                key={i}
                className={`flex items-start gap-2 transition-opacity ${
                  isCurrent
                    ? "font-semibold text-white opacity-100"
                    : isDone
                    ? "text-slate-400 opacity-80"
                    : "text-slate-500 opacity-40"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                ) : isCurrent ? (
                  <Loader2
                    className="w-3 h-3 animate-spin mt-0.5 shrink-0"
                    style={{ color: meta.accentColor }}
                  />
                ) : (
                  <div className="w-3 h-3 rounded-full border border-slate-600 mt-0.5 shrink-0" />
                )}
                <span className="text-[10px] leading-tight">{st}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
