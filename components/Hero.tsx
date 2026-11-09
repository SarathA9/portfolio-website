import { profile } from "@/lib/data";
import AskPortfolio from "./AskPortfolio";
import HeroDesk from "./HeroDesk";

const facts = [
  { label: "Studying", value: "M.Sc. Artificial Intelligence, OTH Amberg-Weiden" },
  { label: "Working", value: "Freelance full-stack developer" },
  { label: "Focus", value: "LLM security, robotics, signal processing" },
  { label: "Based in", value: "Nuremberg, Germany" },
];

export default function Hero() {
  return (
    <>
      <header className="hero" id="top">
        <div className="hero-glow" aria-hidden />
        <HeroDesk />
        <div className="wrap hero-inner">
          <div className="hero-badge">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/avatar.jpg" alt="" width={40} height={40} className="avatar" />
            <p className="pill">
              <span className="dot" aria-hidden />
              Open to working-student and internship roles
            </p>
          </div>
          <h1 className="hero-name" aria-label="Sarath Adukkadukkam">
            <span className="hn-line instrument-serif-regular" data-text="Sarath" aria-hidden>
              Sarath
            </span>
            <span className="hn-line instrument-serif-regular-italic" data-text="Adukkadukkam" aria-hidden>
              Adukkadukkam
            </span>
          </h1>
          <p className="hero-role">
            AI engineer focused on LLM security, and full-stack developer.
          </p>
          <p className="hero-sub">
            My master’s projects range from defending RAG systems against backdoors to autonomous
            robot navigation and indoor localisation. Alongside my studies, I build web apps for
            clients with React, Node.js and SQL.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href={`mailto:${profile.email}`}>
              Email me
            </a>
            <a className="btn btn-ghost" href={profile.resume} target="_blank" rel="noopener">
              Download CV
            </a>
            <span className="hero-socials">
              <a href={profile.github} target="_blank" rel="noopener">
                GitHub
              </a>
              <a href={profile.linkedin} target="_blank" rel="noopener">
                LinkedIn
              </a>
            </span>
          </div>
        </div>
        <div className="wrap">
          <dl className="facts">
            {facts.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <section className="wrap ask-sec" aria-label="Search my work">
        <AskPortfolio />
      </section>
    </>
  );
}
