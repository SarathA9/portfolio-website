"use client";

import { useEffect, useState } from "react";
import { navLinks, profile } from "@/lib/data";
import { ArrowUpRight, Close, GitHub, LinkedIn, Mail, Menu } from "./Icons";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // scroll-spy: highlight the section currently in view
  useEffect(() => {
    const ids = navLinks.map((l) => l.href.replace("#", ""));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // body-scroll lock + Escape to close while the overlay is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "glass-nav border-b border-line"
            : "border-b border-transparent"
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-end px-4 sm:px-8 md:justify-center">
          {/* Desktop links */}
          <ul className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => {
              const isActive = active === link.href;
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={`group relative text-[0.95rem] font-medium tracking-wide transition-colors ${
                      isActive ? "text-ink" : "text-muted hover:text-ink"
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute -bottom-1.5 left-0 h-0.5 rounded-full bg-brand transition-all duration-300 ${
                        isActive ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    />
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            className="glass grid h-11 w-11 place-items-center rounded-xl text-ink transition-colors hover:text-cyan md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
        </nav>
      </header>

      {/* Mobile full-screen overlay */}
      <div
        className={`fixed inset-0 z-[80] md:hidden ${
          open ? "visible" : "invisible"
        }`}
        aria-hidden={!open}
      >
        {/* backdrop */}
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-night/85 backdrop-blur-xl transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        {/* glow accents */}
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.25),transparent_65%)] blur-2xl" />
        <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(226,59,214,0.22),transparent_65%)] blur-2xl" />

        {/* panel */}
        <div className="relative flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-5">
            <span className="eyebrow text-xs">Navigation</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="glass grid h-11 w-11 place-items-center rounded-xl text-ink transition-colors hover:text-cyan"
            >
              <Close className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex flex-1 flex-col justify-center px-6">
            {navLinks.map((link, i) => {
              const isActive = active === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  style={{ transitionDelay: open ? `${i * 55 + 120}ms` : "0ms" }}
                  className={`group flex items-center gap-4 border-b border-line py-4 transition-all duration-500 ${
                    open
                      ? "translate-x-0 opacity-100"
                      : "translate-x-6 opacity-0"
                  }`}
                >
                  <span className="font-mono text-sm text-cyan">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`text-3xl font-bold tracking-tight transition-colors ${
                      isActive
                        ? "text-gradient"
                        : "text-ink-soft group-hover:text-ink"
                    }`}
                  >
                    {link.label}
                  </span>
                  <ArrowUpRight className="ml-auto h-5 w-5 text-muted transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-cyan" />
                </a>
              );
            })}
          </nav>

          {/* socials */}
          <div
            style={{ transitionDelay: open ? "480ms" : "0ms" }}
            className={`flex items-center justify-center gap-3 px-6 pb-10 pt-4 transition-all duration-500 ${
              open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
            }`}
          >
            <OverlaySocial href={profile.github} label="GitHub">
              <GitHub className="h-5 w-5" />
            </OverlaySocial>
            <OverlaySocial href={profile.linkedin} label="LinkedIn">
              <LinkedIn className="h-5 w-5" />
            </OverlaySocial>
            <OverlaySocial href={`mailto:${profile.email}`} label="Email">
              <Mail className="h-5 w-5" />
            </OverlaySocial>
          </div>
        </div>
      </div>
    </>
  );
}

function OverlaySocial({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="glass grid h-12 w-12 place-items-center rounded-xl text-muted transition-all hover:-translate-y-0.5 hover:text-cyan"
    >
      {children}
    </a>
  );
}
