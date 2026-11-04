"use client";

import { useEffect, useRef } from "react";
import type { Project } from "@/lib/data";
import ProjectArt from "./ProjectArt";

/**
 * A horizontal scrapbook strip of projects.
 * - Scrolls sideways natively: trackpad, shift + wheel, touch swipe, or mouse drag
 * - Drifts slowly on its own in an endless loop (the set is rendered three times
 *   and the position wraps invisibly), pausing while someone interacts with it
 * - Arrow buttons glide one card at a time
 */

const DRIFT = 26; // px per second
const tilts = [-1.6, 1.2, -0.8, 1.7, -1.2];
const tapes = ["tape-lilac", "tape-cream", "tape-blue", "tape-cream", "tape-lilac"];

export default function ProjectStrip({ projects }: { projects: (Project & { id: string })[] }) {
  const strip = useRef<HTMLDivElement>(null);
  const api = useRef<{ step: (d: number) => void }>({ step: () => {} });

  useEffect(() => {
    const el = strip.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const middle = el.querySelector<HTMLElement>('[data-set="1"]')!;

    let setW = middle.offsetWidth;
    let x = middle.offsetLeft; // our own float position
    el.scrollLeft = x;
    let lastSet = el.scrollLeft;
    let target: number | null = null;
    let pausedUntil = 0;
    let hover = false;
    let visible = true;
    let speed = 0;

    const measure = () => {
      const offset = x - middle.offsetLeft;
      setW = middle.offsetWidth;
      x = middle.offsetLeft + (((offset % setW) + setW) % setW);
      el.scrollLeft = x;
      lastSet = el.scrollLeft;
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    const hold = (ms = 3500) => (pausedUntil = performance.now() + ms);

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible || document.hidden) return;

      // the visitor scrolled it themselves (trackpad, swipe, drag)
      if (Math.abs(el.scrollLeft - lastSet) > 1) {
        x = el.scrollLeft;
        target = null;
        hold();
      }

      if (target !== null) {
        const d = target - x;
        x += d * Math.min(1, dt * 6);
        if (Math.abs(d) < 0.5) {
          x = target;
          target = null;
        }
      } else {
        const want = reduced || hover || now < pausedUntil ? 0 : DRIFT;
        speed += (want - speed) * Math.min(1, dt * 2.5);
        x += speed * dt;
      }

      // keep the position inside the middle copy so the loop never ends
      const start = middle.offsetLeft;
      if (x < start - setW * 0.5) {
        x += setW;
        if (target !== null) target += setW;
      } else if (x > start + setW * 0.5) {
        x -= setW;
        if (target !== null) target -= setW;
      }

      el.scrollLeft = x;
      lastSet = el.scrollLeft;
    };
    raf = requestAnimationFrame(tick);

    api.current.step = (dir: number) => {
      const card = middle.querySelector<HTMLElement>(".pcard");
      const w = card ? card.offsetWidth + 36 : 380;
      target = (target ?? x) + dir * w;
      hold(5000);
    };

    // mouse drag to scroll (touch already scrolls natively)
    let drag: { x: number; left: number; moved: boolean } | null = null;
    let suppress = false;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      drag = { x: e.clientX, left: x, moved: false };
      target = null;
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 4) {
        drag.moved = true;
        el.classList.add("dragging");
      }
      x = drag.left - dx;
      el.scrollLeft = x;
      lastSet = el.scrollLeft;
      hold();
    };
    const onUp = () => {
      if (drag?.moved) suppress = true;
      drag = null;
      el.classList.remove("dragging");
    };
    const onClick = (e: MouseEvent) => {
      if (suppress) {
        e.preventDefault();
        e.stopPropagation();
        suppress = false;
      }
    };
    const onEnter = () => (hover = true);
    const onLeave = () => (hover = false);
    const onTouch = () => hold(4000);
    const onFocus = () => {
      hover = true;
      hold(6000);
    };
    const onBlur = () => (hover = false);

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("click", onClick, true);
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("touchstart", onTouch, { passive: true });
    el.addEventListener("focusin", onFocus);
    el.addEventListener("focusout", onBlur);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("click", onClick, true);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("touchstart", onTouch);
      el.removeEventListener("focusin", onFocus);
      el.removeEventListener("focusout", onBlur);
    };
  }, []);

  const ext = (href: string) => (href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {});

  const set = (copy: number) => (
    <div
      className="pset"
      data-set={copy}
      key={copy}
      // the copies only exist to make the loop seamless
      {...(copy !== 1 ? { "aria-hidden": true, inert: true } : {})}
    >
      {projects.map((p, i) => (
        <article
          key={p.title}
          id={copy === 1 ? p.id : undefined}
          className="pcard"
          style={{ ["--r" as string]: `${tilts[i % tilts.length]}deg`, ["--y" as string]: `${[0, 18, 6, 22, 10][i % 5]}px` }}
        >
          <span className={`tape ${tapes[i % tapes.length]}`} aria-hidden />
          <div className="pcard-photo" aria-hidden>
            <ProjectArt name={p.title} />
          </div>
          <p className="pcard-kind hand">{p.kind}</p>
          <h3>
            <a href={p.href} {...ext(p.href)} draggable={false}>
              {p.title}
            </a>
          </h3>
          <p className="pcard-text">{p.blurb}</p>
          <ul className="pcard-tags">
            {p.tags.slice(0, 4).map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <span className="pcard-link">{p.linkLabel}</span>
        </article>
      ))}
    </div>
  );

  return (
    <div className="pstrip-wrap">
      <div className="pstrip" ref={strip} tabIndex={-1} aria-label="Projects, scroll sideways">
        <div className="ptrack">{[0, 1, 2].map(set)}</div>
      </div>
      <div className="pstrip-nav">
        <button type="button" className="orbit-btn" aria-label="Previous project" onClick={() => api.current.step(-1)}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
            <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className="hand pstrip-hint">scroll sideways, or let it drift</p>
        <button type="button" className="orbit-btn" aria-label="Next project" onClick={() => api.current.step(1)}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
            <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
