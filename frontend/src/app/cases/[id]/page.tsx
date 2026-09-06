import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MOCK_CASES } from "@/data/mockCases";
import CaseDossierView from "@/components/cases/CaseDossierView";
import FloatingNavbar from "@/components/common/FloatingNavbar";
import Footer from "@/components/common/Footer";
import { ArrowLeft } from "lucide-react";

interface CasePageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return MOCK_CASES.map((c) => ({
    id: c.id,
  }));
}

export default async function CasePage({ params }: CasePageProps) {
  const { id } = await params;
  const caseData = MOCK_CASES.find((c) => c.id === id);

  if (!caseData) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <FloatingNavbar />

      <div className="pt-28 pb-16 flex-1">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Breadcrumb navigation */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
            <Link href="/dashboard" className="hover:text-teal-700 flex items-center gap-1 font-medium">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Surveillance Dashboard</span>
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Case Dossier ({caseData.caseNumber})</span>
          </div>

          <CaseDossierView caseData={caseData} />
        </div>
      </div>

      <Footer />
    </main>
  );
}
