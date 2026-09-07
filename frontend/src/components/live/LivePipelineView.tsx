"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { CaseRecord, PipelineStage } from "@/types/maritime";
import MapLibreMap from "@/components/map/MapLibreMap";
import DemoSlickForm from "@/components/common/DemoSlickForm";
import SpillCard from "@/components/live/SpillCard";
import OriginCard from "@/components/live/OriginCard";
import VesselRankingCard from "@/components/live/VesselRankingCard";
import SystemProcessingLoader from "@/components/live/SystemProcessingLoader";
import CaseSummaryDashboard from "@/components/live/CaseSummaryDashboard";
import {
  Satellite,
  Compass,
  Anchor,
  Shield,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Terminal,
  Maximize2,
  LayoutGrid,
} from "lucide-react";

/* ─────────────────────────────────────────────
   CONFETTI UTILITY
───────────────────────────────────────────── */
function launchConfetti() {
  if (typeof document === "undefined") return;
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas.remove();

  const colors = ["#007ceb", "#00bcd4", "#7ee0cf", "#a3d328", "#ff6b6b"];
  const particles = Array.from({ length: 90 }, () => ({
    x: Math.random() * canvas.width,
    y: canvas.height * 0.55,
    vx: (Math.random() - 0.5) * 14,
    vy: -Math.random() * 14 - 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    life: 1,
  }));

  const animate = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.28;
      p.life -= 0.014;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 7, 7);
    });
    if (particles.some((p) => p.life > 0)) requestAnimationFrame(animate);
    else canvas.remove();
  };
  animate();
}

/* ─────────────────────────────────────────────
   STAGE DEFINITIONS
───────────────────────────────────────────── */
const STAGES: PipelineStage[] = [
  "system1_detection",
  "system2_drift",
  "system3_attribution",
  "completed",
];

const STAGE_CONFIG = [
  {
    stage: "system1_detection" as PipelineStage,
    stepNum: 1,
    title: "SAR Slick Detection",
    subtitle: "Sentinel-1 C-SAR & Dual-Pol Segmentation",
    icon: Satellite,
    color: "#007ceb",
    badgeBg: "bg-[#e4f7f3] text-[#005bb5] border-[#7ee0cf]",
  },
  {
    stage: "system2_drift" as PipelineStage,
    stepNum: 2,
    title: "Lagrangian Drift Hindcast",
    subtitle: "CMEMS GLORYS12 + ERA5 CDS Backtracking",
    icon: Compass,
    color: "#00bcd4",
    badgeBg: "bg-[#e0f7fa] text-[#00838f] border-[#80deea]",
  },
  {
    stage: "system3_attribution" as PipelineStage,
    stepNum: 3,
    title: "AIS Dark Target Attribution",
    subtitle: "Multi-Factor Vessel Forensic Dossier",
    icon: Anchor,
    color: "#81ac19",
    badgeBg: "bg-[#f1f8e9] text-[#558b2f] border-[#c5e1a5]",
  },
  {
    stage: "completed" as PipelineStage,
    stepNum: 4,
    title: "Case Summary Dashboard",
    subtitle: "Compilation Evidence Chain for IMO / Coast Guard",
    icon: Shield,
    color: "#0D2B45",
    badgeBg: "bg-[#edf5f3] text-[#0D2B45] border-[#B7D4E6]",
  },
];

/* ─────────────────────────────────────────────
   COMPONENT PROPS
───────────────────────────────────────────── */
interface LivePipelineViewProps {
  caseRecord: CaseRecord;
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function LivePipelineView({ caseRecord: initialCase }: LivePipelineViewProps) {
  const [activeCase, setActiveCase] = useState<CaseRecord>(initialCase);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [isStageLoading, setIsStageLoading] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [viewMode, setViewMode] = useState<"stepByStep" | "allInOne">("stepByStep");
  const [showDemoForm, setShowDemoForm] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const currentStage = STAGES[currentStageIndex];

  /* ── Telemetry Logging per stage ── */
  useEffect(() => {
    const ts = new Date().toISOString().substring(11, 19);
    let msg = "";

    if (currentStage === "system1_detection") {
      msg = `[SAR-INGEST] Sentinel-1 scene ${activeCase.system1.sceneId.substring(0, 22)}... Area: ${activeCase.system1.areaKm2} km² · Elongation: ${activeCase.system1.elongation}:1 · Oil Confidence: ${activeCase.system1.oilLookalikeConfidence}% · Estimated Age: ${activeCase.system1.estimatedSpillAgeHours.min}–${activeCase.system1.estimatedSpillAgeHours.max} hrs.`;
    } else if (currentStage === "system2_drift") {
      msg = `[DRIFT-HINDCAST] CMEMS GLORYS12 + ERA5 CDS Backtracking. Ocean Current: ${activeCase.system2.oceanCurrent.speedKnots} kt @ ${activeCase.system2.oceanCurrent.headingDegrees}° · Wind: ${activeCase.system2.wind.speedKnots} kt @ ${activeCase.system2.wind.directionDegrees}°. Reconstructed origin: ${activeCase.system2.originCoordinates.lat.toFixed(3)}°N, ${activeCase.system2.originCoordinates.lng.toFixed(3)}°E (±${activeCase.system2.spatialUncertaintyKm} km).`;
    } else if (currentStage === "system3_attribution") {
      const sus = activeCase.system3.primarySuspect;
      msg = `[AIS-ATTRIBUTION] Evaluated ${activeCase.system3.candidateVesselsEvaluated} vessels in ${activeCase.system3.spatialSearchRadiusKm} km radius. Primary suspect: ${sus?.name} (${sus?.vesselType}) · Attribution Confidence: ${sus?.overallAttributionConfidence}% · Dark gap: ${sus?.darkPeriodDurationHours ?? 0} hrs.`;
    } else if (currentStage === "completed") {
      msg = `[PIPELINE-COMPLETE] Multi-system evidence chain resolved. Marine forensic dossier compiled. Ready for Coast Guard enforcement.`;
      launchConfetti();
    }

    setLogs((prev) => [...prev, `${ts} ${msg}`]);
  }, [currentStageIndex, activeCase, currentStage]);

  /* ── Auto-scroll logs ── */
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  /* ── Timer for playback: wait for system loading effect before advancing ── */
  useEffect(() => {
    if (!isPlaying) return;
    if (isStageLoading) return; // Wait for loading effect to finish

    if (currentStageIndex >= STAGES.length - 1) {
      setIsPlaying(false);
      return;
    }

    const duration = 3800 / playbackSpeed;
    const timer = setTimeout(() => {
      setIsStageLoading(true);
      setCurrentStageIndex((prev) => Math.min(prev + 1, STAGES.length - 1));
    }, duration);

    return () => clearTimeout(timer);
  }, [isPlaying, isStageLoading, currentStageIndex, playbackSpeed]);

  function handleRestart() {
    setIsStageLoading(true);
    setCurrentStageIndex(0);
    setViewMode("stepByStep");
    setIsPlaying(true);
    setLogs([`${new Date().toISOString().substring(11, 19)} [INIT] Restarting live staged pipeline execution...`]);
  }

  function handleStepForward() {
    setIsPlaying(false);
    setIsStageLoading(true);
    setCurrentStageIndex((p) => Math.min(p + 1, STAGES.length - 1));
  }

  function handleStepBack() {
    setIsPlaying(false);
    setIsStageLoading(true);
    setCurrentStageIndex((p) => Math.max(p - 1, 0));
  }

  function handleSelectStage(idx: number) {
    setIsPlaying(false);
    setIsStageLoading(true);
    setCurrentStageIndex(idx);
    setViewMode("stepByStep");
  }

  return (
    <div className="space-y-6">
      {/* ── TOP HEADER & CONTROLS BANNER ── */}
      <div className="bg-white p-6 rounded-3xl border border-[#7ee0cf]/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00bcd4] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#007ceb]" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#005bb5]">
              Live Staged AI Pipeline Stream
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-semibold">{activeCase.caseNumber}</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs bg-[#e4f7f3] text-[#005bb5] px-2 py-0.5 rounded-full border border-[#7ee0cf] font-medium">
              Stage {currentStageIndex + 1} of 4: {STAGE_CONFIG[currentStageIndex].title}
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{activeCase.title}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Region: {activeCase.region} • Coordinates: {activeCase.coordinates.lat.toFixed(3)}°N, {activeCase.coordinates.lng.toFixed(3)}°E
            • CMEMS GLORYS12 + ERA5/CDS + ESA Sentinel-1
          </p>
        </div>

        {/* Toolbar: Playback, View Mode, Demo Form Button */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Mode toggle button */}
          <button
            onClick={() => setViewMode(viewMode === "stepByStep" ? "allInOne" : "stepByStep")}
            className="px-3 py-2 rounded-xl bg-white hover:bg-[#e4f7f3] text-slate-700 border border-[#7ee0cf] font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
          >
            {viewMode === "stepByStep" ? (
              <>
                <LayoutGrid className="w-3.5 h-3.5 text-[#007ceb]" />
                <span>Show All Sections</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-[#007ceb]" />
                <span>Single-System Focus</span>
              </>
            )}
          </button>

          {/* Demo Slick Form Trigger */}
          <button
            onClick={() => setShowDemoForm((v) => !v)}
            className="px-3 py-2 rounded-xl bg-[#00bcd4] hover:bg-[#0097a7] text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Select/Demo Slick</span>
          </button>

          {/* Playback Controls */}
          <div className="flex items-center gap-1 bg-[#edf5f3] p-1.5 rounded-2xl border border-[#7ee0cf]/50">
            <button
              onClick={handleStepBack}
              disabled={currentStageIndex === 0}
              className="p-1.5 rounded-xl bg-white hover:bg-[#e4f7f3] disabled:opacity-30 text-slate-700 transition-colors"
              title="Step Back"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1.5 rounded-xl bg-[#007ceb] hover:bg-[#005bb5] text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? "Pause" : "Play"}</span>
            </button>

            <button
              onClick={handleStepForward}
              disabled={currentStageIndex >= STAGES.length - 1}
              className="p-1.5 rounded-xl bg-white hover:bg-[#e4f7f3] disabled:opacity-30 text-slate-700 transition-colors"
              title="Step Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleRestart}
              className="p-1.5 rounded-xl bg-white hover:bg-[#e4f7f3] text-slate-700 transition-colors"
              title="Restart Simulation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Speed toggle */}
            <div className="flex items-center gap-0.5 bg-white px-1.5 py-1 rounded-xl border border-[#7ee0cf]/40 text-xs font-semibold text-slate-600">
              {[1, 2, 4].map((s) => (
                <button
                  key={s}
                  onClick={() => setPlaybackSpeed(s)}
                  className={`px-1.5 py-0.5 rounded text-[11px] ${playbackSpeed === s ? "bg-[#e4f7f3] text-[#007ceb]" : "hover:text-slate-900"}`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── DEMO SLICK FORM MODAL/DRAWER ── */}
      {showDemoForm && (
        <div className="relative z-20">
          <DemoSlickForm
            onCaseSelect={(c) => {
              setActiveCase(c);
              setShowDemoForm(false);
              handleRestart();
            }}
            onRunLive={() => {
              setShowDemoForm(false);
              handleRestart();
            }}
          />
        </div>
      )}

      {/* ── STAGE PROGRESS STEPPER (4 Steps) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STAGE_CONFIG.map((cfg, idx) => {
          const Icon = cfg.icon;
          const isActive = currentStageIndex === idx;
          const isPassed = currentStageIndex > idx;
          return (
            <button
              key={cfg.stage}
              onClick={() => handleSelectStage(idx)}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                isActive
                  ? "bg-[#e4f7f3] border-[#007ceb] shadow-md ring-2 ring-[#007ceb]/30"
                  : isPassed
                  ? "bg-white border-[#00bcd4]/60 shadow-sm"
                  : "bg-white/60 border-[#7ee0cf]/30 opacity-60 hover:opacity-90"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Step {cfg.stepNum}
                </span>
                {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-[#00bcd4]" />}
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-[#007ceb] animate-ping" />
                )}
              </div>
              <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: cfg.color }} />
                <span className="truncate">{cfg.title}</span>
              </div>
              <div className="text-[10px] text-slate-500 truncate mt-0.5">{cfg.subtitle}</div>
            </button>
          );
        })}
      </div>

      {/* ── MAIN CONTENT GRID: MAP + INSPECTOR ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: MapLibre GL Map & Telemetry Console */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-2 rounded-3xl border border-[#7ee0cf]/60 shadow-sm">
            <MapLibreMap
              caseData={activeCase}
              stage={currentStage}
              interactiveMode="liveSimulation"
              height="500px"
              loadingStage={isStageLoading ? currentStage : null}
              loadingDurationMs={1300 / playbackSpeed}
              onProcessingComplete={() => setIsStageLoading(false)}
            />
          </div>

          {/* Telemetry Event Stream Log */}
          <div className="bg-slate-900 text-slate-200 p-4 rounded-3xl border border-[#7ee0cf]/40 shadow-inner text-xs">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-800 text-slate-400">
              <span className="flex items-center gap-1.5 text-[11px] uppercase font-bold text-[#7ee0cf]">
                <Terminal className="w-3.5 h-3.5 text-[#00bcd4]" />
                Live AI Pipeline Event Stream (CMEMS GLORYS12 + ERA5/CDS + ESA S-1)
              </span>
              <span className="text-[10px] text-slate-500">Real-time Hindcast Log</span>
            </div>

            <div
              ref={logContainerRef}
              className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-[11px] leading-relaxed font-mono"
            >
              {logs.map((l, i) => (
                <div key={i} className="text-[#7ee0cf]">
                  <span className="text-slate-500">{l.substring(0, 8)}</span> {l.substring(9)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Focused System Inspector with Loading Effect OR All-in-One */}
        <div className="lg:col-span-5 space-y-4">
          {/* ════════════════════════════════════════════════════════════════
             MODE A: STEP-BY-STEP SINGLE-SYSTEM EMPHASIS WITH LOADING EFFECT
          ════════════════════════════════════════════════════════════════ */}
          {viewMode === "stepByStep" && (
            <div className="space-y-4">
              {/* Window Header Indicator */}
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#005bb5] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#007ceb] animate-pulse" />
                  {currentStageIndex < 3
                    ? `System ${currentStageIndex + 1} Dedicated Inspector`
                    : "Final Compilation Summary"}
                </span>
                <span className="text-[11px] text-slate-500">
                  {currentStageIndex < 3 ? `Step ${currentStageIndex + 1} of 4` : "Evidence Chain Resolved"}
                </span>
              </div>

              {/* ── SYSTEM 1 RESOLVED OUTPUT ── */}
              {currentStageIndex === 0 && (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  {/* PALSAR Image Animation Card */}
                  <div className="bg-white rounded-3xl border border-[#7ee0cf]/60 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase text-[#005bb5]">
                        PALSAR SAR Ground Truth Texture
                      </span>
                      <span className="text-[10px] bg-[#e4f7f3] text-[#005bb5] px-2 py-0.5 rounded font-mono">
                        ESA Sentinel-1 C-SAR
                      </span>
                    </div>
                    <div className="relative h-44 rounded-2xl overflow-hidden border border-[#7ee0cf]/40 bg-slate-900">
                      <Image
                        src="/sar/palsar-grayscale.jpg"
                        alt="PALSAR SAR Raw Speckle Texture"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                        <div className="text-[10px] text-slate-200">
                          <span className="font-bold text-[#7ee0cf]">VV/VH Polarization:</span> Damping Ratio{" "}
                          {(activeCase.system1.slickPolygon.properties as { reflectanceDampingRatioDb?: number })?.reflectanceDampingRatioDb ?? -6.5} dB
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">
                      Speckle pattern processed from dual-pol SAR. Look-alikes (biogenic calm zones) excluded with{" "}
                      {activeCase.system1.oilLookalikeConfidence}% confidence.
                    </p>
                  </div>

                  {/* Spill Card */}
                  <SpillCard data={activeCase.system1} mode="live" isCurrentStage={true} />

                  <button
                    onClick={handleStepForward}
                    className="w-full py-3 rounded-2xl bg-[#007ceb] hover:bg-[#005bb5] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <span>Advance to Stage 2: Drift Hindcasting</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* ── SYSTEM 2 RESOLVED OUTPUT ── */}
              {currentStageIndex === 1 && (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  {/* PALSAR Red Overlay Visual */}
                  <div className="bg-white rounded-3xl border border-[#7ee0cf]/60 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase text-[#0097a7]">
                        PALSAR Slick Segmentation Mask
                      </span>
                      <span className="text-[10px] bg-[#e0f7fa] text-[#00838f] px-2 py-0.5 rounded font-mono">
                        Red Overlay Ground Truth
                      </span>
                    </div>
                    <div className="relative h-44 rounded-2xl overflow-hidden border border-[#7ee0cf]/40 bg-slate-900">
                      <Image
                        src="/sar/palsar-redoverlay.jpg"
                        alt="PALSAR Red Overlay Segmented Slick"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                        <div className="text-[10px] text-[#7ee0cf]">
                          <span className="font-bold">Reconstructed Origin:</span>{" "}
                          {activeCase.system2.originCoordinates.lat.toFixed(3)}°N,{" "}
                          {activeCase.system2.originCoordinates.lng.toFixed(3)}°E
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">
                      Backward Lagrangian simulation driven by CMEMS GLORYS12 ocean currents and ERA5/CDS wind fields.
                    </p>
                  </div>

                  {/* Origin Card */}
                  <OriginCard data={activeCase.system2} mode="live" isCurrentStage={true} />

                  <button
                    onClick={handleStepForward}
                    className="w-full py-3 rounded-2xl bg-[#00bcd4] hover:bg-[#0097a7] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <span>Advance to Stage 3: AIS Attribution</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* ── SYSTEM 3 RESOLVED OUTPUT ── */}
              {currentStageIndex === 2 && (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <VesselRankingCard
                    data={activeCase.system3}
                    caseId={activeCase.id}
                    mode="live"
                    isCurrentStage={true}
                  />

                  <button
                    onClick={handleStepForward}
                    className="w-full py-3 rounded-2xl bg-[#81ac19] hover:bg-[#688a14] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <span>Compile Final Case Summary Dashboard</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* ── COMPILATION / FINAL SUMMARY CASE DASHBOARD ── */}
              {currentStageIndex === 3 && (
                <CaseSummaryDashboard
                  caseRecord={activeCase}
                  onRestart={handleRestart}
                  onInspectStage={(idx) => handleSelectStage(idx)}
                />
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
             MODE B: ALL-IN-ONE COMPREHENSIVE OVERVIEW
          ════════════════════════════════════════════════════════════════ */}
          {viewMode === "allInOne" && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <LayoutGrid className="w-3.5 h-3.5 text-[#007ceb]" />
                  Full Pipeline Evidence Dossier (All 3 Systems)
                </span>
                <button
                  onClick={() => setViewMode("stepByStep")}
                  className="text-[11px] text-[#007ceb] hover:underline font-semibold"
                >
                  Switch to Single-System Focus
                </button>
              </div>

              {/* System 1: SAR Card */}
              <SpillCard
                data={activeCase.system1}
                mode="live"
                isCurrentStage={currentStageIndex === 0}
              />

              {/* System 2: Origin Card */}
              <OriginCard
                data={activeCase.system2}
                mode="live"
                isCurrentStage={currentStageIndex === 1}
              />

              {/* System 3: Vessel Ranking Card */}
              <VesselRankingCard
                data={activeCase.system3}
                caseId={activeCase.id}
                mode="live"
                isCurrentStage={currentStageIndex >= 2}
              />

              {/* Final Summary Card at Bottom */}
              <CaseSummaryDashboard
                caseRecord={activeCase}
                onRestart={handleRestart}
                onInspectStage={(idx) => handleSelectStage(idx)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
