import { education } from "@/lib/data";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function Education() {
  return (
    <section id="education" className="relative">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal>
          <SectionHeading eyebrow="Education" title="Academic background" />
        </Reveal>

        <div className="relative mt-12 pl-8 sm:pl-10">
          <span
            className="absolute left-[7px] top-2 bottom-2 w-px opacity-60 [background:linear-gradient(to_bottom,var(--color-cyan),var(--color-violet),var(--color-fuchsia))] sm:left-[9px]"
            aria-hidden
          />
          {education.map((item, i) => (
            <Reveal key={item.degree} delay={i * 80}>
              <div className="relative pb-10 last:pb-0">
                <span className="absolute -left-8 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-brand ring-4 ring-night sm:-left-10">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                <span className="font-mono text-xs text-cyan">
                  {item.period}
                </span>
                <h3 className="mt-1 text-lg font-bold text-ink">
                  {item.degree}
                </h3>
                <p className="text-sm font-medium text-ink-soft">
                  {item.school}
                </p>
                <p className="text-sm text-muted">{item.location}</p>
                {item.note && (
                  <p className="mt-1 text-sm text-muted">{item.note}</p>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
