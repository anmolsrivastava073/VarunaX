"use client";

import React from "react";
import { ShieldCheck, Fish, Droplets, Clock, Globe, ArrowUpRight } from "lucide-react";

export default function EcoImpactSection() {
  return (
    <section id="marine-impact" className="py-24 bg-slate-50 relative overflow-hidden">
      
      {/* --- DECORATIVE SIDE GRAPHICS --- */}
      {/* Left Graphic */}
      <img
        src="/7.gif"
        alt="Decorative element left"
        className="absolute left-20 top-7 w-32 md:w-56 lg:w-72 object-contain pointer-events-none hidden md:block opacity-90 z-0"
      />
      {/* Right Graphic */}
      <img
        src="/5.gif"
        alt="Decorative element right"
        className="absolute right-15 top-8 w-32 md:w-56 lg:w-72 object-contain pointer-events-none hidden md:block opacity-90 z-0"
      />
      {/* -------------------------------- */}

      {/* Background radial gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#B7D4E6]/25 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Main Container (z-10 ensures it stays above the side graphics) */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-5xl sm:text-5xl font-extrabold text-[#0D2B45] tracking-tight">
            Protecting Sensitive Coral Reefs &amp; Coastal Ecosystems
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            By shifting from slow manual investigations to instant backward-drift attribution, maritime authorities
            intercept polluters before oil slicks make devastating landfall on fragile habitats.
          </p>
        </div>

        {/* 4 Impact Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-[#e9f2f7] text-[#1E5A6E] flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-[#0D2B45] font-mono mb-1">85%</div>
            <div className="text-xs font-semibold text-[#1E5A6E] uppercase tracking-wider mb-2">
              Faster Authority Response
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Reduces attribution time from 3–4 weeks of manual log scraping down to under 45 seconds.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-[#e9f2f7] text-[#6BA7A0] flex items-center justify-center mb-4">
              <Fish className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-[#0D2B45] font-mono mb-1">420+</div>
            <div className="text-xs font-semibold text-[#6BA7A0] uppercase tracking-wider mb-2">
              Marine Reserves Monitored
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Automated proximity triggers alert coast guards when slicks drift towards sensitive marine sanctuaries.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-[#e9f2f7] text-[#6BA7A0] flex items-center justify-center mb-4">
              <Droplets className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-[#0D2B45] font-mono mb-1">16,400 bbl</div>
            <div className="text-xs font-semibold text-[#6BA7A0] uppercase tracking-wider mb-2">
              Spillage Attributed
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Providing legally admissible forensic dossiers for international environmental damage recovery.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-[#f8f2e8] text-[#0D2B45] flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-[#0D2B45] font-mono mb-1">100%</div>
            <div className="text-xs font-semibold text-[#6BA7A0] uppercase tracking-wider mb-2">
              Open &amp; Defensible
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Built on peer-validated hydrodynamic Lagrangian formulations (OpenDrift physics model integration).
            </p>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-12 bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2.5">
            <div className="text-[#1E5A6E] font-bold text-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1E5A6E]" />
              Satellite C-SAR Precision
            </div>
            <h4 className="font-bold text-slate-900 text-base">Sentinel-1 Dual Polarisation</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Day-and-night, cloud-penetrating radar scans identify oil slicks through sea surface capillary wave damping
              signatures with 10m spatial fidelity.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="text-[#6BA7A0] font-bold text-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#6BA7A0]" />
              Dynamic Windage &amp; Currents
            </div>
            <h4 className="font-bold text-slate-900 text-base">Real-Time Hindcast Vector Fields</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Consumes historical sea surface velocities (u, v) and atmospheric 10m wind fields, running Monte Carlo
              particle dispersion simulations.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="text-[#1E5A6E] font-bold text-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1E5A6E]" />
              AIS Dark Period Detection
            </div>
            <h4 className="font-bold text-slate-900 text-base">Anomalous Behavior Penalization</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Flags intentional transponder cuts, speed decelerations during midnight transit, and erratic heading
              alterations within the calculated origin cone.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}