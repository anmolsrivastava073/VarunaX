"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Satellite,
  Compass,
  Anchor,
  ArrowRight,
  Activity,
} from "lucide-react";

export default function HeroSection() {
  // --- Typewriter Effect State & Logic ---
  const fullText =
    "Eliminating maritime pollution impunity. An automated pipeline that segments radar slicks, hindcasts ocean & wind drift vectors to reconstruct origin points, and unmasks culprit vessels through historical AIS traffic correlation.";
  
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let currentIndex = 0;
    const typingSpeed = 25; // Speed in milliseconds per character

    const typingInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, typingSpeed);

    return () => clearInterval(typingInterval);
  }, []);
  // ---------------------------------------

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-white">
      {/* 1. Background Video Layer */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/hero.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <div>
          {/* Video */}
          <video className="w-full object-contain" />

          {/* Below video */}
          <div className="w-full h-48 backdrop-blur-md bg-white" />
        </div>
      </div>

      {/* Decorative Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E5A6E12_1px,transparent_1px),linear-gradient(to_bottom,#1E5A6E12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Main Headline */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* --- GLOW WRAPPER --- */}
          <div className="relative">
            {/* The Blur/Glow element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] max-w-2xl h-32 bg-[#1E5A6E]/30 blur-[70px] rounded-full pointer-events-none z-0" />

            <h1 className="relative z-10 text-6xl sm:text-6xl md:text-7xl font-extrabold text-[#FFFEED] tracking-tight leading-[1.12]">
              Autonomous Satellite Oil Spill Detection &{" "}
              <span className="ocean-gradient-text">AIS Vessel Attribution</span>
            </h1>
          </div>
          {/* ------------------------------- */}

          {/* Typewriter Text Element */}
          <p className="text-base sm:text-lg md:text-xl text-[#E0FDFF] max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-sm min-h-[100px] md:min-h-[90px]">
            {displayedText}
            {/* Blinking Cursor */}
            <span className="animate-pulse inline-block w-[2px] h-[1em] bg-[#E0FDFF] ml-1 align-middle opacity-75" />
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-[#0D2B45] hover:bg-[#1E5A6E] shadow-lg shadow-[#0D2B45]/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <Activity className="w-4 h-4 text-[#B7D4E6] animate-pulse" />
              <span>Enter Operational Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="#interactive-demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-800 bg-white/90 backdrop-blur-sm hover:bg-white border border-[#B7D4E6] shadow-sm hover:text-[#0D2B45] transition-all"
            >
              <Compass className="w-4 h-4 text-[#1E5A6E]" />
              <span>Explore Interactive Demo</span>
            </Link>
          </div>
        </div>

        {/* Visual High-Tech Pipeline Teaser Box */}
        <div className="mt-20 md:mt-24 relative max-w-6xl mx-auto">
          <div className="rounded-[28px] p-2 bg-gradient-to-b from-[#B7D4E6]/80 via-white/90 to-[#f5f9fb]/90 shadow-2xl shadow-[#0D2B45]/10 backdrop-blur-sm">
            <div className="bg-white/95 backdrop-blur-md rounded-[24px] p-8 sm:p-10 md:p-12 border border-slate-100 overflow-hidden relative">
              {/* Radar Grid Graphic */}
              <div className="absolute right-0 top-0 w-[28rem] h-[28rem] -mr-20 -mt-20 opacity-20 pointer-events-none rounded-full border border-[#1E5A6E]">
                <div className="w-full h-full rounded-full border-4 border-dashed border-[#6BA7A0] animate-radar" />
              </div>

              {/* 3 Steps Pipeline Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                {/* Step 1 */}
                <div className="p-6 md:p-7 rounded-2xl bg-[#e9f2f7]/60 border border-[#B7D4E6] hover:border-[#1E5A6E] transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-[#0D2B45] text-white flex items-center justify-center mb-5 shadow-md shadow-[#0D2B45]/20 group-hover:scale-105 transition-transform">
                    <Satellite className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-[#1E5A6E] tracking-wider uppercase mb-1.5">System 1</div>
                  <h3 className="font-bold text-[#0D2B45] text-lg mb-2">SAR Spill Detection & Age</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Sentinel-1 C-SAR segmentation, damping ratio analysis, texture entropy, and initial morphometric
                    spill age prior estimation.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-6 md:p-7 rounded-2xl bg-[#e9f2f7]/60 border border-[#B7D4E6] hover:border-[#6BA7A0] transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-[#1E5A6E] text-white flex items-center justify-center mb-5 shadow-md shadow-[#1E5A6E]/20 group-hover:scale-105 transition-transform">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-[#1E5A6E] tracking-wider uppercase mb-1.5">System 2</div>
                  <h3 className="font-bold text-[#0D2B45] text-lg mb-2">Backward Drift Hindcasting</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Lagrangian particle backtracking incorporating ocean current velocities (u, v) and historical
                    windage to generate origin uncertainty ellipses.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-6 md:p-7 rounded-2xl bg-[#e9f2f7]/60 border border-[#B7D4E6] hover:border-[#DCC8AA] transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-[#6BA7A0] text-[#0D2B45] flex items-center justify-center mb-5 shadow-md shadow-[#6BA7A0]/30 group-hover:scale-105 transition-transform">
                    <Anchor className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-xs font-bold text-[#1E5A6E] tracking-wider uppercase mb-1.5">System 3</div>
                  <h3 className="font-bold text-[#0D2B45] text-lg mb-2">AIS Attribution & Suspect Ranking</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Spatio-temporal intersection with historical AIS traffic, transponder dark gap detection, and
                    explainable multi-factor scoring.
                  </p>
                </div>
              </div>

              {/* Bottom Quick Stats Strip */}
              <div className="mt-10 pt-8 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center relative z-10">
                <div>
                  <div className="text-3xl font-bold text-[#0D2B45]">1.48M km²</div>
                  <div className="text-sm text-slate-500 font-medium mt-1">Maritime Area Monitored</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#0D2B45]">94.2%</div>
                  <div className="text-sm text-slate-500 font-medium mt-1">SAR Mineral Oil Precision</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#0D2B45]">&lt;45 sec</div>
                  <div className="text-sm text-slate-500 font-medium mt-1">Hindcast Latency</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#0D2B45]">100%</div>
                  <div className="text-sm text-slate-500 font-medium mt-1">Explainable Multi-Factor Scoring</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}