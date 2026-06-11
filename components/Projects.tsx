import { projects } from "@/lib/data";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import TiltCard from "./TiltCard";
import { ArrowUpRight } from "./Icons";

export default function Projects() {
  return (
    <section id="projects" className="relative">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Projects"
            title="Things I've built"
            description="A selection of full-stack and machine-learning projects. More on my GitHub."
          />
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <Reveal key={project.title} delay={(i % 3) * 80} className="h-full">
              <TiltCard className="h-full">
                <a
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`card group relative flex h-full flex-col overflow-hidden rounded-2xl p-6 ${
                    project.featured ? "ring-grad" : ""
                  }`}
                >
                  <span className="tilt-glow" />
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-ink transition-colors group-hover:bg-brand group-hover:text-white">
                      <ArrowUpRight className="h-5 w-5" />
                    </span>
                    {project.featured && (
                      <span className="bg-brand rounded-full px-2.5 py-0.5 text-xs font-semibold text-white shadow-[0_6px_18px_-6px_rgba(139,92,246,0.9)]">
                        Featured
                      </span>
                    )}
                  </div>

                  <h3 className="mt-4 text-base font-bold leading-snug text-ink transition-colors group-hover:text-cyan">
                    {project.title}
                  </h3>

                  <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted">
                    {project.blurb}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {project.tags.map((t) => (
                      <span
                        key={t}
                        className="chip rounded-md px-2 py-0.5 text-xs font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-cyan">
                    {project.linkLabel}
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </a>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
