"use client";

import React, { useEffect, useRef } from "react";

interface CursorSpotlightProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Hardware-Accelerated Desktop Cursor Spotlight Container
 * Dynamically tracks cursor position for child cards with [data-spotlight-card]
 * Completely zero cost / no listeners on mobile touch devices.
 */
export default function CursorSpotlight({
  children,
  className = "",
}: CursorSpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Only activate for desktop fine-pointers (mouse)
    const isDesktop = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!isDesktop) return;

    const handlePointerMove = (e: PointerEvent) => {
      const cards = container.querySelectorAll<HTMLElement>("[data-spotlight-card]");
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const rect = card.getBoundingClientRect();
        // Calculate relative position within each card
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
      }
    };

    container.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      container.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
