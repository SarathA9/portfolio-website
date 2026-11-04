import { profile } from "@/lib/data";
import AskPortfolio from "./AskPortfolio";
import NeuralField from "./NeuralField";

const facts = [
  { label: "Studying", value: "M.Sc. Artificial Intelligence, OTH Amberg-Weiden" },
  { label: "Working", value: "Freelance full-stack developer since 2024" },
  { label: "Research", value: "Backdoor defenses for RAG-based LLMs" },
  { label: "Based in", value: "Nuremberg, Germany" },
];

export default function Hero() {
  return (
    <>
      <header className="hero" id="top">
        <NeuralField />
        <div className="hero-glow" aria-hidden />
        <div className="wrap hero-inner">
          <p className="pill">
            <span className="dot" aria-hidden />
            Open to working-student and internship roles
          </p>
          <h1 className="hero-name">Sarath Adukkadukkam</h1>
          <p className="hero-role">
            AI engineer focused on LLM security, and full-stack developer.
          </p>
          <p className="hero-sub">
            I research how retrieval-augmented language models can be backdoored, and how to
            catch it at query time. Alongside my master’s, I build production web apps with React,
            Node.js and SQL.
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
