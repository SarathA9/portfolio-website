/**
 * Small animated line illustrations for the project cards, one per project.
 * Motion is pure CSS (see "Project art" in globals.css) and stops for reduced motion.
 */
const stroke = {
  fill: "none",
  stroke: "url(#pa)",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Defs() {
  return (
    <defs>
      <linearGradient id="pa" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#8ea6ff" />
        <stop offset="1" stopColor="#b69cff" />
      </linearGradient>
    </defs>
  );
}

// A sine wave whose period divides the scroll distance, so the loop is seamless
function wave(y: number, amp: number, period: number) {
  const pts: string[] = [];
  for (let x = -period; x <= 320 + period; x += 3) {
    pts.push(`${x},${(y + Math.sin((x / period) * Math.PI * 2) * amp).toFixed(1)}`);
  }
  return pts.join(" ");
}

export default function ProjectArt({ name }: { name: string }) {
  const n = name.toLowerCase();
  return (
    <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" className="pa">
      <Defs />

      {n.includes("neuro") && (
        // EEG channels flowing past, with a live read-out dot
        <g>
          <polyline className="pa-wave pa-w1" points={wave(34, 8, 40)} {...stroke} opacity="0.45" />
          <polyline className="pa-wave pa-w2" points={wave(60, 16, 80)} {...stroke} />
          <polyline className="pa-wave pa-w3" points={wave(86, 7, 32)} {...stroke} opacity="0.45" />
          <line x1="236" y1="16" x2="236" y2="104" stroke="#8ea6ff" strokeWidth="1" opacity="0.35" />
          <circle className="pa-pulse" cx="236" cy="60" r="4" fill="#e9edff" />
        </g>
      )}

      {n.includes("traffic") && (
        // cars drive up the road while the detector boxes track them
        <g>
          <path d="M120 120 150 14M200 120 170 14" {...stroke} opacity="0.4" />
          <line className="pa-lane" x1="160" y1="120" x2="160" y2="14" stroke="#8ea6ff" strokeWidth="1.6" opacity="0.5" />
          <g className="pa-car pa-c1">
            <rect x="132" y="86" width="26" height="18" rx="3" {...stroke} />
            <text x="132" y="82" fontSize="8" fill="#8ea6ff">car 0.94</text>
          </g>
          <g className="pa-car pa-c2">
            <rect x="164" y="86" width="22" height="16" rx="3" {...stroke} />
            <text x="164" y="82" fontSize="8" fill="#b69cff">car 0.88</text>
          </g>
          <text className="pa-count" x="224" y="28" fontSize="9" fill="#c9cdd8">density: medium</text>
        </g>
      )}

      {n.includes("nirikshaka") && (
        // a scanner sweeps the frame and locks onto the object
        <g>
          <g className="pa-corners">
            <path d="M118 22h-14v14M202 22h14v14M118 98h-14V84M202 98h14V84" {...stroke} />
          </g>
          <circle cx="160" cy="60" r="20" {...stroke} opacity="0.85" />
          <path d="M148 56a12 12 0 0 1 12-10" {...stroke} opacity="0.6" />
          <line className="pa-scan" x1="104" y1="24" x2="216" y2="24" stroke="#b69cff" strokeWidth="1.4" />
          <text className="pa-label" x="224" y="64" fontSize="9" fill="#8ea6ff">apple 0.91</text>
        </g>
      )}

      {n.includes("learning") && (
        // course cards fan out, the play button breathes, progress fills
        <g>
          <rect className="pa-card pa-k1" x="96" y="34" width="72" height="50" rx="6" {...stroke} opacity="0.45" />
          <rect className="pa-card pa-k2" x="124" y="26" width="72" height="50" rx="6" {...stroke} opacity="0.7" />
          <g className="pa-card pa-k3">
            <rect x="152" y="18" width="72" height="50" rx="6" {...stroke} />
            <path className="pa-play" d="M182 34v18l15-9-15-9Z" {...stroke} />
          </g>
          <path d="M96 100h128" {...stroke} opacity="0.25" />
          <path className="pa-progress" d="M96 100h128" {...stroke} />
        </g>
      )}

      {n.includes("clinic") && (
        // a heartbeat traced across the monitor
        <g>
          <polyline points="20,64 120,64 134,64 142,40 152,88 162,30 172,72 180,64 300,64" {...stroke} opacity="0.18" />
          <polyline className="pa-ecg" points="20,64 120,64 134,64 142,40 152,88 162,30 172,72 180,64 300,64" {...stroke} />
          <g className="pa-cross">
            <rect x="244" y="22" width="32" height="32" rx="8" {...stroke} opacity="0.5" />
            <path d="M260 30v16M252 38h16" {...stroke} />
          </g>
        </g>
      )}
    </svg>
  );
}
