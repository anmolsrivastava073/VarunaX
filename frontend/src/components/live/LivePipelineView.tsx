"use client";

import React, { useState, useEffect, useRef } from "react";
import { CaseRecord, PipelineStage } from "@/types/maritime";
import MapLibreMap from "@/components/map/MapLibreMap";
import SpillCard from "./SpillCard";
import OriginCard from "./OriginCard";
import VesselRankingCard from "./VesselRankingCard";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  Terminal,
  Satellite,
  Compass,
  Anchor,
} from "lucide-react";

function launchConfetti() {
  if (typeof document === "undefined") return;

  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999";
  document.body.appendChild(canvas);
  const context = canvas.getContext("2d");
  if (!context) return canvas.remove();

  const colors = ["#007ceb", "#00bcd4", "#7ee0cf", "#a3d328"];
  const particles = Array.from({ length: 80 }, () => ({
    x: Math.random() * canvas.width,
    y: canvas.height * 0.6,
    vx: (Math.random() - 0.5) * 12,
    vy: -Math.random() * 12 - 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    life: 1,
  }));

  const animate = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    context.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.25;
      particle.life -= 0.015;
      context.globalAlpha = Math.max(0, particle.life);
      context.fillStyle = particle.color;
      context.fillRect(particle.x, particle.y, 6, 6);
    });
    if (particles.some((particle) => particle.life > 0)) requestAnimationFrame(animate);
    else canvas.remove();
  };

  animate();
}

interface LivePipelineViewProps {
  caseRecord: CaseRecord;
}

const STAGES: PipelineStage[] = [
  "system1_detection",
  "system2_drift",
  "system3_attribution",
  "completed",
];

export default function LivePipelineView({ caseRecord }: LivePipelineViewProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [logs, setLogs] = useState<string[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const currentStage = STAGES[currentStageIndex];

  // Handle stage logs and auto-advance
  useEffect(() => {
    let logMsg = "";
    if (currentStage === "system1_detection") {
      logMsg = `[SAR-INGEST] Sentinel-1 SAR scene ${caseRecord.system1.sceneId.substring(0, 20)}... loaded. Segmented slick area: ${caseRecord.system1.areaKm2} km². Estimated age prior: ${caseRecord.system1.estimatedSpillAgeHours.min}-${caseRecord.system1.estimatedSpillAgeHours.max} hrs.`;
    } else if (currentStage === "system2_drift") {
      logMsg = `[DRIFT-HINDCAST] Ingesting ocean currents (u=${caseRecord.system2.oceanCurrent.uVelocity}m/s, v=${caseRecord.system2.oceanCurrent.vVelocity}m/s) + windage. Backtracked ${caseRecord.system2.particleCount} particles. Origin ellipse generated at ${caseRecord.system2.originCoordinates.lat.toFixed(3)}°N, ${caseRecord.system2.originCoordinates.lng.toFixed(3)}°E (±${caseRecord.system2.spatialUncertaintyKm} km).`;
    } else if (currentStage === "system3_attribution") {
      logMsg = `[AIS-CORRELATION] Spatial search radius: ${caseRecord.system3.spatialSearchRadiusKm}km. Evaluated ${caseRecord.system3.candidateVesselsEvaluated} candidate vessels. Primary suspect identified: ${caseRecord.system3.primarySuspect.name} (Attribution Conf: ${caseRecord.system3.primarySuspect.overallAttributionConfidence}%).`;
    } else if (currentStage === "completed") {
      logMsg = `[PIPELINE-COMPLETE] Evidence chain resolved. Marine forensic dossier compiled. Ready for Coast Guard & IMO enforcement.`;
      launchConfetti();
    }

    setLogs((prev) => [...prev, `${new Date().toISOString().substring(11, 19)} ${logMsg}`]);
  }, [currentStageIndex, caseRecord]);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Timer for automatic playback
  useEffect(() => {
    if (!isPlaying) return;
    if (currentStageIndex >= STAGES.length - 1) {
      setIsPlaying(false);
      return;
    }

    const intervalDuration = (4000 / playbackSpeed);
    const timer = setTimeout(() => {
      setCurrentStageIndex((prev) => Math.min(prev + 1, STAGES.length - 1));
    }, intervalDuration);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStageIndex, playbackSpeed]);

  const handleRestart = () => {
    setCurrentStageIndex(0);
    setIsPlaying(true);
    setLogs([`${new Date().toISOString().substring(11, 19)} [INIT] Restarting live staged pipeline execution...`]);
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    setCurrentStageIndex((prev) => Math.min(prev + 1, STAGES.length - 1));
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Live Telemetry Banner */}
      <div className="bg-white p-6 rounded-3xl border border-[#7ee0cf]/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00bcd4] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#007ceb]" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#005bb5]">
              Live Staged AI Pipeline Stream
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-semibold">{caseRecord.caseNumber}</span>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{caseRecord.title}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Region: {caseRecord.region} • Coordinates: {caseRecord.coordinates.lat}°N, {caseRecord.coordinates.lng}°E
          </p>
        </div>

        {/* Playback Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-2 bg-[#edf5f3] p-2 rounded-2xl border border-[#7ee0cf]/50 shrink-0">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3.5 py-2 rounded-xl bg-[#007ceb] hover:bg-[#005bb5] text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? "Pause" : "Play Pipeline"}</span>
          </button>

          <button
            onClick={handleStepForward}
            disabled={currentStageIndex >= STAGES.length - 1}
            className="p-2 rounded-xl bg-white hover:bg-[#e4f7f3] disabled:opacity-40 text-slate-700 border border-[#7ee0cf]/50 transition-colors"
            title="Step Next Stage"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={handleRestart}
            className="p-2 rounded-xl bg-white hover:bg-[#e4f7f3] text-slate-700 border border-[#7ee0cf]/50 transition-colors"
            title="Restart Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed Pill */}
          <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-[#7ee0cf]/50 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setPlaybackSpeed(1)}
              className={`px-1.5 py-0.5 rounded ${playbackSpeed === 1 ? "bg-[#e4f7f3] text-[#007ceb]" : "hover:text-slate-900"}`}
            >
              1x
            </button>
            <button
              onClick={() => setPlaybackSpeed(2)}
              className={`px-1.5 py-0.5 rounded ${playbackSpeed === 2 ? "bg-[#e4f7f3] text-[#007ceb]" : "hover:text-slate-900"}`}
            >
              2x
            </button>
            <button
              onClick={() => setPlaybackSpeed(4)}
              className={`px-1.5 py-0.5 rounded ${playbackSpeed === 4 ? "bg-[#e4f7f3] text-[#007ceb]" : "hover:text-slate-900"}`}
            >
              4x
            </button>
          </div>
        </div>
      </div>

      {/* Stage Progress Bar Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Stage 1 Pill */}
        <button
          onClick={() => {
            setIsPlaying(false);
            setCurrentStageIndex(0);
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            currentStageIndex >= 0
              ? "bg-[#e4f7f3] border-[#007ceb] shadow-sm"
              : "bg-white border-[#7ee0cf]/40 opacity-60"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#005bb5]">Stage 1</span>
            {currentStageIndex >= 0 && <CheckCircle2 className="w-3.5 h-3.5 text-[#007ceb]" />}
          </div>
          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
            <Satellite className="w-3.5 h-3.5 text-[#007ceb]" />
            <span>SAR Detection & Age</span>
          </div>
        </button>

        {/* Stage 2 Pill */}
        <button
          onClick={() => {
            setIsPlaying(false);
            setCurrentStageIndex(1);
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            currentStageIndex >= 1
              ? "bg-[#e4f7f3] border-[#00bcd4] shadow-sm"
              : "bg-white border-[#7ee0cf]/40 opacity-60"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0097a7]">Stage 2</span>
            {currentStageIndex >= 1 && <CheckCircle2 className="w-3.5 h-3.5 text-[#00bcd4]" />}
          </div>
          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#00bcd4]" />
            <span>Lagrangian Drift Hindcast</span>
          </div>
        </button>

        {/* Stage 3 Pill */}
        <button
          onClick={() => {
            setIsPlaying(false);
            setCurrentStageIndex(2);
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            currentStageIndex >= 2
              ? "bg-[#e4f7f3] border-[#81ac19] shadow-sm"
              : "bg-white border-[#7ee0cf]/40 opacity-60"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#81ac19]">Stage 3</span>
            {currentStageIndex >= 2 && <CheckCircle2 className="w-3.5 h-3.5 text-[#81ac19]" />}
          </div>
          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
            <Anchor className="w-3.5 h-3.5 text-[#81ac19]" />
            <span>AIS Vessel Attribution</span>
          </div>
        </button>
      </div>

      {/* Main Content Grid: Map + Evidence Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive MapLibre GL Map & Telemetry Terminal */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-2 rounded-3xl border border-[#7ee0cf]/60 shadow-sm">
            <MapLibreMap
              caseData={caseRecord}
              stage={currentStage}
              interactiveMode="liveSimulation"
              height="480px"
            />
          </div>

          {/* Live System Telemetry Stream Log */}
          <div className="bg-slate-900 text-slate-200 p-4 rounded-3xl border border-[#7ee0cf]/40 shadow-inner text-xs">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-800 text-slate-400">
              <span className="flex items-center gap-1.5 text-[11px] uppercase font-bold text-[#7ee0cf]">
                <Terminal className="w-3.5 h-3.5 text-[#00bcd4]" />
                Real-Time AI Pipeline Event Stream
              </span>
              <span className="text-[10px] text-slate-500">SSE / Streaming Log</span>
            </div>

            <div ref={logContainerRef} className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-[11px] leading-relaxed">
              {logs.map((l, i) => (
                <div key={i} className="text-[#7ee0cf]">
                  <span className="text-slate-500">{l.substring(0, 8)}</span> {l.substring(9)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Progressive Reveal Evidence Cards */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card 1: System 1 (Always revealed once Stage >= 0) */}
          <SpillCard
            data={caseRecord.system1}
            mode="live"
            isCurrentStage={currentStage === "system1_detection"}
          />

          {/* Card 2: System 2 (Revealed once Stage >= 1) */}
          {currentStageIndex >= 1 ? (
            <OriginCard
              data={caseRecord.system2}
              mode="live"
              isCurrentStage={currentStage === "system2_drift"}
            />
          ) : (
            <div className="p-6 bg-white rounded-3xl border border-dashed border-[#7ee0cf] text-center text-slate-400 text-xs">
              <Compass className="w-6 h-6 mx-auto mb-2 text-[#00bcd4] animate-spin" />
              <span>System 2: Waiting for Stage 1 SAR completion...</span>
            </div>
          )}

          {/* Card 3: System 3 (Revealed once Stage >= 2) */}
          {currentStageIndex >= 2 ? (
            <VesselRankingCard
              data={caseRecord.system3}
              caseId={caseRecord.id}
              mode="live"
              isCurrentStage={currentStage === "system3_attribution" || currentStage === "completed"}
            />
          ) : (
            <div className="p-6 bg-white rounded-3xl border border-dashed border-[#7ee0cf] text-center text-slate-400 text-xs">
              <Anchor className="w-6 h-6 mx-auto mb-2 text-[#81ac19] animate-pulse" />
              <span>System 3: Waiting for Origin Ellipse calculation...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
