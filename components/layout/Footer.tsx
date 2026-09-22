"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Youtube, Facebook, Instagram, Linkedin, Twitter, Mail, MapPin, Phone } from "lucide-react";
import { getPlatformBrandingAction } from "@/lib/actions/branding";
import { PlatformBrandingSettings, DEFAULT_BRANDING } from "@/lib/data/branding-types";

export default function Footer() {
  const [branding, setBranding] = useState<PlatformBrandingSettings>(DEFAULT_BRANDING);

  useEffect(() => {
    let isMounted = true;
    async function loadBrand() {
      try {
        const data = await getPlatformBrandingAction();
        if (isMounted && data) {
          setBranding(data);
        }
      } catch {}
    }
    loadBrand();
    return () => {
      isMounted = false;
    };
  }, []);

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Portfolio", href: "/#portfolio" },
    { name: "Courses", href: "/courses" },
    { name: "Shop", href: "/shop" },
    { name: "Services", href: "/#services" },
    { name: "About", href: "/#about-founder" },
    { name: "Contact", href: "/#contact" },
  ];

  const servicesList = [
    { name: "Video Production", href: "/#services" },
    { name: "Graphic Design", href: "/#services" },
    { name: "Digital Marketing", href: "/#services" },
    { name: "Website Development", href: "/#services" },
    { name: "Courses", href: "/courses" },
    { name: "Digital Shop", href: "/shop" },
  ];

  const socialLinks = [
    { icon: Facebook, href: branding.facebookUrl || "https://facebook.com", label: "Facebook" },
    { icon: Instagram, href: branding.instagramUrl || "https://instagram.com", label: "Instagram" },
    { icon: Youtube, href: branding.youtubeUrl || "https://youtube.com", label: "YouTube" },
    { icon: Linkedin, href: branding.linkedinUrl || "https://linkedin.com", label: "LinkedIn" },
  ];

  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#02050e] text-gray-400 pt-10 sm:pt-14 pb-24 md:pb-12 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-white/[0.08]">
          {/* Brand & Subtitle (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <Link href="/" className="flex items-center gap-2 group inline-flex">
              {branding.logoUrl ? (
                <div className="relative h-8 w-32 overflow-hidden rounded-md">
                  <Image
                    src={branding.logoUrl}
                    alt={branding.siteName || "Sakil Hub"}
                    fill
                    unoptimized
                    sizes="128px"
                    className="object-contain object-left group-hover:scale-105 transition-transform"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-1 font-sans">
                  <span className="text-xl font-black tracking-tight text-white">Sakil</span>
                  <span className="px-2 py-0.5 rounded-lg bg-[#0070f3] text-black font-black text-base shadow-[0_0_15px_rgba(0,112,243,0.4)]">
                    Hub
                  </span>
                </div>
              )}
            </Link>
            <p className="text-xs font-mono text-zinc-400">
              Creative Videos <span className="text-[#00d2ff]">•</span> AI <span className="text-[#00d2ff]">•</span> Marketing
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-2.5 pt-2">
              {socialLinks.map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-[#00d2ff] text-zinc-400 hover:text-[#00d2ff] flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                >
                  <social.icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              {quickLinks.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="hover:text-[#00d2ff] transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-3">
              Services
            </h4>
            <ul className="space-y-2 text-xs">
              {servicesList.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="hover:text-[#00d2ff] transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-3">
              Contact
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#00d2ff] shrink-0" />
                <a
                  href={`mailto:${branding.contactEmail || "support@sakilhub.com"}`}
                  className="text-zinc-300 hover:text-[#00d2ff] transition-colors truncate"
                >
                  {branding.contactEmail || "support@sakilhub.com"}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#00d2ff] shrink-0" />
                <a
                  href={`https://wa.me/${(branding.whatsappNumber || "8801326896947").replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-300 hover:text-[#00d2ff] transition-colors whitespace-nowrap"
                >
                  {branding.contactPhone || branding.whatsappNumber || "+880 1326 896947"}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#00d2ff] shrink-0" />
                <span className="text-zinc-300">{branding.address || "Dhaka, Bangladesh"}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 font-mono">
          <p>{branding.footerCopyright || "© 2026 Sakil Hub. All rights reserved."}</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-[#00d2ff] transition-colors">
              Privacy Policy
            </Link>
            <span>|</span>
            <Link href="/terms" className="hover:text-[#00d2ff] transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
