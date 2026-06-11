import { profile } from "@/lib/data";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import { ArrowUpRight, GitHub, LinkedIn, Mail, MapPin } from "./Icons";

export default function Contact() {
  const items = [
    {
      icon: <Mail className="h-5 w-5" />,
      label: "Email",
      value: profile.email,
      href: `mailto:${profile.email}`,
    },
    {
      icon: <Mail className="h-5 w-5" />,
      label: "Academic email",
      value: profile.academicEmail,
      href: `mailto:${profile.academicEmail}`,
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      label: "Location",
      value: profile.address,
      href: undefined,
    },
  ];

  return (
    <section id="contact" className="relative">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="card ring-grad relative overflow-hidden rounded-3xl p-8 sm:p-12">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.35),transparent_65%)] blur-2xl" />
          <div className="relative grid gap-12 lg:grid-cols-[1fr_1fr]">
            <Reveal>
              <div>
                <SectionHeading
                  eyebrow="Contact"
                  title="Let's work together"
                  description="I'm open to working-student roles, internships and freelance projects in AI and software. The fastest way to reach me is email."
                />
                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href={`mailto:${profile.email}`}
                    className="btn-grad inline-flex items-center gap-1.5 rounded-full px-6 py-3 text-sm font-semibold"
                  >
                    <Mail className="h-4 w-4" />
                    Send an email
                  </a>
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost inline-flex items-center gap-1.5 rounded-full px-6 py-3 text-sm font-semibold"
                  >
                    <LinkedIn className="h-4 w-4" />
                    LinkedIn
                  </a>
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost inline-flex items-center gap-1.5 rounded-full px-6 py-3 text-sm font-semibold"
                  >
                    <GitHub className="h-4 w-4" />
                    GitHub
                  </a>
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <ul className="divide-y divide-line">
                {items.map((item) => {
                  const content = (
                    <span className="flex items-start gap-4 px-2 py-4">
                      <span className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-cyan">
                        {item.icon}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs eyebrow">
                          {item.label}
                        </span>
                        <span className="mt-1 block break-words text-sm font-medium text-ink">
                          {item.value}
                        </span>
                      </span>
                      {item.href && (
                        <ArrowUpRight className="ml-auto mt-1 h-4 w-4 shrink-0 text-muted" />
                      )}
                    </span>
                  );
                  return (
                    <li key={item.label}>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="block rounded-xl transition-colors hover:bg-accent-soft"
                        >
                          {content}
                        </a>
                      ) : (
                        content
                      )}
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
