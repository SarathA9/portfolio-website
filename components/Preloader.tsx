"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Loading sequence, shown once per browser session.
 * The logo's three nodes assemble, its links draw, and a signal runs around them;
 * the name rises in; a progress bar follows real loading (fonts → page → 3D scene);
 * then the curtain sweeps up and the hero animates in underneath.
 * The inline script in layout.tsx adds `html.is-loading` before first paint,
 * so returning visitors (and visitors without JS) never see a flash.
 */

const NAME = "Sarath Adukkadukkam";
const STATUS = [
  { at: 0, text: "Initialising" },
  { at: 22, text: "Loading weights" },
  { at: 48, text: "Warming up the network" },
  { at: 74, text: "Rendering the desk" },
  { at: 100, text: "Ready" },
];
const MIN_MS = 1700;
const MAX_MS = 3600;

export default function Preloader() {
  const [active, setActive] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const target = useRef(8);
  const pctEl = useRef<HTMLSpanElement>(null);
  const barEl = useRef<HTMLSpanElement>(null);
  const statusEl = useRef<HTMLSpanElement>(null);
  const boxEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("is-loading")) return;
    setActive(true);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    let shown = 0;
    let done = false;
    let raf = 0;

    const bump = (to: number) => (target.current = Math.max(target.current, to));
    bump(18);
    document.fonts?.ready.then(() => bump(45));
    if (document.readyState === "complete") bump(72);
    else window.addEventListener("load", () => bump(72), { once: true });

    // the 3D desk marks itself ready once its first frame has rendered
    const desk = () => document.querySelector<HTMLElement>(".desk-stage");
    const deskReady = () => desk()?.dataset.ready === "true" || !desk();

    const finish = () => {
      if (done) return;
      done = true;
      setLeaving(true);
      root.classList.add("is-revealing");
      window.setTimeout(() => {
        root.classList.remove("is-loading", "is-revealing");
        try {
          sessionStorage.setItem("sa-loaded", "1");
        } catch {}
        setActive(false);
      }, reduced ? 350 : 1050);
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const elapsed = now - start;
      if (deskReady() && target.current >= 72) bump(100);
      if (elapsed > MAX_MS) bump(100);
      // ease toward the target, but never faster than the minimum duration allows
      const cap = Math.min(100, (elapsed / MIN_MS) * 100);
      const goal = Math.min(target.current, cap);
      shown += (goal - shown) * 0.08;
      if (goal - shown < 0.4) shown = goal;
      // update the DOM directly: no React re-render per frame while the page hydrates
      const p = Math.floor(shown);
      if (pctEl.current) pctEl.current.textContent = `${String(p).padStart(3, "\u2007")}%`;
      if (barEl.current) barEl.current.style.transform = `scaleX(${p / 100})`;
      if (statusEl.current) statusEl.current.textContent = [...STATUS].reverse().find((x) => p >= x.at)!.text;
      boxEl.current?.setAttribute("aria-label", `Loading, ${p}%`);
      if (shown >= 100 && elapsed >= MIN_MS) {
        cancelAnimationFrame(raf);
        window.setTimeout(finish, 260);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!active) return null;

  return (
    <div ref={boxEl} className={`loader${leaving ? " loader-out" : ""}`} role="status" aria-label="Loading">
      <div className="loader-center">
        <svg className="loader-mark" viewBox="0 0 120 120" width="112" height="112" aria-hidden>
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#8ea6ff" />
              <stop offset="1" stopColor="#b69cff" />
            </linearGradient>
            <filter id="lglow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>
          <path className="lm-edge" d="M60 26 L30 86 L90 86 Z" pathLength={300} />
          <path className="lm-edge lm-edge-glow" d="M60 26 L30 86 L90 86 Z" pathLength={300} filter="url(#lglow)" />
          <circle className="lm-node lm-n1" cx="60" cy="26" r="9" />
          <circle className="lm-node lm-n2" cx="30" cy="86" r="9" />
          <circle className="lm-node lm-n3" cx="90" cy="86" r="9" />
          <circle className="lm-signal" r="3.6">
            <animateMotion dur="1.4s" repeatCount="indefinite" begin="0.9s" path="M60 26 L90 86 L30 86 Z" />
          </circle>
        </svg>

        <p className="loader-name" aria-hidden>
          {NAME.split("").map((ch, i) => (
            <span key={i} style={{ animationDelay: `${0.55 + i * 0.028}s` }}>
              {ch === " " ? " " : ch}
            </span>
          ))}
        </p>

        <div className="loader-meta">
          <span className="loader-status" ref={statusEl}>
            {STATUS[0].text}
          </span>
          <span className="loader-pct" ref={pctEl}>
            0%
          </span>
        </div>
        <div className="loader-bar" aria-hidden>
          <span ref={barEl} style={{ transform: "scaleX(0)" }} />
        </div>
      </div>
    </div>
  );
}
