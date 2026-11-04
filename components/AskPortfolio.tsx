"use client";

import { useMemo, useState } from "react";
import { retrieve } from "@/lib/search";

const suggestions = ["LLM security", "React and Node", "Computer vision", "Robotics", "Signal processing"];

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (!terms.length) return <>{text}</>;
  const re = new RegExp(`\\b(${terms.map(escapeRe).join("|")})[\\w.-]*`, "gi");
  const parts: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(<mark key={m.index}>{m[0]}</mark>);
    last = m.index + m[0].length;
  }
  parts.push(text.slice(last));
  return <>{parts}</>;
}

function snippet(text: string, terms: string[], len = 150) {
  const lower = text.toLowerCase();
  const first = terms
    .map((t) => lower.search(new RegExp(`\\b${escapeRe(t)}`)))
    .filter((i) => i >= 0)
    .sort((a, b) => a - b)[0];
  const start = first && first > 60 ? text.lastIndexOf(" ", first - 40) + 1 : 0;
  const end = Math.min(text.length, start + len);
  const cut = text.slice(start, end);
  return `${start > 0 ? "…" : ""}${cut.slice(0, end < text.length ? cut.lastIndexOf(" ") : undefined)}${end < text.length ? "…" : ""}`;
}

export default function AskPortfolio() {
  const [query, setQuery] = useState("LLM security");
  const hits = useMemo(() => retrieve(query, 5), [query]);
  const inputId = "ask-input";

  return (
    <div className="ask">
      <div className="ask-head">
        <label htmlFor={inputId} className="ask-label">
          Search my work
        </label>
        <span className="ask-hint">Top 5 results, ranked by relevance</span>
      </div>

      <div className="ask-field">
        <svg aria-hidden viewBox="0 0 24 24" width="20" height="20">
          <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try a skill or topic, like Python or robotics"
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      <div className="ask-chips" role="group" aria-label="Example searches">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            className="chip"
            aria-pressed={query === s}
            onClick={() => setQuery(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <ol className="ask-results" aria-live="polite">
        {query.trim() && hits.length === 0 && (
          <li className="ask-empty">
            Nothing matched “{query}”. Try a skill like Python, or a topic like robotics.
          </li>
        )}
        {hits.map((h, i) => (
          <li key={h.doc.id} className="hit" style={{ animationDelay: `${i * 40}ms` }}>
            <a href={h.doc.href}>
              <span className="hit-rank">{i + 1}</span>
              <span className="hit-body">
                <span className="hit-title">
                  <Highlight text={h.doc.title} terms={h.terms} />
                </span>
                <span className="hit-snippet">
                  <Highlight text={snippet(h.doc.text, h.terms)} terms={h.terms} />
                </span>
              </span>
              <span className="hit-meta">
                <span className="hit-kind">{h.doc.kind}</span>
                <span className="hit-score" aria-label={`Match ${h.score.toFixed(2)}`}>
                  <span className="bar" aria-hidden>
                    <span style={{ width: `${Math.round(h.score * 100)}%` }} />
                  </span>
                  {h.score.toFixed(2)}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}
