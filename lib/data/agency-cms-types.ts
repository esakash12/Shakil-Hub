export interface AgencyCmsData {
  // Hero Section
  heroPillBadge: string;
  heroHeadlinePrefix: string;
  heroHeadlineHighlight: string;
  heroHeadlineSuffix: string;
  heroSubtext: string;
  heroCtaText: string;
  heroShowreelText: string;

  // Founder Section
  founderName: string;
  founderHeadline: string;
  founderSubheading: string;
  founderSignatureText: string;
  founderPhotoUrl: string;
  founderBio1: string;
  founderBio2: string;
  founderStat1Value: string;
  founderStat1Label: string;
  founderStat2Value: string;
  founderStat2Label: string;
  founderStat3Value: string;
  founderStat3Label: string;
  founderStat4Value: string;
  founderStat4Label: string;

  // Consultation / Booking Section
  consultationBadge?: string;
  consultationTitle: string;
  consultationSubtitle: string;
  consultationWhatsapp: string;
  consultationCheck1: string;
  consultationCheck2: string;
  consultationCheck3: string;
  consultationBtnText?: string;

  // Optional Section Controls
  showAcademyPreview?: boolean;

  updatedAt?: string;
}

export const DEFAULT_AGENCY_CMS: AgencyCmsData = {
  // Hero Section
  heroPillBadge: "Creative Video • AI • Marketing",
  heroHeadlinePrefix: "We Build Powerful",
  heroHeadlineHighlight: "Digital Experiences",
  heroHeadlineSuffix: ", Videos & Brands",
  heroSubtext:
    "Turn your ideas into powerful visual stories. We create cinematic videos, AI-powered commercials, and strategic content that helps your brand grow and get real results.",
  heroCtaText: "Explore Our Portfolio",
  heroShowreelText: "Watch Showreel",

  // Founder Section
  founderName: "MH Sakil",
  founderHeadline: "Directed by MH Sakil",
  founderSubheading: "Founder & CEO, Sakil Hub.",
  founderSignatureText: "",
  founderPhotoUrl: "",
  founderBio1:
    "I started working in the digital industry in 2018. Over the past several years, I have honed advanced video editing, cinema color grading, and commercial visual storytelling.",
  founderBio2:
    "Today, I lead Sakil Hub — creating high-impact visual narratives, AI-powered commercials, and digital branding assets for global clients and high-growth businesses.",
  founderStat1Value: "5+",
  founderStat1Label: "Years Experience",
  founderStat2Value: "100+",
  founderStat2Label: "Projects Completed",
  founderStat3Value: "50+",
  founderStat3Label: "Happy Clients",
  founderStat4Value: "98%",
  founderStat4Label: "Client Satisfaction",

  // Consultation Section
  consultationBadge: "LET’S WORK TOGETHER",
  consultationTitle: "Let’s Build Something Great Together.",
  consultationSubtitle:
    "Have a project in mind?\nSchedule a 30-minute strategy session with MH Sakil, Founder & CEO of Sakil Hub. Let’s discuss your goals, explore creative solutions, and build a clear roadmap for your project.",
  consultationWhatsapp: "01326896947",
  consultationCheck1: "Free Consultation",
  consultationCheck2: "Project Planning",
  consultationCheck3: "Custom Quote",
  consultationBtnText: "Book a Strategy Meeting",

  showAcademyPreview: false,

  updatedAt: new Date().toISOString(),
};
