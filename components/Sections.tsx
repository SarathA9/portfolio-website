import { about, profile, research, projects, experience, skills, education } from "@/lib/data";
import { slug } from "@/lib/slug";
import Tilt from "./Tilt";

function SectionHead({ id, title, note, count }: { id: string; title: string; note?: string; count?: number }) {
  return (
    <div className="sec-head">
      <h2 id={`${id}-title`}>
        {title}
        {count !== undefined && <sup aria-label={`${count} entries`}>{count}</sup>}
      </h2>
      {note && <p>{note}</p>}
    </div>
  );
}

const ext = (href: string) => (href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {});

export function Research() {
  return (
    <section id="research" className="sec wrap" aria-labelledby="research-title">
      <SectionHead
        id="research"
        title="Research"
        count={research.length}
        note="Reports written at OTH Amberg-Weiden. Each one ships with working code and measured results."
      />
      <div className="papers">
        {research.map((r, i) => (
          <article key={r.title} id={`r-${slug(r.title)}`} className={`paper${i === 0 ? " paper-lead" : ""}`}>
            <div className="paper-meta">
              <time>{r.date}</time>
              <span>{r.venue.split("·")[1]?.trim() ?? r.venue}</span>
            </div>
            <div className="paper-main">
              <h3>{r.title}</h3>
              <p className="paper-summary">{r.summary}</p>
              <ul className="paper-results">
                {r.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
              <div className="row-foot">
                <ul className="tags">
                  {r.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <div className="row-links">
                  {r.links.map((l) => (
                    <a key={l.href} href={l.href} {...ext(l.href)}>
                      {l.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function Projects() {
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);
  return (
    <section id="projects" className="sec wrap" aria-labelledby="projects-title">
      <SectionHead
        id="projects"
        title="Projects"
        count={projects.length}
        note="Machine learning, computer vision and full-stack products I have built."
      />
      <div className="featured">
        {featured.map((p) => (
          <Tilt key={p.title} id={`p-${slug(p.title)}`} className="feat">
            <h3>
              <a href={p.href} {...ext(p.href)}>
                {p.title}
              </a>
            </h3>
            <p>{p.blurb}</p>
            <ul className="tags">
              {p.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <span className="feat-link">{p.linkLabel}</span>
            <span className="sheen" aria-hidden />
          </Tilt>
        ))}
      </div>
      <h3 className="more-title">More projects</h3>
      <ul className="more">
        {rest.map((p) => (
          <li key={p.title} id={`p-${slug(p.title)}`}>
            <a href={p.href} {...ext(p.href)}>
              <span className="more-name">{p.title}</span>
              <span className="more-blurb">{p.blurb}</span>
              <span className="more-tags">{p.tags.slice(0, 3).join(", ")}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Experience() {
  return (
    <section id="experience" className="sec wrap" aria-labelledby="experience-title">
      <SectionHead id="experience" title="Experience" count={experience.length} note="Most recent first." />
      <ol className="timeline">
        {experience.map((e) => (
          <li key={e.company} id={`e-${slug(e.company)}`}>
            <div className="tl-when">
              <span>{e.period}</span>
              <span>{e.location}</span>
            </div>
            <div className="tl-what">
              <h3>{e.role}</h3>
              <p className="tl-company">{e.company}</p>
              <ul>
                {e.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function About() {
  return (
    <section id="about" className="sec wrap about" aria-labelledby="about-title">
      <figure className="about-photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/sarath-geroldsee.jpg"
          alt="Sarath sitting on a wooden bench by a lake, with forest and snowy mountains behind him"
          width={1050}
          height={1400}
          loading="lazy"
        />
      </figure>
      <div className="about-text">
        <h2 id="about-title">About</h2>
        {about.intro.map((p) => (
          <p key={p.slice(0, 20)}>{p}</p>
        ))}
        <h3>What I focus on</h3>
        <ul className="focus">
          {about.focus.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        <p className="langs">
          I speak English (C1), Malayalam (native) and German (A2, improving).
        </p>
      </div>
    </section>
  );
}

export function SkillsEducation() {
  return (
    <section id="skills" className="sec wrap split" aria-labelledby="skills-title">
      <div>
        <SectionHead id="skills" title="Skills" />
        <dl className="skills">
          {skills.map((g) => (
            <div key={g.name}>
              <dt>{g.name}</dt>
              <dd>{g.items.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div id="education">
        <div className="sec-head">
          <h2>Education</h2>
        </div>
        <ol className="edu">
          {education.map((e) => (
            <li key={e.degree}>
              <h3>{e.degree}</h3>
              <p>{e.school}</p>
              <p className="edu-meta">
                {e.period}, {e.location}
                {e.note ? `. ${e.note}` : ""}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section id="contact" className="contact" aria-labelledby="contact-title">
      <div className="wrap">
        <h2 id="contact-title">Hiring for a working student or intern in AI or software?</h2>
        <p>I’m based in Nuremberg. Send me a message and I’ll get back to you.</p>
        <a className="contact-mail" href={`mailto:${profile.email}`}>
          {profile.email}
        </a>
        <ul className="contact-links">
          <li>
            <a href={profile.linkedin} target="_blank" rel="noopener">LinkedIn</a>
          </li>
          <li>
            <a href={profile.github} target="_blank" rel="noopener">GitHub</a>
          </li>
          <li>
            <a href={profile.resume} target="_blank" rel="noopener">CV (PDF)</a>
          </li>
          <li>
            <a href={`mailto:${profile.academicEmail}`}>{profile.academicEmail}</a>
          </li>
        </ul>
      </div>
      <footer className="wrap foot">
        <span>© {new Date().getFullYear()} Sarath Adukkadukkam</span>
        <a href="#top">Back to top</a>
      </footer>
    </section>
  );
}
