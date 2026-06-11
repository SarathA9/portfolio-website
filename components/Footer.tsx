import { profile } from "@/lib/data";
import { GitHub, LinkedIn, Mail } from "./Icons";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-10">
      <div className="divider-glow" />
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-9 sm:flex-row sm:px-8">
        <p className="text-sm text-muted">
          © {year}{" "}
          <span className="font-semibold text-ink">{profile.name}</span>. Built
          with Next.js, Three.js &amp; Tailwind CSS.
        </p>
        <div className="flex items-center gap-1">
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="grid h-10 w-10 place-items-center rounded-full text-muted transition-all hover:-translate-y-0.5 hover:bg-accent-soft hover:text-ink"
          >
            <GitHub className="h-5 w-5" />
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="grid h-10 w-10 place-items-center rounded-full text-muted transition-all hover:-translate-y-0.5 hover:bg-accent-soft hover:text-ink"
          >
            <LinkedIn className="h-5 w-5" />
          </a>
          <a
            href={`mailto:${profile.email}`}
            aria-label="Email"
            className="grid h-10 w-10 place-items-center rounded-full text-muted transition-all hover:-translate-y-0.5 hover:bg-accent-soft hover:text-ink"
          >
            <Mail className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
