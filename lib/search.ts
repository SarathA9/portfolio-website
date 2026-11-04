// A tiny client-side retriever over the portfolio content.
// It ranks research, projects, roles and skills against a visitor's query,
// in the spirit of the RAG retrieval work featured on the site.

import { research, projects, experience, skills } from "./data";
import { slug } from "./slug";

export type Doc = {
  id: string;
  kind: "Research" | "Project" | "Experience" | "Skills";
  title: string;
  text: string;
  href: string;
};

export const docs: Doc[] = [
  ...research.map((r) => ({
    id: `r-${slug(r.title)}`,
    kind: "Research" as const,
    title: r.title,
    text: `${r.summary} ${r.highlights.join(" ")} ${r.tags.join(" ")}`,
    href: `#r-${slug(r.title)}`,
  })),
  ...projects.map((p) => ({
    id: `p-${slug(p.title)}`,
    kind: "Project" as const,
    title: p.title,
    text: `${p.blurb} ${p.tags.join(" ")}`,
    href: `#p-${slug(p.title)}`,
  })),
  ...experience.map((e) => ({
    id: `e-${slug(e.company)}`,
    kind: "Experience" as const,
    title: `${e.role}, ${e.company}`,
    text: `${e.points.join(" ")} ${e.location}`,
    href: `#e-${slug(e.company)}`,
  })),
  ...skills.map((g) => ({
    id: `s-${slug(g.name)}`,
    kind: "Skills" as const,
    title: g.name,
    text: g.items.join(", "),
    href: "#skills",
  })),
];

// Query expansion: what a visitor types → words that appear in the content.
const synonyms: Record<string, string[]> = {
  llm: ["llama", "rag", "qlora", "retrieval"],
  llms: ["llama", "rag", "qlora", "retrieval"],
  rag: ["retrieval", "faiss", "corpus"],
  security: ["backdoor", "poison", "defense", "attack", "secure", "authentication"],
  privacy: ["backdoor", "poison", "defense", "secure"],
  ai: ["machine", "learning", "llama", "tensorflow", "yolov8", "model"],
  ml: ["machine", "learning", "tensorflow", "scikit", "yolov8", "pytorch"],
  deep: ["pytorch", "tensorflow", "yolov8", "llama"],
  vision: ["yolov8", "opencv", "mobilenet", "object"],
  computer: ["vision", "yolov8", "opencv", "mobilenet"],
  cv: ["yolov8", "opencv", "vision", "mobilenet"],
  web: ["react", "node", "frontend", "web", "interfaces"],
  frontend: ["react", "tailwind", "html", "css", "interfaces"],
  backend: ["node", "express", "flask", "api", "mysql"],
  fullstack: ["react", "node", "mysql", "full"],
  robot: ["robots", "webots", "mqtt", "pathfinding", "delivery"],
  robotics: ["robots", "webots", "mqtt", "pathfinding", "delivery"],
  signal: ["ecg", "eeg", "hrv", "filter", "signals"],
  health: ["ecg", "eeg", "clinic", "telemedicine", "anaesthesia", "patient"],
  database: ["mysql", "postgresql", "mongodb", "firebase", "sql"],
  sql: ["mysql", "postgresql"],
  js: ["javascript", "react", "node"],
  realtime: ["real", "websocket", "socket", "mqtt"],
};

const stop = new Set(["and", "the", "for", "with", "of", "a", "an", "in", "on", "to", "or", "&"]);

const tokenize = (s: string) =>
  s
    .toLowerCase()
    .replace(/full-stack/g, "fullstack")
    .replace(/real-time/g, "realtime")
    .split(/[^a-z0-9+#]+/)
    .filter((t) => t.length > 1 && !stop.has(t));

export type Hit = { doc: Doc; score: number; terms: string[] };

export function retrieve(query: string, k = 5): Hit[] {
  const q = tokenize(query);
  if (!q.length) return [];

  const hits: Hit[] = docs.map((doc) => {
    const titleTokens = tokenize(doc.title);
    const textTokens = tokenize(doc.text);
    const matched = new Set<string>();
    let sum = 0;

    for (const term of q) {
      const expansions = [term, ...(synonyms[term] ?? [])];
      let best = 0;
      for (const e of expansions) {
        const direct = e === term;
        const match = (t: string) => t === e || (e.length >= 3 && t.startsWith(e));
        // A direct word match is worth more than a synonym; the title more than the body.
        const inTitle = titleTokens.some(match);
        const inText = textTokens.some(match);
        const w = inTitle ? 1 : inText ? 0.75 : 0;
        const val = w * (direct ? 1 : 0.8);
        if (val > 0) matched.add(e);
        best = Math.max(best, val);
      }
      sum += best;
    }

    return { doc, score: sum / q.length, terms: [...matched] };
  });

  return hits
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
