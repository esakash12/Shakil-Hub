import React from "react";
import AgencyHero from "@/components/agency/AgencyHero";
import TechStackMarquee from "@/components/agency/TechStackMarquee";
import AgencyPortfolio from "@/components/agency/AgencyPortfolio";
import AgencyServices from "@/components/agency/AgencyServices";
import AgencyFounder from "@/components/agency/AgencyFounder";
import AgencyAcademyPreview from "@/components/agency/AgencyAcademyPreview";
import AgencyConsultation from "@/components/agency/AgencyConsultation";
import { getPortfolioAction } from "@/lib/actions/portfolio";
import { getAgencyCmsAction } from "@/lib/actions/agency-cms";
import { getPersistentBranding } from "@/lib/data/branding";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default async function HomePage() {
  const [portfolioData, agencyCms, branding] = await Promise.all([
    getPortfolioAction(),
    getAgencyCmsAction(),
    getPersistentBranding(),
  ]);

  return (
    <div className="relative min-h-screen bg-[#02050e] text-white overflow-hidden selection:bg-[#00d2ff] selection:text-black">
      {/* Global Ambient Glow Atmosphere Matching Reference Mockup */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_60%_at_60%_-10%,rgba(0,210,255,0.12),transparent_70%)] pointer-events-none -z-10" />
      <div className="fixed top-0 right-0 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(0,180,255,0.08)_0%,transparent_70%)] blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-1/3 -left-48 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(0,102,255,0.06)_0%,transparent_70%)] blur-[140px] pointer-events-none -z-10" />

      {/* 1. Agency Hero Section with 2-Column Workstation Mockup */}
      <AgencyHero cmsData={agencyCms} featuredItem={portfolioData.items?.[0]} />

      {/* 2. Infinite Creative Tech Stack & Industry Tools Marquee */}
      <TechStackMarquee />

      {/* 3. Featured Portfolio Showcase — 6 Curated Cards & Filter Pills */}
      <ScrollReveal delay={0.05} distance={20}>
        <AgencyPortfolio initialData={portfolioData} />
      </ScrollReveal>

      {/* 4. Specialized Creative Agency Services — 2x2 Bento Grid */}
      <ScrollReveal delay={0.05} distance={24}>
        <AgencyServices />
      </ScrollReveal>

      {/* 5. Director & Founder — MH Sakil Spotlight */}
      <ScrollReveal delay={0.05} distance={24}>
        <AgencyFounder cmsData={agencyCms} branding={branding} />
      </ScrollReveal>

      {/* 6. Sakil Hub Academy & Masterclasses Preview (Controlled via CMS) */}
      {agencyCms?.showAcademyPreview && (
        <ScrollReveal delay={0.05} distance={24}>
          <AgencyAcademyPreview
            previewItem={portfolioData.items?.[1] || portfolioData.items?.[0]}
            cmsData={agencyCms}
          />
        </ScrollReveal>
      )}

      {/* 7. Free Strategy Meeting Consultation & Booking Terminal */}
      <ScrollReveal delay={0.05} distance={24}>
        <AgencyConsultation cmsData={agencyCms} />
      </ScrollReveal>
    </div>
  );
}
