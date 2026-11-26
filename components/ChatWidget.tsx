"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import Robot from "./Robot";

/**
 * "Ask my AI": a retrieval-augmented chat about Sarath.
 * Streams answers from /api/chat, shows numbered citations that link to the
 * source documents, and an expandable trace of how each answer was retrieved
 * (BM25 rank and the RFC poisoning check from Sarath's research).
 * Open it from anywhere with: window.dispatchEvent(new Event("sa:open-chat"))
 */

type Source = { id: string; title: string; href: string; score: number; rfc: number; flagged: boolean; snippet: string };
type Msg = { role: "user" | "assistant"; content: string; sources?: Source[]; mode?: string; pending?: boolean; error?: boolean };

const SUGGESTIONS = [
  "What is Sarath's RAG backdoor research about?",
  "Which projects show his full-stack skills?",
  "What robotics work has he done?",
  "Is he available for a Werkstudent role?",
];
const STORE = "sa-chat-v1";

// minimal markdown: paragraphs, "- " bullets, **bold**, and [n] citations
function Rich({ text, sources, onCite }: { text: string; sources?: Source[]; onCite: (i: number) => void }) {
  const inline = (s: string, key: string) =>
    s.split(/(\*\*[^*]+\*\*|\[\d+\])/g).map((part, i) => {
      const k = `${key}-${i}`;
      if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={k}>{part.slice(2, -2)}</strong>;
      const m = part.match(/^\[(\d+)\]$/);
      if (m) {
        const n = Number(m[1]);
        const src = sources?.filter((x) => !x.flagged)[n - 1];
        return (
          <button key={k} type="button" className="cite" onClick={() => onCite(n)} title={src?.title} aria-label={`Source ${n}${src ? `: ${src.title}` : ""}`}>
            {n}
          </button>
        );
      }
      return <Fragment key={k}>{part}</Fragment>;
    });

  const blocks = text.split(/\n{2,}/);
  return (
    <>
      {blocks.map((b, bi) => {
        const lines = b.split("\n").filter(Boolean);
        if (lines.length && lines.every((l) => /^\s*[-*•]\s+/.test(l))) {
          return (
            <ul key={bi}>
              {lines.map((l, li) => (
                <li key={li}>{inline(l.replace(/^\s*[-*•]\s+/, ""), `${bi}-${li}`)}</li>
              ))}
            </ul>
          );
        }
        return <p key={bi}>{inline(b, `${bi}`)}</p>;
      })}
    </>
  );
}

function Trace({ sources, open: openAt }: { sources: Source[]; open: number | null }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (openAt !== null) setOpen(true);
  }, [openAt]);
  const used = sources.filter((s) => !s.flagged);
  const flagged = sources.length - used.length;
  return (
    <div className="trace">
      <button type="button" className="trace-toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden style={{ transform: open ? "rotate(90deg)" : "none" }}>
          <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        How this answer was made
        <span className="trace-sum">
          {sources.length} passages retrieved, RFC guard {flagged ? `flagged ${flagged}` : "passed all"}
        </span>
      </button>
      {open && (
        <ol className="trace-list">
          {sources.map((s) => {
            const n = s.flagged ? null : used.indexOf(s) + 1;
            return (
              <li key={s.id} className={`${s.flagged ? "is-flagged" : ""}${n === openAt ? " is-hot" : ""}`}>
                <div className="trace-row">
                  <span className="trace-n">{n ?? "×"}</span>
                  <a href={s.href} target={s.href.startsWith("http") || s.href.endsWith(".pdf") ? "_blank" : undefined} rel="noopener">
                    {s.title}
                  </a>
                  <span className="trace-score" title="BM25 relevance, relative to the best match">
                    <span className="trace-bar" aria-hidden>
                      <span style={{ transform: `scaleX(${s.score})` }} />
                    </span>
                    {s.score.toFixed(2)}
                  </span>
                </div>
                <p className="trace-snippet">{s.snippet}…</p>
                <p className="trace-rfc">
                  RFC {s.rfc >= 0 ? "+" : ""}
                  {s.rfc.toFixed(3)} {s.flagged ? "· flagged as a possible poisoned passage, kept out of the prompt" : ""}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [hot, setHot] = useState<{ msg: number; n: number } | null>(null);
  const abort = useRef<AbortController | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);

  // restore the conversation for this browser session
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORE);
      if (saved) setMsgs(JSON.parse(saved));
    } catch {}
    const onOpen = () => setOpen(true);
    window.addEventListener("sa:open-chat", onOpen);
    return () => window.removeEventListener("sa:open-chat", onOpen);
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(STORE, JSON.stringify(msgs.filter((m) => !m.pending)));
    } catch {}
  }, [msgs]);

  useEffect(() => {
    if (open) {
      document.documentElement.classList.add("chat-open");
      setTimeout(() => field.current?.focus(), 250);
    } else document.documentElement.classList.remove("chat-open");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        launcher.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // keep the newest text in view while streaming
  useEffect(() => {
    const el = list.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 140;
    if (nearBottom) el.scrollTop = el.scrollHeight;
  }, [msgs]);

  const send = useCallback(
    async (text: string) => {
      const q = text.trim().slice(0, 600);
      if (!q || busy) return;
      setInput("");
      setBusy(true);
      const history = [...msgs.filter((m) => !m.error), { role: "user" as const, content: q }];
      setMsgs([...history, { role: "assistant", content: "", pending: true }]);
      requestAnimationFrame(() => list.current && (list.current.scrollTop = list.current.scrollHeight));

      const ctrl = new AbortController();
      abort.current = ctrl;
      const patch = (fn: (m: Msg) => Msg) =>
        setMsgs((cur) => {
          const next = cur.slice();
          next[next.length - 1] = fn(next[next.length - 1]);
          return next;
        });

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
          signal: ctrl.signal,
        });
        if (!res.ok || !res.body) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "The assistant is unavailable right now.");
        }
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.trim()) continue;
            const ev = JSON.parse(line);
            if (ev.type === "sources") patch((m) => ({ ...m, sources: ev.sources }));
            else if (ev.type === "token") patch((m) => ({ ...m, content: m.content + ev.t }));
            else if (ev.type === "done") patch((m) => ({ ...m, pending: false, mode: ev.mode }));
          }
        }
        patch((m) => ({ ...m, pending: false }));
      } catch (e) {
        if (ctrl.signal.aborted) patch((m) => ({ ...m, pending: false, content: m.content || "Stopped." }));
        else
          patch((m) => ({
            ...m,
            pending: false,
            error: true,
            content: e instanceof Error ? e.message : "Something went wrong. Please try again.",
          }));
      } finally {
        setBusy(false);
        abort.current = null;
      }
    },
    [busy, msgs]
  );

  const lastMsg = msgs[msgs.length - 1];
  const robotState: "idle" | "think" | "talk" = !busy ? "idle" : lastMsg?.content ? "talk" : "think";

  const reset = () => {
    abort.current?.abort();
    setMsgs([]);
    setHot(null);
    field.current?.focus();
  };

  return (
    <>
      <button
        ref={launcher}
        type="button"
        className={`chat-launch${open ? " is-hidden" : ""}`}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="chat-launch-icon">
          <Robot size={34} />
        </span>
        <span className="chat-launch-text">Ask my AI</span>
      </button>

      <div className={`chat-scrim${open ? " is-open" : ""}`} onClick={() => setOpen(false)} aria-hidden />

      <section
        className={`chat${open ? " is-open" : ""}`}
        role="dialog"
        aria-modal="false"
        aria-label="Ask about Sarath"
        aria-hidden={!open}
        {...(!open ? { inert: true } : {})}
      >
        <header className="chat-head">
          <span className="chat-avatar">
            <Robot size={40} state={robotState} />
            <span className="chat-online" aria-hidden />
          </span>
          <div className="chat-title">
            <h2>Sarath’s AI assistant</h2>
            <p>{busy ? (lastMsg?.content ? "Answering…" : "Searching his documents…") : "Answers from his CV and reports"}</p>
          </div>
          {msgs.length > 0 && (
            <button type="button" className="chat-icon-btn" onClick={reset} aria-label="Start a new conversation" title="New conversation">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          <button type="button" className="chat-icon-btn" onClick={() => setOpen(false)} aria-label="Close chat">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
              <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="chat-body" ref={list} data-lenis-prevent aria-live="polite">
          {msgs.length === 0 ? (
            <div className="chat-empty">
              <span className="chat-empty-mark">
                <Robot size={76} />
              </span>
              <p className="chat-empty-title">Hi! Ask me anything about Sarath’s work.</p>
              <p className="chat-empty-sub">
                I search his CV, research reports and projects, then answer with numbered sources you can open.
              </p>
              <div className="chat-sugs">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            msgs.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="msg msg-user">
                  <p>{m.content}</p>
                </div>
              ) : (
                <div key={i} className={`msg msg-ai${m.error ? " is-error" : ""}`}>
                  {m.pending && !m.content ? (
                    <div className="typing" aria-label={m.sources ? "Writing the answer" : "Searching Sarath’s documents"}>
                      <Robot size={30} state="think" />
                      <em>{m.sources ? "Writing…" : "Searching documents…"}</em>
                    </div>
                  ) : (
                    <div className={`msg-text${m.pending ? " is-streaming" : ""}`}>
                      <Rich text={m.content} sources={m.sources} onCite={(n) => setHot({ msg: i, n })} />
                    </div>
                  )}
                  {m.mode === "extractive" && !m.pending && (
                    <p className="msg-note">Quoted directly from the sources (AI writing is offline).</p>
                  )}
                  {m.sources && m.sources.length > 0 && !m.pending && (
                    <Trace sources={m.sources} open={hot && hot.msg === i ? hot.n : null} />
                  )}
                </div>
              )
            )
          )}
        </div>

        <form
          className="chat-input"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <textarea
            ref={field}
            rows={1}
            value={input}
            maxLength={600}
            placeholder="Ask about his research, projects or skills"
            aria-label="Your question"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
          />
          {busy ? (
            <button type="button" className="chat-send" onClick={() => abort.current?.abort()} aria-label="Stop the answer">
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
                <rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" />
              </svg>
            </button>
          ) : (
            <button type="submit" className="chat-send" disabled={!input.trim()} aria-label="Send">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                <path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </form>
        <p className="chat-foot">Retrieval-augmented with Sarath’s RFC poisoning check. AI can make mistakes; sources are linked.</p>
      </section>
    </>
  );
}
