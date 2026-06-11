import { research } from "@/lib/data";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import TiltCard from "./TiltCard";
import { ArrowUpRight, Document } from "./Icons";

export default function Research() {
  return (
    <section id="research" className="relative">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Research"
            title="Papers & technical reports"
            description="Applied research from my M.Sc. at OTH Amberg-Weiden, spanning biomedical signal processing and autonomous robotics."
          />
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {research.map((paper, i) => (
            <Reveal key={paper.title} delay={i * 90} className="h-full">
              <TiltCard className="h-full">
                <article className="card ring-grad relative flex h-full flex-col overflow-hidden rounded-2xl p-7">
                  <span className="tilt-glow" />
                  <div className="flex items-center gap-3 text-sm text-muted">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-white shadow-[0_8px_24px_-8px_rgba(139,92,246,0.8)]">
                      <Document className="h-5 w-5" />
                    </span>
                    <span className="font-medium">
                      {paper.venue} · {paper.date}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold leading-snug text-ink">
                    {paper.title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {paper.summary}
                  </p>

                  <ul className="mt-5 space-y-2.5">
                    {paper.highlights.map((h) => (
                      <li
                        key={h}
                        className="flex items-start gap-2.5 text-sm text-ink-soft"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {paper.tags.map((t) => (
                      <span
                        key={t}
                        className="chip rounded-full px-2.5 py-1 text-xs font-semibold"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-5">
                    {paper.links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-1 text-sm font-semibold text-cyan transition-colors hover:text-fuchsia"
                      >
                        {link.label}
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </a>
                    ))}
                  </div>
                </article>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
