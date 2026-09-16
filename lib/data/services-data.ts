export interface AgencyServiceItem {
  id: string;
  iconName: "video" | "palette" | "trending-up" | "code";
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  keyBullets: string[];
  deliverables: string[];
  whatsappMessage: string;
}

export const AGENCY_SERVICES: AgencyServiceItem[] = [
  {
    id: "video-production",
    iconName: "video",
    badge: "Core Speciality",
    title: "Video Production",
    subtitle: "End-to-end commercial cinema shooting & editing",
    description:
      "Full-scale professional production with high-end cinema cameras, expert lighting, studio facilities, and certified creative crew.",
    keyBullets: [
      "Shoot",
      "Script Writing",
      "Model & Influencer Hire",
      "Studio Rent Available",
    ],
    deliverables: [
      "4K / 6K Cinema Camera Shooting",
      "Professional Storyboard & Scriptwriting",
      "Talent & Model Casting Management",
      "Fully Equipped Private Studio Access",
      "Color Grading & Cinematic Sound Design",
    ],
    whatsappMessage:
      "Hello Sakil Hub! I am interested in your Video Production service (Shoot, Script Writing, Model Hire, Studio Rent). Please share details.",
  },
  {
    id: "graphic-design",
    iconName: "palette",
    badge: "Visual Identity",
    title: "Graphic Design",
    subtitle: "Brand identity, high-CTR visuals & packaging",
    description:
      "Striking graphic design assets built to command attention across digital ads, social feeds, YouTube, and retail packaging.",
    keyBullets: [
      "Brand Identity & Logo Systems",
      "High-CTR YouTube Thumbnails",
      "Social Media Ad Creatives",
      "Print, Billboard & Packaging",
    ],
    deliverables: [
      "Vector Brand Guidelines & Logo Assets",
      "Custom High-Converting Social Banners",
      "E-Commerce Product Display Cards",
      "Ready-to-Print Packaging Die-lines",
      "Unlimited Revisions on Active Retainers",
    ],
    whatsappMessage:
      "Hello Sakil Hub! I would like to get a quote for Graphic Design (Brand Identity, Social Creatives, Thumbnails).",
  },
  {
    id: "digital-marketing",
    iconName: "trending-up",
    badge: "Performance & ROI",
    title: "Digital Marketing",
    subtitle: "All social media marketing & business page setup",
    description:
      "Data-driven marketing campaigns, verified brand page configurations, and conversion funnels that generate measurable revenue.",
    keyBullets: [
      "All Social Media Marketing",
      "Business Page Setup & Verification",
      "Meta, TikTok & YouTube Ad Scaling",
      "Sales Funnel Strategy & Tracking",
    ],
    deliverables: [
      "Facebook, Instagram, TikTok & LinkedIn Page Setup",
      "Meta Business Manager & Pixel Integration",
      "Targeted Paid Ad Campaign Strategy",
      "Weekly Performance & Analytics Reports",
      "Audience Retargeting & Lead Generation",
    ],
    whatsappMessage:
      "Hello Sakil Hub! I am looking for Digital Marketing services (Social Media Marketing, Business Page Setup, Paid Ads).",
  },
  {
    id: "website-development",
    iconName: "code",
    badge: "High Performance",
    title: "Website Development",
    subtitle: "All modern website development services",
    description:
      "Custom, lightning-fast responsive websites, conversion-optimized landing pages, e-commerce stores, and digital platform engineering.",
    keyBullets: [
      "All Website Development Services",
      "Ultra-Fast E-Commerce Stores",
      "Conversion Landing Pages",
      "SEO, Security & Maintenance",
    ],
    deliverables: [
      "Next.js / React Modern Web Engineering",
      "Mobile-First Responsive Layouts",
      "bKash / Nagad / Card Payment Gateways",
      "SEO Friendly & Ultra-Low Latency (<1s LCP)",
      "SSL, Cloudflare Protection & Hosting Setup",
    ],
    whatsappMessage:
      "Hello Sakil Hub! I need Website Development services (Custom Website, E-Commerce, Landing Page). Let's discuss.",
  },
];
