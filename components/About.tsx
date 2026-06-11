import { about, profile } from "@/lib/data";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import ProfileImage from "./ProfileImage";
import Img from "./Profile.jpeg";

export default function About() {
  return (
    <section id="about" className="relative">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal>
          <SectionHeading eyebrow="About" title="A bit about me" />
        </Reveal>

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          {/* Portrait */}
          <Reveal>
            <div className="relative mx-auto w-fit lg:sticky lg:top-28">
              <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-brand opacity-40 blur-2xl" />
              <div className="ring-grad overflow-hidden rounded-[1.6rem] p-[1.5px]">
                <div className="overflow-hidden rounded-[1.5rem] bg-night-2">
                  <ProfileImage
                    src={Img.src}
                    alt={profile.name}
                    className="h-72 w-64 object-cover sm:h-96 sm:w-80"
                  />
                </div>
              </div>
              <div className="glass absolute -bottom-4 -right-4 flex items-center gap-2 rounded-2xl px-3.5 py-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-xs font-bold text-white">
                  AI
                </span>
                <span className="text-xs font-medium leading-tight text-ink-soft">
                  M.Sc. Artificial
                  <br />
                  Intelligence
                </span>
              </div>
            </div>
          </Reveal>

          {/* Text + focus */}
          <Reveal delay={120}>
            <div className="space-y-5 text-base leading-relaxed text-ink-soft sm:text-lg">
              {about.intro.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="eyebrow text-xs">What I focus on</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {about.focus.map((f) => (
                  <div
                    key={f}
                    className="card flex items-center gap-3 rounded-xl px-4 py-3.5"
                  >
                    <span className="h-2 w-2 shrink-0 rounded-full bg-brand" />
                    <span className="text-sm font-medium text-ink-soft">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
