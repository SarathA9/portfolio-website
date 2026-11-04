import { profile } from "@/lib/data";

const links = [
  { label: "Research", href: "#research" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  return (
    <nav className="nav" aria-label="Main">
      <div className="wrap nav-inner">
        <a href="#top" className="nav-mark" aria-label="Sarath Adukkadukkam, back to top">
          SA
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
    </nav>
  );
}
