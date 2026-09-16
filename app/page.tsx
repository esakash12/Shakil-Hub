import React from "react";
import AgencyHero from "@/components/agency/AgencyHero";
import AgencyPortfolio from "@/components/agency/AgencyPortfolio";
import AgencyServices from "@/components/agency/AgencyServices";
import AgencyFounder from "@/components/agency/AgencyFounder";
import AgencyAcademyPreview from "@/components/agency/AgencyAcademyPreview";
import AgencyConsultation from "@/components/agency/AgencyConsultation";
import PreFooterStatsBar from "@/components/layout/PreFooterStatsBar";
import { getLivePlatformStatsAction } from "@/lib/actions/stats";

export default async function HomePage() {
  const liveStats = await getLivePlatformStatsAction().catch(() => undefined);

  return (
    <div className="relative animate-in fade-in duration-500 bg-black text-white">
      {/* 1. Agency Hero Section */}
      <AgencyHero />

      {/* 2. Featured Portfolio Showcase — The Main Focus */}
      <AgencyPortfolio />

      {/* 3. Specialized Creative Agency Services */}
      <AgencyServices />

      {/* 4. Meet the Creative Director — Mehedi Hasan Sakil Personal Brand */}
      <AgencyFounder />

      {/* 5. Sakil Hub Academy & Masterclasses Preview */}
      <AgencyAcademyPreview />

      {/* 6. Free Meeting & Strategy Consultation Funnel (WhatsApp: 01326896947) */}
      <AgencyConsultation />

      {/* 7. Platform Live Trust & Statistics Strip */}
      <PreFooterStatsBar initialStats={liveStats} />
    </div>
  );
}
