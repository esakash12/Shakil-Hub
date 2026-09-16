export interface FounderProfile {
  name: string;
  nickname: string;
  role: string;
  currentPositions: string[];
  location: string;
  experienceYears: string;
  startedYear: number;
  avatarUrl: string;
  quote: string;
  journeyStages: string[];
  coreCompetencies: string[];
  stats: { label: string; value: string }[];
  whatsappNumber: string;
}

export const FOUNDER_DATA: FounderProfile = {
  name: "Mehedi Hasan Sakil",
  nickname: "Sakil",
  role: "Creative Director, AI Creator & Founder",
  currentPositions: [
    "Owner & CEO at SakilHub.com",
    "Content Manager at Canvasbag",
    "Content Manager at Chinatown BD",
  ],
  location: "Banani, Dhaka, Bangladesh",
  experienceYears: "6+ Years",
  startedYear: 2018,
  avatarUrl:
    "/images/sakil-portrait.jpg",
  quote:
    "In today's digital landscape, attention is the ultimate currency. We don't just produce videos—we engineer high-converting visual assets that hook audiences, tell memorable stories, and drive real business growth.",
  journeyStages: [
    "Cybersecurity",
    "Digital Marketing",
    "Basic Coding",
    "Advanced Video Editing",
    "AI & Content Creation",
    "Personal Branding",
    "Teaching & Entrepreneurship",
  ],
  coreCompetencies: [
    "Advanced Video Editing",
    "AI-Powered Content Creation",
    "Commercial Video Production",
    "Creative Content Strategy",
    "Social Media & Personal Branding",
    "Client & Brand Management",
    "High-CTR Visual Directing",
    "Digital Marketing & Ads",
  ],
  stats: [
    { label: "Digital Industry", value: "Since 2018" },
    { label: "Advanced Video & AI", value: "4+ Years" },
    { label: "Commercial Works", value: "500+" },
    { label: "Client Satisfaction", value: "99.4%" },
  ],
  whatsappNumber: "01326896947",
};
