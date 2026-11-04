"use client";

import { useEffect } from "react";

/**
 * Scroll-driven 3D effects, all through CSS custom properties:
 *  - .hero gets --hp (0 → 1 while scrolling past it), so its content sinks back
 *  - every .depth element gets --p (0 → 1 as it enters the viewport), so it tilts up into place
 *  - .orbit gets --rot, turning the projects carousel, and data-active for the front card
 */
export default function ScrollFX() {
  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    root.classList.add("fx");

    const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>(".nav-links a"));
    const targets = navLinks
      .map((a) => document.querySelector<HTMLElement>(a.getAttribute("href") || ""))
      .filter(Boolean) as HTMLElement[];

    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight;

      // reading progress + current section in the nav
      const max = document.documentElement.scrollHeight - vh;
      root.style.setProperty("--sp", (window.scrollY / Math.max(1, max)).toFixed(4));
      let current = -1;
      targets.forEach((t, i) => {
        if (t.getBoundingClientRect().top < vh * 0.4) current = i;
      });
      navLinks.forEach((a, i) => {
        if (i === current) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });

      const hero = document.querySelector<HTMLElement>(".hero");
      if (hero) {
        const r = hero.getBoundingClientRect();
        const hp = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height * 0.9)));
        hero.style.setProperty("--hp", hp.toFixed(3));
      }

      document.querySelectorAll<HTMLElement>(".depth").forEach((el) => {
        const r = el.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.42)));
        el.style.setProperty("--p", p.toFixed(3));
      });

      document.querySelectorAll<HTMLElement>(".orbit").forEach((orbit) => {
        const n = Number(orbit.dataset.count || 1);
        const r = orbit.getBoundingClientRect();
        const prog = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - vh)));
        const pos = prog * (n - 1);
        orbit.style.setProperty("--rot", `${-pos * Number(orbit.dataset.step || 360 / n)}deg`);
        orbit.style.setProperty("--prog", prog.toFixed(3));
        orbit.dataset.active = String(Math.round(pos));
      });
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    // Keyboard users: focusing a carousel card scrolls it to the front
    const onFocus = (e: FocusEvent) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>(".orbit-card");
      const orbit = card?.closest<HTMLElement>(".orbit");
      if (!card || !orbit || window.innerWidth < 760) return;
      const n = Number(orbit.dataset.count || 1);
      const i = Number(card.dataset.index || 0);
      const top = orbit.getBoundingClientRect().top + window.scrollY;
      const span = orbit.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + (span * i) / Math.max(1, n - 1), behavior: "smooth" });
    };

    // Previous / next buttons on the carousel
    const scrollToCard = (orbit: HTMLElement, i: number) => {
      const n = Number(orbit.dataset.count || 1);
      const k = Math.max(0, Math.min(n - 1, i));
      const top = orbit.getBoundingClientRect().top + window.scrollY;
      const span = orbit.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + (span * k) / Math.max(1, n - 1) + 1, behavior: "smooth" });
    };
    const onClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-orbit-step]");
      const orbit = btn?.closest<HTMLElement>(".orbit");
      if (!btn || !orbit) return;
      scrollToCard(orbit, Number(orbit.dataset.active || 0) + Number(btn.dataset.orbitStep));
    };
    document.addEventListener("click", onClick);

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    document.addEventListener("focusin", onFocus);
    return () => {
      root.classList.remove("fx");
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("click", onClick);
    };
  }, []);
  return null;
}
