import { skills } from "@/lib/data";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function Skills() {
  // Flatten for the scrolling marquee
  const marquee = skills.flatMap((g) => g.items);
  const loop = [...marquee, ...marquee];

  return (
    <section id="skills" className="relative">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Skills"
            title="Tools & technologies"
            description="The stack I reach for across web, machine learning and systems work."
          />
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((group, i) => (
            <Reveal key={group.name} delay={(i % 3) * 70} className="h-full">
              <div className="card h-full rounded-2xl p-6">
                <h3 className="flex items-center gap-2 eyebrow text-xs">
                  <span className="h-px w-6 bg-cyan/70" />
                  {group.name}
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="chip rounded-lg px-3 py-1.5 text-sm font-medium"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Edge-faded marquee */}
      <div
        className="relative mt-4 overflow-hidden py-2 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]"
        aria-hidden
      >
        <div className="marquee-track gap-3">
          {loop.map((item, i) => (
            <span
              key={item + i}
              className="chip whitespace-nowrap rounded-full px-4 py-1.5 text-sm"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
