/**
 * A small animated robot for the "Ask my AI" assistant.
 * state: "idle"  floats, blinks and glances around
 *        "think" eyes scan left and right, antenna pulses fast (searching documents)
 *        "talk"  mouth moves (answer streaming)
 * All motion is CSS (see "Robot" in globals.css) and stops for reduced motion.
 */
export default function Robot({ size = 40, state = "idle" }: { size?: number; state?: "idle" | "think" | "talk" }) {
  return (
    <svg className={`robot robot-${state}`} viewBox="0 0 64 64" width={size} height={size} aria-hidden>
      <defs>
        <linearGradient id="rb-head" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3f5fb" />
          <stop offset="1" stopColor="#c3c9da" />
        </linearGradient>
        <linearGradient id="rb-visor" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#151a2b" />
          <stop offset="1" stopColor="#0a0d16" />
        </linearGradient>
        <radialGradient id="rb-glow">
          <stop offset="0" stopColor="#b9c6ff" />
          <stop offset="1" stopColor="#8ea6ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="rb-body">
        {/* antenna */}
        <line x1="32" y1="9" x2="32" y2="16" stroke="#c3c9da" strokeWidth="2.4" strokeLinecap="round" />
        <circle className="rb-light-glow" cx="32" cy="7.5" r="6" fill="url(#rb-glow)" />
        <circle className="rb-light" cx="32" cy="7.5" r="3.2" fill="#8ea6ff" />
        {/* ears */}
        <rect x="6.5" y="27" width="6" height="13" rx="3" fill="#aeb5c9" />
        <rect x="51.5" y="27" width="6" height="13" rx="3" fill="#aeb5c9" />
        {/* head */}
        <rect x="10.5" y="15" width="43" height="36" rx="13" fill="url(#rb-head)" />
        {/* visor */}
        <rect x="15.5" y="21" width="33" height="21" rx="9" fill="url(#rb-visor)" />
        <rect x="17" y="22.3" width="18" height="3" rx="1.5" fill="#fff" opacity="0.08" />
        {/* eyes */}
        <g className="rb-eyes">
          <rect className="rb-eye" x="22" y="27" width="6" height="8" rx="3" fill="#9fb3ff" />
          <rect className="rb-eye" x="36" y="27" width="6" height="8" rx="3" fill="#9fb3ff" />
        </g>
        {/* mouth: three bars that bounce while talking */}
        <g className="rb-mouth">
          <rect x="27.5" y="45" width="2.6" height="2.6" rx="1.3" fill="#7b8299" />
          <rect x="30.7" y="45" width="2.6" height="2.6" rx="1.3" fill="#7b8299" />
          <rect x="33.9" y="45" width="2.6" height="2.6" rx="1.3" fill="#7b8299" />
        </g>
      </g>
    </svg>
  );
}
