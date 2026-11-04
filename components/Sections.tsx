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
  const notes = ["note-yellow", "note-pink", "note-blue", "note-green"];
  return (
    <section id="about" className="sec wrap" aria-labelledby="about-title">
      <div className="scrapbook">
        <figure className="scrap polaroid" style={{ ["--r" as string]: "-5deg", ["--d" as string]: "0s" }}>
          <span className="tape tape-tl" aria-hidden />
          <span className="tape tape-tr" aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sarath-geroldsee.jpg"
            alt="Sarath sitting on a wooden bench by a lake, with forest and snowy mountains behind him"
            width={1050}
            height={1400}
            loading="lazy"
          />
          <figcaption className="hand">me, on a day off</figcaption>
        </figure>

        <div className="scrap paper" style={{ ["--r" as string]: "1.5deg", ["--d" as string]: "0.12s" }}>
          <span className="tape tape-top" aria-hidden />
          <h2 id="about-title">About me</h2>
          {about.intro.map((p) => (
            <p key={p.slice(0, 20)}>{p}</p>
          ))}
          <p className="hand paper-sign">Sarath</p>
        </div>

        <div className="scrap stamp" style={{ ["--r" as string]: "8deg", ["--d" as string]: "0.3s" }} aria-label="Based in Nuremberg, Germany">
          <span className="stamp-inner">
            <span className="stamp-city">Nürnberg</span>
            <span className="stamp-sub">Germany</span>
          </span>
        </div>

        <div className="focus-notes">
          <p className="hand focus-label">
            what I focus on
            <svg viewBox="0 0 60 30" width="60" height="30" aria-hidden>
              <path d="M2 6c18 0 34 4 46 18M48 24l-9-1M48 24l1-9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </p>
          {about.focus.map((f, i) => (
            <div
              key={f}
              className={`scrap note ${notes[i % notes.length]}`}
              style={{ ["--r" as string]: `${[-3, 2.5, -1.5, 3][i % 4]}deg`, ["--d" as string]: `${0.35 + i * 0.08}s` }}
            >
              <span className="pin" aria-hidden />
              {f}
            </div>
          ))}
        </div>

        <div className="about-side">
        <div className="scrap index-card" style={{ ["--r" as string]: "-1.5deg", ["--d" as string]: "0.6s" }}>
          <h3 className="hand">currently</h3>
          <ul>
            <li>M.Sc. Artificial Intelligence at OTH Amberg-Weiden</li>
            <li>Freelance full-stack developer</li>
            <li>Looking for a working-student or internship role</li>
          </ul>
        </div>
        <div className="tickets" aria-label="Languages">
          {[
            { lang: "English", level: "C1", note: "business fluent" },
            { lang: "Deutsch", level: "A2", note: "learning" },
            { lang: "Malayalam", level: "Native", note: "mother tongue" },
          ].map((t, i) => (
            <div
              key={t.lang}
              className="scrap ticket"
              style={{ ["--r" as string]: `${[-2, 1.5, -1][i]}deg`, ["--d" as string]: `${0.7 + i * 0.08}s` }}
            >
              <span className="ticket-lang">{t.lang}</span>
              <span className="ticket-level">{t.level}</span>
              <span className="ticket-note">{t.note}</span>
            </div>
          ))}
        </div>
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
