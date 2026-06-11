"use client";

import { useEffect, useRef, useState } from "react";

type Entry = { prompt?: boolean; text: string; cls?: string };

// The "SSH session" that types out on load.
const SCRIPT: { cmd?: boolean; text: string; cls?: string }[] = [
  { cmd: true, text: "ssh visitor@sarath-portfolio", cls: "text-ink" },
  { text: "Connecting to sarathofficial.vercel.app:22 ...", cls: "text-muted" },
  { text: "[ OK ]  secure channel established · ed25519", cls: "text-cyan" },
  { text: "[ OK ]  authentication granted", cls: "text-cyan" },
  { text: "" },
  { text: "loading modules", cls: "text-ink-soft" },
  { text: "  next.js runtime ............. ready", cls: "text-muted" },
  { text: "  three.js engine ............. ready", cls: "text-muted" },
  { text: "  neural-field shader ......... ready", cls: "text-muted" },
  { text: "  ui components ............... mounted", cls: "text-muted" },
  { text: "" },
  { text: "booting portfolio · Sarath Adukkadukkam", cls: "text-violet" },
];

export default function Preloader() {
  const [lines, setLines] = useState<Entry[]>([]);
  const [closing, setClosing] = useState(false);
  const [hidden, setHidden] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const finishedRef = useRef(false);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const clearAll = () => timers.current.forEach((t) => clearTimeout(t));

    const finish = () => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      clearAll();
      setClosing(true);
      timers.current.push(setTimeout(() => setHidden(true), 650));
    };

    if (reduce) {
      setLines(
        SCRIPT.map((s) => ({
          prompt: s.cmd,
          text: s.text,
          cls: s.cls,
        }))
      );
      timers.current.push(setTimeout(finish, 700));
      return () => clearAll();
    }

    let i = 0;

    const typeCmd = (full: string, cls: string | undefined, done: () => void) => {
      setLines((prev) => [...prev, { prompt: true, text: "", cls }]);
      let c = 0;
      const tick = () => {
        c++;
        setLines((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            prompt: true,
            text: full.slice(0, c),
            cls,
          };
          return copy;
        });
        if (c < full.length) timers.current.push(setTimeout(tick, 26));
        else done();
      };
      tick();
    };

    const run = () => {
      if (i >= SCRIPT.length) {
        timers.current.push(setTimeout(finish, 550));
        return;
      }
      const item = SCRIPT[i];
      i++;
      if (item.cmd) {
        typeCmd(item.text, item.cls, () =>
          timers.current.push(setTimeout(run, 320))
        );
      } else {
        setLines((prev) => [...prev, { text: item.text, cls: item.cls }]);
        timers.current.push(setTimeout(run, item.text === "" ? 110 : 165));
      }
    };

    timers.current.push(setTimeout(run, 350));
    return () => clearAll();
  }, []);

  // lock scroll while visible; allow skip
  useEffect(() => {
    if (hidden) return;
    document.body.style.overflow = "hidden";
    const skip = () => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      timers.current.forEach((t) => clearTimeout(t));
      setLines(
        SCRIPT.map((s) => ({ prompt: s.cmd, text: s.text, cls: s.cls }))
      );
      setClosing(true);
      setTimeout(() => setHidden(true), 500);
    };
    window.addEventListener("keydown", skip);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", skip);
    };
  }, [hidden]);

  if (hidden) return null;

  const total = SCRIPT.length;
  const progress = closing
    ? 100
    : Math.min(100, Math.round((lines.length / total) * 100));

  return (
    <div
      onClick={() => {
        if (finishedRef.current) return;
        finishedRef.current = true;
        timers.current.forEach((t) => clearTimeout(t));
        setLines(SCRIPT.map((s) => ({ prompt: s.cmd, text: s.text, cls: s.cls })));
        setClosing(true);
        setTimeout(() => setHidden(true), 500);
      }}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-night px-5 transition-opacity duration-700 ${
        closing ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-label="Loading"
    >
      {/* glow accents */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.12),transparent_60%)] blur-2xl" />

      {/* terminal window */}
      <div className="ring-grad relative w-[min(92vw,620px)] overflow-hidden rounded-xl border border-line bg-[#070a16]/90 shadow-[0_40px_120px_-30px_rgba(34,211,238,0.45)] backdrop-blur">
        {/* title bar */}
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 font-mono text-xs text-muted">
            visitor@sarath — ssh — 80×24
          </span>
        </div>

        {/* body */}
        <div className="h-[300px] overflow-hidden px-5 py-4 font-mono text-[13px] leading-relaxed sm:text-sm">
          {lines.map((ln, idx) => (
            <div key={idx} className={`whitespace-pre-wrap ${ln.cls ?? "text-ink-soft"}`}>
              {ln.prompt && (
                <span className="text-fuchsia">visitor@portfolio</span>
              )}
              {ln.prompt && <span className="text-muted">:~$ </span>}
              {ln.text}
              {idx === lines.length - 1 && !closing && (
                <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-cyan" />
              )}
            </div>
          ))}
        </div>

        {/* progress */}
        <div className="border-t border-line px-5 py-3">
          <div className="flex items-center justify-between font-mono text-[11px] text-muted">
            <span>establishing session</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="bg-brand h-full rounded-full shadow-[0_0_12px_rgba(139,92,246,0.8)] transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <p className="mt-5 font-mono text-xs text-muted">
        press any key or click to skip
      </p>
    </div>
  );
}
