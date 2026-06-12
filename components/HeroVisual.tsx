"use client";

import { useEffect, useState } from "react";
import HeroObject from "./HeroObject";

/**
 * Renders the interactive 3D object only on large screens (>= 1024px).
 * On phones/tablets it renders nothing — no WebGL context is created.
 */
export default function HeroVisual() {
  const [show, setShow] = useState(false);
  // bump to force HeroObject to remount with the new theme palette
  const [themeKey, setThemeKey] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setShow(mq.matches);
    apply();
    if (mq.addEventListener) mq.addEventListener("change", apply);
    else mq.addListener(apply);

    const onTheme = () => setThemeKey((k) => k + 1);
    window.addEventListener("themechange", onTheme);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", apply);
      else mq.removeListener(apply);
      window.removeEventListener("themechange", onTheme);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="order-last">
      <div className="relative mx-auto aspect-square w-full max-w-[440px]">
        <div className="pulse-ring absolute inset-6 -z-10 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.45),transparent_62%)] blur-2xl" />
        <div className="absolute inset-0 rounded-full border border-line" />
        <div className="absolute inset-8 rounded-full border border-line/60" />
        <HeroObject key={themeKey} />
        <span className="glass absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full px-4 py-1.5 text-xs text-muted">
          drag to rotate
        </span>
      </div>
    </div>
  );
}
