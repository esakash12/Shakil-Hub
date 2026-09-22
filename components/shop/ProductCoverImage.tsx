"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { resolveMediaUrl } from "@/lib/data/courses";

interface ProductCoverImageProps {
  src: string;
  alt: string;
  title: string;
  category: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}

export default function ProductCoverImage({
  src,
  alt,
  title,
  category,
  priority = false,
  sizes = "(max-width: 1024px) 100vw, 65vw",
  className = "object-cover group-hover:scale-105 transition-transform duration-500",
}: ProductCoverImageProps) {
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = resolveMediaUrl(src) || src;

  if (!resolvedSrc || hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-neutral-900 via-black to-neutral-950 select-none">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2 shadow-inner">
          <ShoppingBag className="w-5 h-5" />
        </div>
        <h3 className="text-xs font-bold text-white max-w-[85%] line-clamp-1">{title}</h3>
        <span className="text-[10px] text-cyan-400 font-mono mt-0.5 uppercase tracking-wider">{category}</span>
      </div>
    );
  }

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      fill
      priority={priority}
      unoptimized
      sizes={sizes}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
