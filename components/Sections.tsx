import { about, profile, research, projects, experience, skills, education } from "@/lib/data";
import { slug } from "@/lib/slug";
import ProjectCarousel from "./ProjectCarousel";

function SectionHead({ id, title, note }: { id: string; title: string; note?: string }) {
  return (
    <div className="sec-head">
      <h2 id={`${id}-title`}>{title}</h2>
      {note && <p>{note}</p>}
    </div>
  );
}

const ext = (href: string) => (href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {});

// Headline results of the RAG backdoor study, from the research report.
const rfcMetrics = [
  { value: "0.99–1.00", label: "AUC detecting a single poisoned document" },
  { value: "21% → 1.4%", label: "Conflict-attack success rate, over 500 questions" },
  { value: "2,067", label: "Passages in the poisoned FAISS retrieval corpus" },
];

function Tags({ items }: { items: string[] }) {
  return (
    <ul className="tags">
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}

export function Research() {
  const [lead, ...rest] = research;
  return (
    <section id="research" className="sec wrap" aria-labelledby="research-title">
      <SectionHead
        id="research"
        title="Research"
        note="Study and research projects from my master’s at OTH Amberg-Weiden, each with working code and measured results."
      />

      <article id={`r-${slug(lead.title)}`} className="card spot lead depth">
        <div className="lead-top">
          <p className="meta">
            {lead.date}, {lead.venue}
          </p>
          <h3>{lead.title}</h3>
          <p className="lead-summary">{lead.summary}</p>
        </div>
        <dl className="metrics">
          {rfcMetrics.map((m) => (
            <div key={m.value}>
              <dt>{m.label}</dt>
              <dd>{m.value}</dd>
            </div>
          ))}
        </dl>
        <div className="card-foot">
          <Tags items={lead.tags} />
          <div className="links">
            {lead.links.map((l) => (
              <a key={l.href} href={l.href} {...ext(l.href)}>
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </article>

      <div className="grid-research">
        {rest.map((r) => (
          <article key={r.title} id={`r-${slug(r.title)}`} className="card spot depth study">
            <p className="meta">
              {r.date}, {r.venue}
            </p>
            <h3>{r.title}</h3>
            <p className="study-result">{r.result}</p>
            <p className="card-text">{r.summary}</p>
            <ul className="results">
              {r.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <div className="card-foot">
              <Tags items={r.tags.slice(0, 4)} />
              {r.links.length > 0 && (
                <div className="links">
                  {r.links.map((l) => (
                    <a key={l.href} href={l.href} {...ext(l.href)}>
                      {l.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function Projects() {
  return (
    <section id="projects" className="sec" aria-labelledby="projects-title">
      <div className="wrap">
        <SectionHead
          id="projects"
          title="Projects"
          note="Products I have built and shipped."
        />
      </div>
      <ProjectCarousel projects={projects.map((p) => ({ ...p, id: `p-${slug(p.title)}` }))} />
    </section>
  );
}

export function Experience() {
  return (
    <section id="experience" className="sec wrap" aria-labelledby="experience-title">
      <SectionHead id="experience" title="Experience" note="Most recent first." />
      <ol className="timeline">
        {experience.map((e) => (
          <li key={e.company} id={`e-${slug(e.company)}`} className="depth">
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
    <section id="about" className="sec wrap" aria-labelledby="about-title">
      <div className="about depth">
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
          <dl className="langs" aria-label="Languages">
            <div>
              <dt>English</dt>
              <dd>C1, business fluent</dd>
            </div>
            <div>
              <dt>German</dt>
              <dd>A2, basic</dd>
            </div>
            <div>
              <dt>Malayalam</dt>
              <dd>Native</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

export function SkillsEducation() {
  return (
    <section id="skills" className="sec wrap" aria-labelledby="skills-title">
      <div className="split">
        <div>
          <SectionHead id="skills" title="Skills" />
          <div className="skills">
            {skills.map((g) => (
              <div key={g.name} className="skill-group">
                <h3>{g.name}</h3>
                <Tags items={g.items} />
              </div>
            ))}
          </div>
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
                <p className="meta">
                  {e.period}, {e.location}
                  {e.note ? `. ${e.note}` : ""}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section id="contact" className="sec wrap" aria-labelledby="contact-title">
      <div className="contact card depth">
        <h2 id="contact-title">Let’s work together</h2>
        <p>
          I’m looking for a working-student or internship role in AI or software. I’m based in
          Nuremberg, and the quickest way to reach me is email.
        </p>
        <a className="contact-mail" href={`mailto:${profile.email}`}>
          {profile.email}
        </a>
        <div className="contact-actions">
          <a className="btn btn-primary" href={`mailto:${profile.email}`}>
            Email me
          </a>
          <a className="btn btn-ghost" href={profile.resume} target="_blank" rel="noopener">
            Download CV
          </a>
          <a className="btn btn-ghost" href={profile.linkedin} target="_blank" rel="noopener">
            LinkedIn
          </a>
          <a className="btn btn-ghost" href={profile.github} target="_blank" rel="noopener">
            GitHub
          </a>
        </div>
      </div>
      <footer className="foot">
        <span>© {new Date().getFullYear()} Sarath Adukkadukkam</span>
        <a href="#top">Back to top</a>
      </footer>
    </section>
  );
}
