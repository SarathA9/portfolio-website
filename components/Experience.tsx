import { experience } from "@/lib/data";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function Experience() {
  return (
    <section id="experience" className="relative">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Experience"
            title="Where I've worked"
            description="Roles across freelance client work and software engineering internships."
          />
        </Reveal>

        <div className="relative mt-14 pl-8 sm:pl-10">
          {/* timeline rail */}
          <span className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-px opacity-60 [background:linear-gradient(to_bottom,var(--color-cyan),var(--color-violet),var(--color-fuchsia))] sm:left-[11px]" />

          <div className="space-y-8">
            {experience.map((job, i) => (
              <Reveal key={job.company + job.role} delay={i * 80}>
                <div className="relative">
                  {/* node */}
                  <span className="absolute -left-8 top-1.5 grid h-4 w-4 place-items-center sm:-left-10">
                    <span className="pulse-ring absolute h-4 w-4 rounded-full bg-violet/40" />
                    <span className="relative h-2.5 w-2.5 rounded-full bg-brand ring-4 ring-night" />
                  </span>

                  <article className="card rounded-2xl p-6 sm:p-7">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h3 className="text-lg font-bold text-ink">{job.role}</h3>
                      <span className="font-mono text-xs text-cyan">
                        {job.period}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm font-semibold text-gradient">
                      {job.company}
                      <span className="ml-2 font-normal text-muted">
                        · {job.location}
                      </span>
                    </p>
                    <ul className="mt-4 space-y-2.5">
                      {job.points.map((point) => (
                        <li
                          key={point}
                          className="flex items-start gap-3 text-sm leading-relaxed text-muted"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
