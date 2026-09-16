import React from "react";
import AgencyHero from "@/components/agency/AgencyHero";
import AgencyPortfolio from "@/components/agency/AgencyPortfolio";
import AgencyServices from "@/components/agency/AgencyServices";
import AgencyFounder from "@/components/agency/AgencyFounder";
import AgencyAcademyPreview from "@/components/agency/AgencyAcademyPreview";
import AgencyConsultation from "@/components/agency/AgencyConsultation";

export default async function HomePage() {
  return (
    <div className="relative animate-in fade-in duration-500 bg-[#020306] text-white">
      {/* 1. Agency Hero Section with Centered Showreel */}
      <AgencyHero />

      {/* 2. Featured Portfolio Showcase — Curated Works & Category Filter */}
      <AgencyPortfolio />

      {/* 3. Specialized Creative Agency Services — Balanced 2x2 Bento Grid */}
      <AgencyServices />

      {/* 4. Meet the Creative Director — Mehedi Hasan Sakil Executive Spotlight */}
      <AgencyFounder />

      {/* 5. Sakil Hub Academy & Masterclasses Preview */}
      <AgencyAcademyPreview />

      {/* 6. Free Strategy Meeting & Consultation Terminal (WhatsApp: 01326896947) */}
      <AgencyConsultation />
    </div>
  );
}
