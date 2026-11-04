"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Smooth, inertia-based scrolling (Lenis) and the scroll-driven 3D effects.
 * Every scroll-linked value is eased toward its target each frame, so the
 * effects glide instead of jumping with each wheel tick.
 *  - .hero gets --hp (0 → 1 while scrolling past it): its content sinks back
 *  - every .depth element gets --p (0 → 1 as it enters): it tilts up into place
 *  - the nav shows the current section
 *  - the about scrapbook gets .in when it scrolls into view, so its pieces drop in
 */
export default function ScrollFX() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const lenis = reduced
      ? null
      : new Lenis({
          lerp: 0.085,
          smoothWheel: true,
          wheelMultiplier: 0.95,
        });
    if (!reduced) root.classList.add("fx");

    const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>(".nav-links a"));
    const targets = navLinks
      .map((a) => document.querySelector<HTMLElement>(a.getAttribute("href") || ""))
      .filter(Boolean) as HTMLElement[];
    const hero = document.querySelector<HTMLElement>(".hero");
    const depth = Array.from(document.querySelectorAll<HTMLElement>(".depth"));
    const state = new Map<HTMLElement, number>();
    let hp = 0;
    let current = -2;

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      lenis?.raf(now);

      const vh = window.innerHeight;
      const k = reduced ? 1 : 1 - Math.exp(-dt * 9); // frame-rate independent easing


      let cur = -1;
      targets.forEach((t, i) => {
        if (t.getBoundingClientRect().top < vh * 0.4) cur = i;
      });
      if (cur !== current) {
        current = cur;
        navLinks.forEach((a, i) => (i === cur ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current")));
      }

      if (reduced) return;

      if (hero) {
        const r = hero.getBoundingClientRect();
        const want = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height * 0.9)));
        hp += (want - hp) * k;
        hero.style.setProperty("--hp", hp.toFixed(4));
      }

      for (const el of depth) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) {
          // off screen: settle instantly to where it should be, no work while hidden
          const want = r.top > vh ? 0 : 1;
          if (state.get(el) !== want) {
            state.set(el, want);
            el.style.setProperty("--p", String(want));
          }
          continue;
        }
        const want = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.45)));
        const prev = state.get(el) ?? want;
        const next = prev + (want - prev) * k;
        if (Math.abs(next - prev) > 0.0005 || prev !== want) {
          state.set(el, next);
          el.style.setProperty("--p", next.toFixed(4));
        }
      }
    };
    raf = requestAnimationFrame(frame);

    // Scrapbook pieces drop onto the page once, each when it comes into view
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    document.querySelectorAll(".scrap").forEach((el) => io.observe(el));

    // In-page links glide to an exact position just below the sticky nav
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
      const id = a.getAttribute("href")!.slice(1);
      const el = id ? document.getElementById(id) : null;
      if (!el) return;
      e.preventDefault();
      const top = id === "top" ? 0 : el.getBoundingClientRect().top + window.scrollY - 72;
      if (lenis) lenis.scrollTo(top, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
      else window.scrollTo({ top });
      history.replaceState(null, "", `#${id}`);
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      io.disconnect();
      cancelAnimationFrame(raf);
      lenis?.destroy();
      root.classList.remove("fx");
    };
  }, []);
  return null;
}
