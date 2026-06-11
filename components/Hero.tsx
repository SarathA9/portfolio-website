import { profile, stats } from "@/lib/data";
import Reveal from "./Reveal";
import RoleRotator from "./RoleRotator";
import HeroVisual from "./HeroVisual";
import { ArrowUpRight, Download, GitHub, LinkedIn, Mail } from "./Icons";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-5 pb-20 pt-32 sm:px-8 sm:pb-28 sm:pt-44">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Left */}
          <div>
            <Reveal>
              <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium text-ink-soft">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
                </span>
                {profile.available}
              </span>
            </Reveal>

            <Reveal delay={70}>
              <p className="mt-6 eyebrow text-xs">{profile.kicker}</p>
            </Reveal>

            <Reveal delay={120}>
              <h1 className="font-hero mt-3 text-4xl font-bold leading-[1.04] tracking-tight text-ink sm:text-6xl lg:text-7xl">
                Sarath
                <br />
                <span className="text-gradient">Adukkadukkam</span>
              </h1>
            </Reveal>

            <Reveal delay={180}>
              <p className="mt-5 text-xl font-semibold text-ink-soft sm:text-2xl">
                <span className="text-muted">I&apos;m </span>
                <RoleRotator roles={profile.roles} />
              </p>
            </Reveal>

            <Reveal delay={240}>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
                {profile.tagline}
              </p>
            </Reveal>

            <Reveal delay={300}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href="#projects"
                  className="btn-grad inline-flex items-center gap-1.5 rounded-full px-6 py-3 text-sm font-semibold"
                >
                  View my work
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <a
                  href={profile.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost inline-flex items-center gap-1.5 rounded-full px-6 py-3 text-sm font-semibold"
                >
                  <Download className="h-4 w-4" />
                  Resume
                </a>
                <div className="flex items-center gap-1 pl-1">
                  <SocialLink href={profile.github} label="GitHub">
                    <GitHub className="h-5 w-5" />
                  </SocialLink>
                  <SocialLink href={profile.linkedin} label="LinkedIn">
                    <LinkedIn className="h-5 w-5" />
                  </SocialLink>
                  <SocialLink href={`mailto:${profile.email}`} label="Email">
                    <Mail className="h-5 w-5" />
                  </SocialLink>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right — interactive 3D object (large screens only) */}
          <HeroVisual />
        </div>

        {/* Stats */}
        <Reveal delay={120}>
          <dl className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:mt-20 sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-night-2/80 px-5 py-7 text-center backdrop-blur-sm sm:text-left"
              >
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="text-gradient block text-4xl font-bold tracking-tight">
                    {s.value}
                  </span>
                  <span className="mt-1 block text-sm text-muted">
                    {s.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

function SocialLink({
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
      className="grid h-11 w-11 place-items-center rounded-full text-muted transition-all hover:-translate-y-0.5 hover:bg-accent-soft hover:text-ink"
    >
      {children}
    </a>
  );
}
