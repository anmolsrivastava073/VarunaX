"use client";

import React from "react";
import Link from "next/link";
import { MOCK_CASES } from "@/data/mockCases";
import { getSeverityBadgeClass, getStatusBadgeClass } from "@/lib/utils";
import { Globe, ArrowRight, Navigation, ChevronRight, Activity } from "lucide-react";

export default function WatchzonesSection() {
  return (
    <section id="pipeline" className="py-24 bg-[#f5f9fb]/50 border-t border-[#B7D4E6]/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="space-y-2">
            
            <h2 className="text-4xl sm:text-4xl font-extrabold text-[#0D2B45] tracking-tight">
              Active Global Incidents &amp; Attribution Files
            </h2>
            <p className="text-slate-600 text-sm max-w-xl">
              Real-time ingestion across key oil shipping arteries with automatic suspect ranking and forensic report
              generation.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-800 bg-white hover:bg-[#f5f9fb] border border-[#B7D4E6] transition-colors shrink-0"
          >
            <span>View All Cases in Dashboard</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Case Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_CASES.map((c) => {
            const isLive = c.status === "analyzing";
            const targetUrl = isLive ? `/live?caseId=${c.id}` : `/cases/${c.id}`;

            return (
              <div
                key={c.id}
                className="bg-white rounded-3xl p-5 border border-[#B7D4E6]/60 hover:border-[#1E5A6E] hover:shadow-lg hover:shadow-[#0D2B45]/5 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Case ID & Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold text-slate-500 bg-[#f5f9fb] px-2 py-0.5 rounded border border-[#B7D4E6]/40">
                      {c.caseNumber}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getSeverityBadgeClass(c.severity)}`}>
                        {c.severity.toUpperCase()}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(c.status)}`}>
                        {c.status === "analyzing" ? "ANALYZING" : "ATTRIBUTED"}
                      </span>
                    </div>
                  </div>

                  {/* Title & Region */}
                  <h3 className="font-bold text-[#0D2B45] text-base group-hover:text-[#1E5A6E] transition-colors mb-1">
                    {c.title}
                  </h3>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mb-4">
                    <Navigation className="w-3.5 h-3.5 text-[#6BA7A0] shrink-0" />
                    <span>{c.region}</span>
                  </div>

                  {/* Metrics Box */}
                  <div className="grid grid-cols-2 gap-2 bg-[#f5f9fb] p-3 rounded-2xl border border-[#B7D4E6]/50 mb-4 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Slick Area</span>
                      <span className="font-bold text-slate-800">{c.system1.areaKm2} km²</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Suspect Conf.</span>
                      <span className="font-bold text-[#1E5A6E]">
                        {c.system3.primarySuspect?.overallAttributionConfidence || 84.1}%
                      </span>
                    </div>
                  </div>

                  {/* Suspect summary */}
                  <div className="text-xs text-slate-600 mb-4">
                    <span className="font-semibold text-slate-800">Top Suspect: </span>
                    <span>{c.system3.primarySuspect?.name || "Processing SAR & AIS..."}</span>
                  </div>
                </div>

                {/* Footer Link */}
                <Link
                  href={targetUrl}
                  className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
                    isLive
                      ? "bg-[#1E5A6E] text-white hover:bg-[#0D2B45] shadow-sm shadow-[#1E5A6E]/20"
                      : "bg-white text-slate-800 border border-[#B7D4E6] hover:border-[#1E5A6E] hover:text-[#1E5A6E]"
                  }`}
                >
                  {isLive ? (
                    <>
                      <Activity className="w-3.5 h-3.5 animate-pulse text-white" />
                      <span>Watch Live Pipeline Reveal</span>
                    </>
                  ) : (
                    <>
                      <span>Inspect Forensic Case Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
