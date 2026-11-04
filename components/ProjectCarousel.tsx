"use client";

import { useEffect, useRef } from "react";
import type { Project } from "@/lib/data";
import ProjectArt from "./ProjectArt";

/**
 * A coverflow carousel that turns continuously in a loop.
 * It slows to a stop on hover or focus, can be dragged or swiped,
 * and the arrows / names step to a project with an eased glide.
 */

const STEP = 34; // degrees between neighbouring cards
const SPEED = 0.16; // cards per second while turning on its own

export default function ProjectCarousel({ projects }: { projects: (Project & { id: string })[] }) {
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLElement | null)[]>([]);
  const dots = useRef<(HTMLButtonElement | null)[]>([]);
  const api = useRef<{ go: (delta: number) => void; to: (i: number) => void }>({ go: () => {}, to: () => {} });
  const n = projects.length;

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let pos = 0; // fractional index of the card in front
    let target: number | null = null; // set when stepping with arrows / names
    let speed = reduced ? 0 : SPEED;
    let hover = false;
    let pausedUntil = 0;
    let visible = true;
    let drag: { x: number; pos: number; moved: boolean } | null = null;
    let R = 760;
    let cardW = 440;
    let active = -1;

    const measure = () => {
      const w = el.clientWidth;
      cardW = Math.min(440, w * 0.82);
      R = cardW * 1.72;
      el.style.setProperty("--card-w", `${cardW}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    const render = () => {
      for (let i = 0; i < n; i++) {
        const c = cards.current[i];
        if (!c) continue;
        let off = (((i - pos) % n) + n) % n;
        if (off > n / 2) off -= n;
        const a = Math.abs(off);
        c.style.transform = `translateZ(${-R}px) rotateY(${off * STEP}deg) translateZ(${R}px)`;
        c.style.opacity = String(Math.max(0, Math.min(1, 1.15 - a * 0.42)));
        c.style.filter = a < 0.5 ? "none" : `brightness(${Math.max(0.55, 1 - a * 0.22)})`;
        c.style.zIndex = String(100 - Math.round(a * 10));
        c.style.pointerEvents = a > 1.6 ? "none" : "auto";
        c.setAttribute("aria-hidden", a > 0.5 ? "true" : "false");
      }
      const front = ((Math.round(pos) % n) + n) % n;
      if (front !== active) {
        active = front;
        dots.current.forEach((d, i) => d?.setAttribute("aria-current", i === front ? "true" : "false"));
      }
    };

    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible || document.hidden) return;

      if (drag) {
        // position follows the pointer directly
      } else if (target !== null) {
        const d = target - pos;
        pos += d * Math.min(1, dt * 5.5);
        if (Math.abs(d) < 0.0015) {
          pos = target;
          target = null;
        }
      } else {
        const want = reduced || hover || now < pausedUntil ? 0 : SPEED;
        speed += (want - speed) * Math.min(1, dt * 2.2); // ease in and out of the turn
        pos += speed * dt;
      }
      render();
    };
    raf = requestAnimationFrame(tick);

    const hold = () => (pausedUntil = performance.now() + 4500);
    api.current.go = (delta: number) => {
      const base = target ?? Math.round(pos);
      target = base + delta;
      speed = 0;
      hold();
    };
    api.current.to = (i: number) => {
      const front = Math.round(pos);
      const cur = ((front % n) + n) % n;
      let d = i - cur;
      if (d > n / 2) d -= n;
      if (d < -n / 2) d += n;
      target = front + d;
      speed = 0;
      hold();
    };

    const onEnter = () => (hover = true);
    const onLeave = () => (hover = false);
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      drag = { x: e.clientX, pos, moved: false };
      target = null;
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 4) drag.moved = true;
      pos = drag.pos - dx / (cardW * 0.9);
    };
    let suppressClick = false;
    const onUp = () => {
      if (!drag) return;
      const moved = drag.moved;
      drag = null;
      if (moved) {
        suppressClick = true; // a drag should not also open the link under the pointer
        target = Math.round(pos);
        speed = 0;
        hold();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (suppressClick) {
        e.preventDefault();
        e.stopPropagation();
        suppressClick = false;
      }
    };
    const onFocus = (e: FocusEvent) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>(".orbit-card");
      if (card) api.current.to(Number(card.dataset.index));
      hover = true;
    };
    const onBlur = () => (hover = false);

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("click", onClick, true);
    el.addEventListener("focusin", onFocus);
    el.addEventListener("focusout", onBlur);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("click", onClick, true);
      el.removeEventListener("focusin", onFocus);
      el.removeEventListener("focusout", onBlur);
    };
  }, [n]);

  const ext = (href: string) => (href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {});

  return (
    <div className="carousel" aria-roledescription="carousel" aria-label="Projects">
      <div className="orbit-stage" ref={stage}>
        <div className="orbit-ring">
          {projects.map((p, i) => (
            <article
              key={p.title}
              id={p.id}
              ref={(node) => {
                cards.current[i] = node;
              }}
              className="orbit-card card spot"
              data-index={i}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${n}: ${p.title}`}
            >
              <div className="proj-visual" aria-hidden>
                <ProjectArt name={p.title} />
              </div>
              <p className="project-kind">{p.kind}</p>
              <h3>
                <a href={p.href} {...ext(p.href)} draggable={false}>
                  {p.title}
                </a>
              </h3>
              <p className="card-text">{p.blurb}</p>
              <ul className="tags">
                {p.tags.slice(0, 4).map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <span className="project-link">{p.linkLabel}</span>
            </article>
          ))}
        </div>
      </div>

      <div className="orbit-nav">
        <button type="button" className="orbit-btn" aria-label="Previous project" onClick={() => api.current.go(-1)}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
            <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="orbit-dots">
          {projects.map((p, i) => (
            <button
              key={p.title}
              type="button"
              ref={(node) => {
                dots.current[i] = node;
              }}
              onClick={() => api.current.to(i)}
              aria-current={i === 0 ? "true" : "false"}
            >
              {p.title}
            </button>
          ))}
        </div>
        <button type="button" className="orbit-btn" aria-label="Next project" onClick={() => api.current.go(1)}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
            <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
