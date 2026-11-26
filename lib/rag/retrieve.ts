// Retrieval for the portfolio chat.
//
// 1. Corpus: passages from the report PDFs and the CV (lib/rag/corpus.json, built by
//    scripts/build_rag_corpus.py) plus the structured site content in lib/data.ts.
// 2. Ranking: Okapi BM25 with light stemming, English/German stop words and a small
//    query-expansion table, with a bonus for words that appear in the passage title.
// 3. RFC guard: Sarath's Rank-Faithfulness Consistency check applied to the top-k.
//    A passage whose relevance to the query is far higher than its similarity to the
//    other retrieved passages is flagged as a possible poisoned document and kept out
//    of the prompt. On this trusted corpus it rarely fires; it is here as a live demo
//    of the defence from the RFC report.

import corpus from "./corpus.json";
import { about, experience, projects, research, skills, education, profile } from "../data";

export type Passage = { id: string; title: string; href: string; text: string; trusted?: boolean };
export type Retrieved = Passage & { score: number; rfc: number; flagged: boolean };


const site: Passage[] = [
  {
    id: "profile",
    title: "Profile",
    href: "#about",
    text: `${profile.name}. ${profile.role}. Based in ${profile.location}. Email ${profile.email}. ${about.intro.join(" ")} Focus areas: ${about.focus.join(", ")}. Languages: English (C1, business fluent), German (A2, learning), Malayalam (native). Looking for a working-student (Werkstudent) or internship role in AI or software.`,
  },
  ...experience.map((e) => ({
    id: `exp:${e.company}`,
    title: `Experience: ${e.role}, ${e.company}`,
    href: "#experience",
    text: `${e.role} at ${e.company}, ${e.location}, ${e.period}. ${e.points.join(" ")}`,
  })),
  ...research.map((r) => ({
    id: `research:${r.title}`,
    title: `Research: ${r.title}`,
    href: r.links.find((l) => l.href.endsWith(".pdf"))?.href ?? "#research",
    text: `${r.venue}, ${r.date}. Headline result: ${r.result}. ${r.summary} ${r.highlights.join(". ")}. Tools: ${r.tags.join(", ")}.`,
  })),
  ...projects.map((p) => ({
    id: `project:${p.title}`,
    title: `Project: ${p.title}`,
    href: p.href,
    text: `${p.title}, ${p.kind}. ${p.blurb} Built with ${p.tags.join(", ")}.`,
  })),
  {
    id: "skills",
    title: "Skills",
    href: "#skills",
    text: skills.map((g) => `${g.name}: ${g.items.join(", ")}.`).join(" "),
  },
  ...education.map((e) => ({
    id: `edu:${e.degree}`,
    title: `Education: ${e.degree}`,
    href: "#education",
    text: `${e.degree} at ${e.school}, ${e.location}, ${e.period}.${e.note ? ` ${e.note}.` : ""}`,
  })),
];

// Curated site content is trusted; text extracted from documents is what the RFC guard checks,
// just as a real deployment would trust its own records but screen ingested documents.
export const passages: Passage[] = [...site.map((p) => ({ ...p, trusted: true })), ...(corpus as Passage[])];

// ---------- text processing ----------
const STOP = new Set(
  (
    "a an and are as at be but by can do does did for from has have he his how i in into is it its of on or " +
    "she so than that the their them then there these they this to was were what when where which who why will with " +
    "you your about tell me sarath sarath's adukkadukkam his him does did any some much many " +
    "der die das und ist ein eine zu den dem des mit von im für auf als bei wie was hat er sie es"
  ).split(" ")
);

const EXPAND: Record<string, string[]> = {
  llm: ["llama", "rag", "qlora", "language"],
  rag: ["retrieval", "faiss", "passage", "corpus"],
  security: ["backdoor", "poison", "defense", "defence", "attack"],
  backdoor: ["poison", "trigger", "attack"],
  ml: ["machine", "learning"],
  ai: ["machine", "learning", "model"],
  robot: ["rosbot", "webots", "navigation", "lidar"],
  robotics: ["rosbot", "webots", "navigation", "lidar", "mqtt"],
  vision: ["yolov8", "opencv", "detection"],
  web: ["react", "node", "frontend"],
  frontend: ["react", "tailwind", "css"],
  backend: ["node", "express", "flask", "api"],
  database: ["mysql", "postgresql", "mongodb"],
  german: ["deutsch", "a2"],
  language: ["english", "german", "malayalam"],
  languages: ["english", "german", "malayalam"],
  job: ["werkstudent", "internship", "role"],
  experience: ["intern", "freelance", "developer"],
  contact: ["email"],
  ecg: ["anaesthesia", "hrv", "butterworth"],
  signal: ["ecg", "filter", "hrv"],
  study: ["master", "oth", "education"],
  studies: ["master", "oth", "education"],
  education: ["master", "bachelor", "degree"],
  result: ["accuracy", "auc", "error"],
  results: ["accuracy", "auc", "error"],
  internship: ["intern", "praktikant"],
  intern: ["internship", "praktikant"],
  supervisor: ["professor", "prof", "submitted"],
  professor: ["prof", "submitted"],
};

// the query is stemmed before lookup, so the table is keyed by stems too
let EXPAND_STEMMED: Map<string, string[]> | null = null;
function expansions(stemmed: string) {
  if (!EXPAND_STEMMED) {
    EXPAND_STEMMED = new Map();
    for (const [k, v] of Object.entries(EXPAND)) {
      const key = stem(k);
      EXPAND_STEMMED.set(key, [...(EXPAND_STEMMED.get(key) ?? []), ...v]);
    }
  }
  return EXPAND_STEMMED.get(stemmed) ?? [];
}

function stem(w: string) {
  return w
    .replace(/(ies)$/, "y")
    .replace(/(ing|ed|es|s|ung|en)$/, "")
    .slice(0, 12);
}

export function tokens(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9+#.]+/)
    .map((t) => t.replace(/^\.+|\.+$/g, ""))
    .filter((t) => t.length > 1 && !STOP.has(t))
    .map(stem);
}

// ---------- BM25 index (built once per server instance) ----------
const K1 = 1.4;
const B = 0.72;
const docTokens = passages.map((p) => tokens(p.text));
const titleTokens = passages.map((p) => new Set(tokens(p.title)));
const tf = docTokens.map((ts) => {
  const m = new Map<string, number>();
  ts.forEach((t) => m.set(t, (m.get(t) ?? 0) + 1));
  return m;
});
const df = new Map<string, number>();
tf.forEach((m) => m.forEach((_, t) => df.set(t, (df.get(t) ?? 0) + 1)));
const N = passages.length;
const avgLen = docTokens.reduce((a, d) => a + d.length, 0) / N;
export const idf = (t: string) => {
  const n = df.get(t) ?? 0;
  return Math.log(1 + (N - n + 0.5) / (n + 0.5));
};

function bm25(q: Map<string, number>, i: number) {
  let s = 0;
  const len = docTokens[i].length;
  q.forEach((w, t) => {
    const f = tf[i].get(t);
    if (!f) return;
    s += w * idf(t) * ((f * (K1 + 1)) / (f + K1 * (1 - B + (B * len) / avgLen)));
    if (titleTokens[i].has(t)) s += w * idf(t) * 0.6;
  });
  return s;
}

// ---------- RFC guard ----------
function tfidfVec(ts: string[]) {
  const v = new Map<string, number>();
  ts.forEach((t) => v.set(t, (v.get(t) ?? 0) + idf(t)));
  let n = 0;
  v.forEach((x) => (n += x * x));
  n = Math.sqrt(n) || 1;
  v.forEach((x, t) => v.set(t, x / n));
  return v;
}
function dot(a: Map<string, number>, b: Map<string, number>) {
  let s = 0;
  const [sm, lg] = a.size < b.size ? [a, b] : [b, a];
  sm.forEach((x, t) => (s += x * (lg.get(t) ?? 0)));
  return s;
}

/** Ranks passages for a query and runs the RFC check over the top k. */
export function retrieve(query: string, k = 6): Retrieved[] {
  const q = new Map<string, number>();
  for (const t of tokens(query)) {
    q.set(t, (q.get(t) ?? 0) + 1);
    for (const e of expansions(t)) {
      const s = stem(e);
      if (!q.has(s)) q.set(s, 0.45);
    }
  }
  if (!q.size) return [];

  const ranked = passages
    .map((p, i) => ({ i, score: bm25(q, i) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k + 2);
  if (!ranked.length) return [];

  // RFC: relevance to the query minus similarity to the rest of the retrieved context
  const qv = tfidfVec([...q.keys()]);
  const vecs = ranked.map((r) => tfidfVec(docTokens[r.i]));
  const rfc = vecs.map((v, j) => {
    const rel = dot(qv, v);
    const others = vecs.filter((_, o) => o !== j);
    const ctx = others.reduce((a, o) => a + dot(v, o), 0) / Math.max(1, others.length);
    return rel - ctx;
  });
  const mean = rfc.reduce((a, b) => a + b, 0) / rfc.length;
  const sd = Math.sqrt(rfc.reduce((a, b) => a + (b - mean) ** 2, 0) / rfc.length) || 1;

  const top = ranked[0].score;
  const strong = ranked.filter((r) => r.score / top > 0.5).length;
  return ranked
    .map((r, j) => ({
      ...passages[r.i],
      score: r.score / top, // 1.0 for the best match
      rfc: rfc[j],
      // Flag only an outlier that is highly relevant yet unlike several other strong
      // matches. With a single strong match there is no context to compare against
      // (the limitation noted in the RFC report), so nothing is flagged.
      flagged: !passages[r.i].trusted && strong >= 3 && (rfc[j] - mean) / sd > 2.3 && r.score / top > 0.75,
    }))
    .slice(0, k);
}
