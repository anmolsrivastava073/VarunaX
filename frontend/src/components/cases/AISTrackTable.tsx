import React from "react";
import { AISWaypoint } from "@/types/maritime";
import { formatDateTime } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface AISTrackTableProps {
  waypoints: AISWaypoint[];
}

export default function AISTrackTable({ waypoints }: AISTrackTableProps) {
  if (!waypoints || waypoints.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-[#7ee0cf]">
        No fine-grained AIS waypoints available for this candidate.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-[#7ee0cf]/60 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Chronological Telemetry</div>
          <h3 className="font-bold text-slate-900 text-base">Historical AIS Waypoint Reconstruction</h3>
        </div>
        <span className="text-xs text-slate-500">{waypoints.length} Recorded Transmissions</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#edf5f3] text-slate-600 text-[10px] uppercase font-semibold border-b border-[#7ee0cf]/40">
            <tr>
              <th className="py-3 px-4">Timestamp (UTC)</th>
              <th className="py-3 px-4">Position (WGS84)</th>
              <th className="py-3 px-4">Speed (SOG)</th>
              <th className="py-3 px-4">Course (COG)</th>
              <th className="py-3 px-4">Dist to Origin</th>
              <th className="py-3 px-4">Anomaly Signal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {waypoints.map((w, idx) => (
              <tr
                key={idx}
                className={`hover:bg-[#e4f7f3]/40 transition-colors ${
                  w.isAnomaly ? "bg-rose-50/60 text-rose-950 font-medium" : "text-slate-700"
                }`}
              >
                <td className="py-3 px-4 whitespace-nowrap">{formatDateTime(w.timestamp)}</td>
                <td className="py-3 px-4 whitespace-nowrap">
                  {w.lat.toFixed(3)}°N, {w.lng.toFixed(3)}°E
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded ${w.isAnomaly ? "bg-rose-200 text-rose-900 font-bold" : "bg-[#edf5f3] text-slate-800"}`}>
                    {w.sogKnots} kt
                  </span>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">{w.cogDegrees}°</td>
                <td className="py-3 px-4 whitespace-nowrap">{w.distanceToOriginKm} km</td>
                <td className="py-3 px-4 text-xs">
                  {w.isAnomaly ? (
                    <span className="inline-flex items-center gap-1.5 text-rose-700 font-semibold bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">
                      <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                      {w.anomalyDescription}
                    </span>
                  ) : (
                    <span className="text-slate-400 font-normal">Normal Passage</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
