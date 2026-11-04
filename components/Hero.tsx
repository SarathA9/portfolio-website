import { profile } from "@/lib/data";
import AskPortfolio from "./AskPortfolio";
import HeroScene from "./HeroScene";

export default function Hero() {
  return (
    <>
      <header className="hero" id="top">
        <HeroScene />
        <h1 className="giant">
          <span className="g1">Sarath</span>
          <span className="g2">Adukkadukkam</span>
        </h1>
        <div className="wrap hero-bottom">
          <p className="hero-lede">I study how AI systems fail, and build software that doesn’t.</p>
          <div className="hero-side">
            <p className="hero-sub">
              M.Sc. Artificial Intelligence student at OTH Amberg-Weiden and freelance full-stack
              developer in {profile.location.split(",")[0]}. My research is on backdoor attacks and
              defenses for retrieval-augmented LLMs.
            </p>
            <p className="hero-status">
              <span className="dot" aria-hidden />
              Open to working-student and internship roles in AI and software
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary" href={`mailto:${profile.email}`}>
                Email me
              </a>
              <a className="btn" href={profile.resume} target="_blank" rel="noopener">
                Download CV (PDF)
              </a>
              <a className="link" href={profile.github} target="_blank" rel="noopener">
                GitHub
              </a>
              <a className="link" href={profile.linkedin} target="_blank" rel="noopener">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </header>
      <div className="wrap ask-wrap">
        <AskPortfolio />
      </div>
    </>
  );
}
