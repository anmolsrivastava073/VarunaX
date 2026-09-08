"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CaseRecord } from "@/types/maritime";
import MetricCard from "./MetricCard";
import FilterBar from "./FilterBar";
import CaseRow from "./CaseRow";
import dynamic from "next/dynamic";
import {
  Satellite,
  Anchor,
  Activity,
  MapPin,
  Clock,
  Filter,
  AlertOctagon,
} from "lucide-react";

interface DashboardClientProps {
  initialCases: CaseRecord[];
}

const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), { ssr: false });

export default function DashboardClient({ initialCases }: DashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [casesList] = useState<CaseRecord[]>(initialCases);

  // Extract filter params
  const q = searchParams.get("q")?.toLowerCase() || "";
  const status = searchParams.get("status") || "all";
  const severity = searchParams.get("severity") || "all";
  const region = searchParams.get("region") || "all";

  // Filter cases
  const filteredCases = casesList.filter((c) => {
    if (status !== "all" && c.status !== status) return false;
    if (severity !== "all" && c.severity !== severity) return false;
    if (region !== "all" && !c.region.toLowerCase().includes(region.toLowerCase())) return false;
    if (q) {
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchRegion = c.region.toLowerCase().includes(q);
      const matchCaseNumber = c.caseNumber.toLowerCase().includes(q);
      const matchSuspect = c.system3.primarySuspect?.name?.toLowerCase().includes(q);
      const matchIMO = c.system3.primarySuspect?.imo?.includes(q);
      if (!matchTitle && !matchRegion && !matchCaseNumber && !matchSuspect && !matchIMO) return false;
    }
    return true;
  });

  const totalSlickArea = casesList.reduce((acc, c) => acc + c.system1.areaKm2, 0).toFixed(1);
  const activeAnalyzingCount = casesList.filter((c) => c.status === "analyzing").length;
  const resolvedCount = casesList.filter((c) => c.status === "resolved").length;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Operational Marine Surveillance Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time Sentinel-1 SAR ingestion, backward drift tracking, and AIS vessel attribution matrix.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/live?caseId=case-northsea-live-2026")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#007ceb] hover:bg-[#005bb5] shadow-sm shadow-[#007ceb]/20 transition-all hover:scale-[1.02]"
          >
            <Activity className="w-4 h-4 text-[#e4f7f3] animate-pulse" />
            <span>Launch Live Pipeline Stream</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Active Incursions"
          value={activeAnalyzingCount}
          subtext="In live SAR & drift processing"
          change="+1 Ingested"
          changeType="negative"
          icon={Activity}
          iconColor="text-[#007ceb]"
          iconBg="bg-[#e4f7f3]"
        />

        <MetricCard
          label="Slicks Segmented"
          value={`${totalSlickArea} km²`}
          subtext="Across 5 active corridors"
          change="97.2% precision"
          changeType="positive"
          icon={Satellite}
          iconColor="text-[#00bcd4]"
          iconBg="bg-[#e4f7f3]"
        />

        <MetricCard
          label="Attributed Vessels"
          value={resolvedCount}
          subtext="Forensic dossiers produced"
          change="97.4% avg conf."
          changeType="positive"
          icon={Anchor}
          iconColor="text-[#81ac19]"
          iconBg="bg-[#e4f7f3]"
        />

        <MetricCard
          label="Mean Attribution Time"
          value="42.8s"
          subtext="Monte Carlo Lagrangian drift"
          change="Instant"
          changeType="positive"
          icon={Clock}
          iconColor="text-[#007ceb]"
          iconBg="bg-[#e4f7f3]"
        />
      </div>

      {/* Live Map Preview & Geographic Corridors */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <MapPin className="w-4 h-4 text-[#007ceb]" />
            <span>Geographic Incident Distribution (MapLibre GL Vector Engine)</span>
          </div>
          <span className="text-xs text-slate-500">
            Click any incident pin to focus or navigate
          </span>
        </div>

        <div className="bg-white p-2 rounded-3xl border border-[#7ee0cf]/60 shadow-sm">
          <LeafletMap
            cases={filteredCases}
            interactiveMode="overview"
            height="380px"
            onSelectCase={(id) => {
              const c = casesList.find((item) => item.id === id);
              if (c?.status === "analyzing") {
                router.push(`/live?caseId=${id}`);
              } else {
                router.push(`/cases/${id}`);
              }
            }}
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <Filter className="w-4 h-4 text-[#00bcd4]" />
            <span>Incident Records ({filteredCases.length})</span>
          </div>
          <span className="text-xs text-slate-400">Filtered in real-time with URL synchronization</span>
        </div>

        <FilterBar />

        {/* Case Rows List */}
        <div className="space-y-3">
          {filteredCases.length > 0 ? (
            filteredCases.map((c) => <CaseRow key={c.id} caseData={c} />)
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#7ee0cf]/60 text-slate-500 space-y-3">
              <AlertOctagon className="w-10 h-10 text-slate-400 mx-auto" />
              <div className="font-bold text-slate-800 text-base">No matching incidents found</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try adjusting your search keywords, status filter, or region selection.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
