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
    { name: "All Courses", href: "/courses" },
    { name: "Digital Shop", href: "/shop" },
    { name: "Instructors", href: "/instructors" },
    { name: "About Us", href: "/about" },
    { name: "Student Dashboard", href: "/dashboard" },
  ];

  const topCourses = [
    { name: "Premiere Pro Masterclass", href: "/courses/premiere-pro-masterclass" },
    { name: "After Effects VFX & Motion", href: "/courses/after-effects-masterclass" },
    { name: "DaVinci Resolve Color Grading", href: "/courses/davinci-resolve-color-grading" },
    { name: "Audio Mixing for Video", href: "/courses" },
  ];

  const socialLinks = [
    { icon: Youtube, href: branding.youtubeUrl || "https://youtube.com", label: "YouTube" },
    { icon: Facebook, href: branding.facebookUrl || "https://facebook.com", label: "Facebook" },
    { icon: Instagram, href: branding.instagramUrl || "https://instagram.com", label: "Instagram" },
    { icon: Linkedin, href: branding.linkedinUrl || "https://linkedin.com", label: "LinkedIn" },
    { icon: Twitter, href: branding.twitterUrl || "https://twitter.com", label: "Twitter" },
  ].filter((s) => Boolean(s.href));

  return (
    <footer className="w-full border-t border-white/10 bg-[#06080d]/90 backdrop-blur-xl text-gray-400 pt-8 sm:pt-12 pb-28 sm:pb-8 mt-4 sm:mt-8 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-white/10">
          {/* Brand & Bio */}
          <div className="lg:col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2 group inline-flex">
              {branding.logoUrl ? (
                <div className="relative h-8 w-36 overflow-hidden">
                  <Image
                    src={branding.logoUrl}
                    alt={branding.siteName || "Sakil Hub"}
                    fill
                    sizes="144px"
                    className="object-contain object-left group-hover:scale-105 transition-transform"
                  />
                </div>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                    <Play className="w-4 h-4 text-black fill-black ml-0.5" />
                  </div>
                  <span className="text-lg font-bold tracking-tight text-white">
                    {branding.siteName ? (
                      branding.siteName
                    ) : (
                      <>
                        Sakil<span className="text-cyan-400">Hub</span>
                      </>
                    )}
                  </span>
                </>
              )}
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm font-normal">
              {branding.footerBio ||
                "The premier online academy for video editing, motion graphics, visual effects, and color grading. Empowering creators worldwide to turn passion into a career."}
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-2.5 pt-1">
              {socialLinks.map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-8 h-8 rounded-lg bg-[#0e1320]/80 border border-white/10 hover:bg-[#121929] hover:border-cyan-500/40 hover:text-cyan-300 flex items-center justify-center text-gray-400 transition-all shadow-sm cursor-pointer"
                >
                  <social.icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              {quickLinks.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="hover:text-cyan-300 transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Courses */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Top Courses
            </h4>
            <ul className="space-y-2 text-xs">
              {topCourses.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="hover:text-cyan-300 transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Get in Touch
            </h4>
            <ul className="space-y-2 text-xs">
              {branding.contactEmail && (
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="text-gray-300">{branding.contactEmail}</span>
                </li>
              )}
              {branding.contactPhone && (
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="text-gray-300">{branding.contactPhone}</span>
                </li>
              )}
              {branding.address && (
                <li className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="text-gray-300">{branding.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-500">
          <p>{branding.footerCopyright || "© 2026 Sakil Hub. All rights reserved."}</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-cyan-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-cyan-300 transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy#cookies" className="hover:text-cyan-300 transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
