"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Loading sequence, shown once per browser session.
 *  1. The logo assembles: nodes pop in, links grow, a signal circles the triangle
 *  2. "Sarath / Adukkadukkam" flips up letter by letter, in the hero's own typeface
 *  3. A progress bar follows real loading (fonts → page → first frame of the 3D desk)
 *  4. Hand-off: the name flies into the exact place of the hero title while the
 *     curtain lifts, so the loader's title becomes the page's title.
 * Every animation uses only transform and opacity, so it stays on the GPU and
 * remains smooth while the page is busy. The 3D scenes wait for `sa:loaded`.
 */

const LINES = ["Sarath", "Adukkadukkam"];
const STATUS = [
  { at: 0, text: "Initialising" },
  { at: 30, text: "Loading weights" },
  { at: 60, text: "Warming up the network" },
  { at: 85, text: "Rendering the desk" },
  { at: 100, text: "Ready" },
];
const MIN_MS = 1900; // long enough for the intro to play in full
const MAX_MS = 3800; // never keep a visitor waiting longer than this

// logo geometry (in a 96 × 96 box)
const N = [
  [48, 14],
  [18, 74],
  [78, 74],
];
const EDGES = [
  [0, 1],
  [1, 2],
  [2, 0],
].map(([a, b]) => {
  const [x1, y1] = N[a];
  const [x2, y2] = N[b];
  return { x: x1, y: y1, len: Math.hypot(x2 - x1, y2 - y1), deg: (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI };
});

export default function Preloader() {
  const [active, setActive] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const name = useRef<HTMLParagraphElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const pctEl = useRef<HTMLSpanElement>(null);
  const statusEl = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("is-loading")) {
      window.dispatchEvent(new Event("sa:loaded"));
      return;
    }
    setActive(true);
  }, []);

  useEffect(() => {
    if (!active) return;
    const root = document.documentElement;
    // the loader is running, so the pre-paint safety net is no longer needed
    clearTimeout((window as unknown as { __saSafety?: number }).__saSafety);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    let target = 12;
    let shownTarget = -1;
    let num = 0;
    let lastNum = -1;
    let done = false;
    let raf = 0;
    const timers: number[] = [];

    const bump = (to: number) => (target = Math.max(target, to));
    document.fonts?.ready.then(() => bump(40));
    if (document.readyState === "complete") bump(70);
    else window.addEventListener("load", () => bump(70), { once: true });
    const deskReady = () => {
      const d = document.querySelector<HTMLElement>(".desk-stage");
      return !d || d.dataset.ready === "true";
    };

    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      const el = box.current!;
      const from = name.current!;
      const to = document.querySelector<HTMLElement>(".hero-name");

      // swap the per-letter intro for plain text, so kerning matches the hero title exactly
      from.classList.add("ln-flat");
      // FLIP: fly the loader title onto the hero title
      if (to && !reduced) {
        const a = from.getBoundingClientRect();
        const b = to.getBoundingClientRect();
        const scale = b.height / a.height;
        from.style.transform = `translate(${b.left - a.left}px, ${b.top - a.top}px) scale(${scale})`;
      }
      el.classList.add("loader-out");
      root.classList.add("is-revealing", "loader-done");

      timers.push(
        window.setTimeout(() => {
          root.classList.remove("is-loading", "is-revealing");
          try {
            sessionStorage.setItem("sa-loaded", "1");
          } catch {}
          setActive(false);
          window.dispatchEvent(new Event("sa:loaded"));
        }, reduced ? 380 : 1150)
      );
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const elapsed = now - start;
      if (target >= 70 && deskReady()) bump(100);
      if (elapsed > MAX_MS) bump(100);
      // the bar itself glides with a CSS transition (on the GPU); we only change its target
      const allowed = Math.min(target, 18 + (elapsed / MIN_MS) * 82);
      const step = allowed >= 100 ? 100 : Math.floor(allowed / 6) * 6;
      if (step !== shownTarget) {
        shownTarget = step;
        if (bar.current) bar.current.style.transform = `scaleX(${step / 100})`;
        const s = [...STATUS].reverse().find((x) => step >= x.at)!.text;
        if (statusEl.current && statusEl.current.textContent !== s) statusEl.current.textContent = s;
      }
      // the number counts smoothly toward the bar
      num += (shownTarget - num) * 0.12;
      const n = shownTarget >= 100 && 100 - num < 0.6 ? 100 : Math.floor(num);
      if (n !== lastNum) {
        lastNum = n;
        if (pctEl.current) pctEl.current.textContent = `${n}%`;
      }
      if (n >= 100 && elapsed >= MIN_MS) {
        cancelAnimationFrame(raf);
        timers.push(window.setTimeout(finish, 280));
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, [active]);

  if (!active) return null;

  let i = 0;
  return (
    <div ref={box} className="loader" role="status" aria-label="Loading">
      <div className="curtain" aria-hidden />
      <div className="loader-center">
        <div className="lmark" aria-hidden>
          {EDGES.map((e, k) => (
            <span
              key={k}
              className="lm-edge"
              style={{
                left: e.x,
                top: e.y,
                width: e.len,
                ["--deg" as string]: `${e.deg}deg`,
                animationDelay: `${0.32 + k * 0.16}s`,
              }}
            />
          ))}
          {N.map(([x, y], k) => (
            <span key={k} className={`lm-node lm-n${k + 1}`} style={{ left: x, top: y, animationDelay: `${0.06 + k * 0.12}s, ${1.3 + k * 0.25}s` }} />
          ))}
          <span className="lm-signal" />
        </div>

        <p ref={name} className="loader-name" aria-hidden>
          {LINES.map((line) => (
            <span key={line} className="ln-line">
              <span className="ln-plain">{line}</span>
              {line.split("").map((ch) => {
                const d = 0.5 + i++ * 0.035;
                return (
                  <span key={i} className="ln-char" style={{ animationDelay: `${d}s` }}>
                    {ch}
                  </span>
                );
              })}
            </span>
          ))}
        </p>

        <div className="loader-foot">
          <div className="loader-meta">
            <span ref={statusEl}>{STATUS[0].text}</span>
            <span ref={pctEl} className="loader-pct">
              0%
            </span>
          </div>
          <div className="loader-bar">
            <span ref={bar} />
          </div>
        </div>
      </div>
    </div>
  );
}
