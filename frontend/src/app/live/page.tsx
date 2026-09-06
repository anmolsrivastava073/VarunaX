import React, { Suspense } from "react";
import Link from "next/link";
import { MOCK_CASES } from "@/data/mockCases";
import LivePipelineView from "@/components/live/LivePipelineView";
import FloatingNavbar from "@/components/common/FloatingNavbar";
import Footer from "@/components/common/Footer";
import { ArrowLeft } from "lucide-react";

interface LivePageProps {
  searchParams: Promise<{ caseId?: string }>;
}

async function LiveContent({ searchParams }: LivePageProps) {
  const params = await searchParams;
  const targetId = params.caseId || "case-northsea-live-2026";
  const caseRecord = MOCK_CASES.find((c) => c.id === targetId) || MOCK_CASES[2];

  return <LivePipelineView caseRecord={caseRecord} />;
}

export default function LivePage({ searchParams }: LivePageProps) {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <FloatingNavbar />

      <div className="pt-28 pb-16 flex-1">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
            <Link href="/dashboard" className="hover:text-teal-700 flex items-center gap-1 font-medium">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Surveillance Dashboard</span>
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Live Staged Pipeline Reveal</span>
          </div>

          <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Initializing Live Stream...</div>}>
            <LiveContent searchParams={searchParams} />
          </Suspense>
        </div>
      </div>

      <Footer />
    </main>
  );
}
