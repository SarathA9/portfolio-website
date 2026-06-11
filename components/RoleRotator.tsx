"use client";

import { useEffect, useState } from "react";

/** Choose "a" or "an" based on the role's first sound. */
function withArticle(role: string) {
  const first = role.trim()[0]?.toLowerCase() ?? "";
  const article = "aeiou".includes(first) ? "an" : "a";
  return `${article} ${role}`;
}

/** Typewriter that cycles through a list of roles. */
export default function RoleRotator({ roles }: { roles: string[] }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const full = withArticle(roles[index % roles.length]);
    let delay = deleting ? 45 : 80;

    if (!deleting && text === full) {
      delay = 1500; // pause at full word
      const t = setTimeout(() => setDeleting(true), delay);
      return () => clearTimeout(t);
    }
    if (deleting && text === "") {
      setDeleting(false);
      setIndex((i) => (i + 1) % roles.length);
      return;
    }

    const t = setTimeout(() => {
      setText((prev) =>
        deleting ? full.slice(0, prev.length - 1) : full.slice(0, prev.length + 1)
      );
    }, delay);
    return () => clearTimeout(t);
  }, [text, deleting, index, roles]);

  return (
    <span className="text-gradient-cyan">
      {text}
      <span className="ml-0.5 inline-block w-[2px] animate-pulse bg-cyan align-middle" style={{ height: "1em" }} />
    </span>
  );
}
