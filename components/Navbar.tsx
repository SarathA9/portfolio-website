import { profile } from "@/lib/data";

const links = [
  { label: "Research", href: "#research" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

function Mark() {
  // three linked nodes: the network motif of the site, as a small logo
  return (
    <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden className="mark-svg">
      <defs>
        <linearGradient id="mk" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8ea6ff" />
          <stop offset="1" stopColor="#b69cff" />
        </linearGradient>
      </defs>
      <rect x="0.5" y="0.5" width="31" height="31" rx="9" fill="rgba(142,166,255,0.08)" stroke="rgba(255,255,255,0.14)" />
      <path d="M10 21.5 16 10l6 11.5H10Z" fill="none" stroke="url(#mk)" strokeWidth="1.4" strokeLinejoin="round" opacity="0.8" />
      <circle cx="16" cy="10" r="2.6" fill="url(#mk)" />
      <circle cx="10" cy="21.5" r="2.6" fill="url(#mk)" />
      <circle cx="22" cy="21.5" r="2.6" fill="#e9edff" />
    </svg>
  );
}

export default function Navbar() {
  return (
    <nav className="nav" aria-label="Main">
      <div className="wrap nav-inner">
        <a href="#top" className="brand" aria-label="Sarath Adukkadukkam, back to top">
          <Mark />
          <span className="brand-name">
            Sarath <span>Adukkadukkam</span>
          </span>
        </a>
        <ul className="nav-links">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
        </ul>
        <a className="nav-cv" href={profile.resume} target="_blank" rel="noopener">
          Download CV
        </a>
      </div>
      <span className="progress" aria-hidden />
    </nav>
  );
}
